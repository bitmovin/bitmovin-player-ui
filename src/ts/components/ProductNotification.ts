import { Component, ComponentConfig } from './Component';
import { DOM } from '../DOM';
import { UIInstanceManager } from '../UIManager';
import { PlayerAPI } from 'bitmovin-player';
import { EventDispatcher, NoArgs, Event } from '../EventDispatcher';

/**
 * Single product entry shown by {@link ProductNotification}.
 *
 * @category Configs
 */
export interface ProductInfo {
  /**
   * Product title displayed when the notification is expanded.
   */
  title: string;
  /**
   * Description text shown below the title.
   */
  description?: string;
  /**
   * URL of a thumbnail image to render on the left of the popup.
   */
  imageUrl?: string;
  /**
   * Optional price text (e.g. "$19.99").
   */
  price?: string;
  /**
   * Text on the call-to-action button. Defaults to "Buy now".
   */
  ctaText?: string;
  /**
   * URL that the call-to-action button opens in a new tab when clicked.
   */
  ctaUrl?: string;
}

/**
 * Time-driven trigger for showing a product automatically based on playback position.
 *
 * @category Configs
 */
export interface ProductTrigger {
  /**
   * Playback time in seconds at which the notification should appear.
   */
  startTime: number;
  /**
   * Playback time in seconds at which the notification should disappear.
   */
  endTime: number;
  /**
   * Product to display while the trigger is active. Can be a static {@link ProductInfo}
   * or a function that returns one (or a Promise of one). Use the function form to fetch
   * product details lazily from a backend when the trigger window opens.
   */
  product: ProductInfo | (() => ProductInfo | Promise<ProductInfo>);
  /**
   * If true the popup auto-expands into the product card after the icon appears.
   * Otherwise it stays as a collapsed icon that the viewer can click to expand.
   * Defaults to false.
   */
  autoExpand?: boolean;
  /**
   * Delay in ms between the icon appearing and the popup auto-expanding into the
   * product card. Lets the viewer notice the new icon before it pops open. Only
   * applies when `autoExpand` is true. Defaults to 800.
   */
  expandAfterMs?: number;
  /**
   * If `autoExpand` is true, time in ms before the popup collapses back to an icon.
   * Defaults to 0 for trigger-driven notifications, meaning the card stays expanded
   * until the trigger's `endTime` (at which point the whole notification is dismissed).
   * Set to a positive number to collapse back to just the icon earlier.
   */
  autoCollapseAfterMs?: number;
}

/**
 * Configuration interface for {@link ProductNotification}.
 *
 * @category Configs
 */
export interface ProductNotificationConfig extends ComponentConfig {
  /**
   * Optional list of time-driven triggers. When provided, the notification will appear
   * and disappear automatically as the playback position crosses each trigger's window.
   */
  triggers?: ProductTrigger[];
}

interface ProductNotificationEventArgs extends NoArgs {
  product?: ProductInfo;
}

/**
 * An in-video product purchase notification.
 *
 * Renders as a small icon anchored to the top-right corner of the player. When activated
 * (either via a time-driven trigger or imperatively via {@link notify}), it expands into a
 * card containing the product title, description, optional image and a call-to-action
 * button. Clicking the icon toggles the expanded state; clicking the close button or
 * calling {@link dismiss} hides it again.
 *
 * Imperative API:
 *  - {@link notify} — show a one-off product, optionally auto-expand and auto-collapse
 *  - {@link expand} / {@link collapse} — toggle the expanded card
 *  - {@link dismiss} — hide the notification entirely
 *
 * Events:
 *  - {@link onNotificationShown}
 *  - {@link onNotificationExpanded}
 *  - {@link onNotificationCollapsed}
 *  - {@link onNotificationDismissed}
 *  - {@link onCtaClick}
 *
 * @category Components
 */
export class ProductNotification extends Component<ProductNotificationConfig> {
  private static readonly CLASS_EXPANDED = 'expanded';

  private iconElement: DOM;
  private cardElement: DOM;
  private titleElement: DOM;
  private descriptionElement: DOM;
  private imageElement: DOM;
  private priceElement: DOM;
  private ctaElement: DOM;
  private closeElement: DOM;

  private currentProduct: ProductInfo | null = null;
  private autoExpandTimeout: number | null = null;
  private autoCollapseTimeout: number | null = null;
  private activeTriggerIndex = -1;

  private productNotificationEvents = {
    onNotificationShown: new EventDispatcher<ProductNotification, ProductNotificationEventArgs>(),
    onNotificationExpanded: new EventDispatcher<ProductNotification, ProductNotificationEventArgs>(),
    onNotificationCollapsed: new EventDispatcher<ProductNotification, ProductNotificationEventArgs>(),
    onNotificationDismissed: new EventDispatcher<ProductNotification, NoArgs>(),
    onCtaClick: new EventDispatcher<ProductNotification, ProductNotificationEventArgs>(),
  };

  constructor(config: ProductNotificationConfig = {}) {
    super(config);

    this.config = this.mergeConfig(
      config,
      {
        cssClass: 'ui-product-notification',
        hidden: true,
        triggers: [],
      } as ProductNotificationConfig,
      this.config,
    );
  }

  protected toDomElement(): DOM {
    const root = super.toDomElement();
    const prefix = (cls: string) => this.prefixCss(cls);

    this.iconElement = new DOM('button', {
      type: 'button',
      class: prefix('product-notification-icon'),
      'aria-label': 'Show product details',
    });

    this.imageElement = new DOM('img', {
      class: prefix('product-notification-image'),
      alt: '',
    });

    this.titleElement = new DOM('div', { class: prefix('product-notification-title') });
    this.descriptionElement = new DOM('div', { class: prefix('product-notification-description') });
    this.priceElement = new DOM('div', { class: prefix('product-notification-price') });

    this.ctaElement = new DOM('button', {
      type: 'button',
      class: prefix('product-notification-cta'),
    });

    this.closeElement = new DOM('button', {
      type: 'button',
      class: prefix('product-notification-close'),
      'aria-label': 'Dismiss product notification',
    }).html('&times;');

    const textColumn = new DOM('div', { class: prefix('product-notification-body') })
      .append(this.titleElement)
      .append(this.descriptionElement)
      .append(this.priceElement)
      .append(this.ctaElement);

    this.cardElement = new DOM('div', { class: prefix('product-notification-card') })
      .append(this.imageElement)
      .append(textColumn)
      .append(this.closeElement);

    root.append(this.iconElement).append(this.cardElement);

    this.iconElement.on('click', e => {
      e.stopPropagation();
      // Clicking the icon only opens the card. The card can be closed
      // exclusively via the explicit close button (see closeElement).
      if (!this.isExpanded()) {
        this.expand();
      }
    });

    this.closeElement.on('click', e => {
      e.stopPropagation();
      this.dismiss();
    });

    this.ctaElement.on('click', e => {
      e.stopPropagation();
      this.onCtaClickEvent();
      const url = this.currentProduct && this.currentProduct.ctaUrl;
      if (url) {
        window.open(url, '_blank');
      }
    });

    return root;
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    const triggers = this.config.triggers || [];
    if (triggers.length === 0) {
      return;
    }

    const sortedTriggers = triggers.slice().sort((a, b) => a.startTime - b.startTime);

    const evaluateTriggers = () => {
      const time = player.getCurrentTime();
      const idx = sortedTriggers.findIndex(t => time >= t.startTime && time < t.endTime);
      if (idx === this.activeTriggerIndex) {
        return;
      }
      this.activeTriggerIndex = idx;
      if (idx === -1) {
        // Trigger window ended: collapse the card back to just the icon, but keep
        // the icon visible. The notification persists until the source is unloaded
        // or `dismiss()` is called explicitly.
        this.clearAutoExpand();
        this.clearAutoCollapse();
        this.collapse();
        return;
      }

      const t = sortedTriggers[idx];
      const resolvedIdx = idx;
      const resolved = typeof t.product === 'function' ? t.product() : t.product;
      const apply = (product: ProductInfo) => {
        if (this.activeTriggerIndex !== resolvedIdx) {
          return; // trigger window already moved on, drop the stale product
        }
        this.notify(product, {
          autoExpand: t.autoExpand,
          expandAfterMs: t.expandAfterMs,
          // When driven by a trigger window, the trigger's endTime is the natural
          // collapse point. Default to 0 (no time-based auto-collapse) unless the
          // caller explicitly overrides.
          autoCollapseAfterMs: t.autoCollapseAfterMs == null ? 0 : t.autoCollapseAfterMs,
        });
      };
      if (resolved && typeof (resolved as Promise<ProductInfo>).then === 'function') {
        (resolved as Promise<ProductInfo>).then(apply);
      } else {
        apply(resolved as ProductInfo);
      }
    };

    player.on(player.exports.PlayerEvent.TimeChanged, evaluateTriggers);
    player.on(player.exports.PlayerEvent.Seeked, evaluateTriggers);
    player.on(player.exports.PlayerEvent.SourceUnloaded, () => {
      this.activeTriggerIndex = -1;
      this.dismiss();
    });
  }

  /**
   * Sets the product to display and shows the notification. The notification always
   * appears first as a collapsed icon. Pass `autoExpand: true` to have it expand into
   * the product card after `expandAfterMs` (default 800ms), and optionally collapse
   * back to the icon after `autoCollapseAfterMs` (default 5000ms).
   */
  notify(
    product: ProductInfo,
    options: { autoExpand?: boolean; expandAfterMs?: number; autoCollapseAfterMs?: number } = {},
  ): void {
    this.setProduct(product);
    this.clearAutoExpand();
    this.clearAutoCollapse();
    this.collapse();

    const wasHidden = this.isHidden();
    this.show();
    if (wasHidden) {
      this.onNotificationShownEvent();
    }

    if (options.autoExpand) {
      const expandAfter = options.expandAfterMs == null ? 800 : options.expandAfterMs;
      const collapseAfter = options.autoCollapseAfterMs == null ? 5000 : options.autoCollapseAfterMs;

      const doExpand = () => {
        this.autoExpandTimeout = null;
        this.expand();
        if (collapseAfter > 0) {
          this.autoCollapseTimeout = window.setTimeout(() => this.collapse(), collapseAfter);
        }
      };

      if (expandAfter > 0) {
        this.autoExpandTimeout = window.setTimeout(doExpand, expandAfter);
      } else {
        doExpand();
      }
    }
  }

  /**
   * Hides the notification and clears the active product.
   */
  dismiss(): void {
    this.clearAutoExpand();
    this.clearAutoCollapse();
    this.collapse();
    if (!this.isHidden()) {
      this.hide();
      this.onNotificationDismissedEvent();
    }
    this.currentProduct = null;
  }

  expand(): void {
    if (this.isExpanded()) {
      return;
    }
    this.getDomElement().addClass(this.prefixCss(ProductNotification.CLASS_EXPANDED));
    this.onNotificationExpandedEvent();
  }

  collapse(): void {
    if (!this.isExpanded()) {
      return;
    }
    this.clearAutoCollapse();
    this.getDomElement().removeClass(this.prefixCss(ProductNotification.CLASS_EXPANDED));
    this.onNotificationCollapsedEvent();
  }

  isExpanded(): boolean {
    return this.getDomElement().hasClass(this.prefixCss(ProductNotification.CLASS_EXPANDED));
  }

  setProduct(product: ProductInfo): void {
    this.currentProduct = product;

    this.titleElement.html(this.escape(product.title));

    if (product.description) {
      this.descriptionElement.html(this.escape(product.description)).css('display', '');
    } else {
      this.descriptionElement.html('').css('display', 'none');
    }

    if (product.price) {
      this.priceElement.html(this.escape(product.price)).css('display', '');
    } else {
      this.priceElement.html('').css('display', 'none');
    }

    if (product.imageUrl) {
      this.imageElement.attr('src', product.imageUrl).css('display', '');
    } else {
      this.imageElement.attr('src', '').css('display', 'none');
    }

    const ctaText = product.ctaText || 'Buy now';
    this.ctaElement.html(this.escape(ctaText));
    if (product.ctaUrl || product.ctaText) {
      this.ctaElement.css('display', '');
    } else {
      this.ctaElement.css('display', 'none');
    }
  }

  getProduct(): ProductInfo | null {
    return this.currentProduct;
  }

  private clearAutoCollapse(): void {
    if (this.autoCollapseTimeout != null) {
      window.clearTimeout(this.autoCollapseTimeout);
      this.autoCollapseTimeout = null;
    }
  }

  private clearAutoExpand(): void {
    if (this.autoExpandTimeout != null) {
      window.clearTimeout(this.autoExpandTimeout);
      this.autoExpandTimeout = null;
    }
  }

  private escape(text: string): string {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  protected onNotificationShownEvent(): void {
    this.productNotificationEvents.onNotificationShown.dispatch(this, { product: this.currentProduct });
  }

  protected onNotificationExpandedEvent(): void {
    this.productNotificationEvents.onNotificationExpanded.dispatch(this, { product: this.currentProduct });
  }

  protected onNotificationCollapsedEvent(): void {
    this.productNotificationEvents.onNotificationCollapsed.dispatch(this, { product: this.currentProduct });
  }

  protected onNotificationDismissedEvent(): void {
    this.productNotificationEvents.onNotificationDismissed.dispatch(this);
  }

  protected onCtaClickEvent(): void {
    this.productNotificationEvents.onCtaClick.dispatch(this, { product: this.currentProduct });
  }

  get onNotificationShown(): Event<ProductNotification, ProductNotificationEventArgs> {
    return this.productNotificationEvents.onNotificationShown.getEvent();
  }

  get onNotificationExpanded(): Event<ProductNotification, ProductNotificationEventArgs> {
    return this.productNotificationEvents.onNotificationExpanded.getEvent();
  }

  get onNotificationCollapsed(): Event<ProductNotification, ProductNotificationEventArgs> {
    return this.productNotificationEvents.onNotificationCollapsed.getEvent();
  }

  get onNotificationDismissed(): Event<ProductNotification, NoArgs> {
    return this.productNotificationEvents.onNotificationDismissed.getEvent();
  }

  get onCtaClick(): Event<ProductNotification, ProductNotificationEventArgs> {
    return this.productNotificationEvents.onCtaClick.getEvent();
  }
}

export interface Offset {
  left: number;
  top: number;
}

/**
 * Simple DOM manipulation and DOM element event handling modeled after jQuery (as replacement for jQuery).
 *
 * Like jQuery, DOM operates on single elements and lists of elements. For example: creating an element returns a DOM
 * instance with a single element, selecting elements returns a DOM instance with zero, one, or many elements. Similar
 * to jQuery, setters usually affect all elements, while getters operate on only the first element.
 * Also similar to jQuery, most methods (except getters) return the DOM instance facilitating easy chaining of method
 * calls.
 *
 * Built with the help of: http://youmightnotneedjquery.com/
 */
export class DOM {

  private document: Document;

  /**
   * The list of elements that the instance wraps. Take care that not all methods can operate on the whole list,
   * getters usually just work on the first element.
   */
  private elements: HTMLElement[];

  /**
   * Creates a DOM element.
   * @param tagName the tag name of the DOM element
   * @param attributes a list of attributes of the element
   */
  constructor(tagName: string, attributes: {[name: string]: string});
  /**
   * Selects all elements from the DOM that match the specified selector.
   * @param selector the selector to match DOM elements with
   */
  constructor(selector: string);
  /**
   * Wraps a plain HTMLElement with a DOM instance.
   * @param element the HTMLElement to wrap with DOM
   */
  constructor(element: HTMLElement);
  /**
   * Wraps a list of plain HTMLElements with a DOM instance.
   * @param element the HTMLElements to wrap with DOM
   */
  constructor(elements: HTMLElement[]);
  /**
   * Wraps the document with a DOM instance. Useful to attach event listeners to the document.
   * @param document the document to wrap
   */
  constructor(document: Document);
  constructor(something: string | HTMLElement | HTMLElement[] | Document, attributes?: {[name: string]: string}) {
    this.document = document; // Set the global document to the local document field

    if (something instanceof Array) {
      if (something.length > 0 && something[0] instanceof HTMLElement) {
        let elements = something;
        this.elements = elements;
      }
    }
    else if (something instanceof HTMLElement) {
      let element = something;
      this.elements = [element];
    }
    else if (something instanceof Document) {
      // When a document is passed in, we do not do anything with it, but by setting this.elements to null
      // we give the event handling method a means to detect if the events should be registered on the document
      // instead of elements.
      this.elements = null;
    }
    else if (attributes) {
      let tagName = something;
      let element = document.createElement(tagName);

      for (let attributeName in attributes) {
        let attributeValue = attributes[attributeName];
        element.setAttribute(attributeName, attributeValue);
      }

      this.elements = [element];
    }
    else {
      let selector = something;
      this.elements = this.findChildElements(selector);
    }
  }

  /**
   * Gets the number of elements that this DOM instance currently holds.
   * @returns {number} the number of elements
   */
  get length(): number {
    return this.elements ? this.elements.length : 0;
  }

  /**
   * Gets the HTML elements that this DOM instance currently holds.
   * @returns {HTMLElement[]} the raw HTML elements
   */
  getElements(): HTMLElement[] {
    return this.elements;
  }

  /**
   * A shortcut method for iterating all elements. Shorts this.elements.forEach(...) to this.forEach(...).
   * @param handler the handler to execute an operation on an element
   */
  private forEach(handler: (element: HTMLElement) => void): void {
    this.elements.forEach((element) => {
      handler(element);
    });
  }

  private findChildElementsOfElement(element: HTMLElement | Document, selector: string): HTMLElement[] {
    let childElements = element.querySelectorAll(selector);

    // Convert NodeList to Array
    // https://toddmotto.com/a-comprehensive-dive-into-nodelists-arrays-converting-nodelists-and-understanding-the-dom/
    return [].slice.call(childElements);
  }

  private findChildElements(selector: string): HTMLElement[] {
    let allChildElements = <HTMLElement[]>[];

    if (this.elements) {
      this.forEach((element) => {
        allChildElements = allChildElements.concat(this.findChildElementsOfElement(element, selector));
      });
    }
    else {
      return this.findChildElementsOfElement(document, selector);
    }

    return allChildElements;
  }

  /**
   * Finds all child elements of all elements matching the supplied selector.
   * @param selector the selector to match with child elements
   * @returns {DOM} a new DOM instance representing all matched children
   */
  find(selector: string): DOM {
    let allChildElements = this.findChildElements(selector);
    return new DOM(allChildElements);
  }

  /**
   * Returns a string of the inner HTML content of the first element.
   */
  html(): string;
  /**
   * Sets the inner HTML content of all elements.
   * @param content a string of plain text or HTML markup
   */
  html(content: string): DOM;
  html(content?: string): string | DOM {
    if (arguments.length > 0) {
      return this.setHtml(content);
    }
    else {
      return this.getHtml();
    }
  }

  private getHtml(): string | null {
    return this.elements[0].innerHTML;
  }

  private setHtml(content: string): DOM {
    if (content === undefined || content == null) {
      // Set to empty string to avoid innerHTML getting set to 'undefined' (all browsers) or 'null' (IE9)
      content = '';
    }

    this.forEach((element) => {
      element.innerHTML = content;
    });

    return this;
  }

  /**
   * Clears the inner HTML of all elements (deletes all children).
   * @returns {DOM}
   */
  empty(): DOM {
    this.forEach((element) => {
      element.innerHTML = '';
    });
    return this;
  }

  /**
   * Returns the current value of the first form element, e.g. the selected value of a select box or the text if an
   * input field.
   * @returns {string} the value of a form element
   */
  val(): string {
    let element = this.elements[0];

    if (element instanceof HTMLSelectElement || element instanceof HTMLInputElement) {
      return element.value;
    }
    else {
      // TODO add support for missing form elements
      throw new Error(`val() not supported for ${typeof element}`);
    }
  }

  /**
   * Returns the value of an attribute on the first element.
   * @param attribute
   */
  attr(attribute: string): string | null;
  /**
   * Sets an attribute on all elements.
   * @param attribute the name of the attribute
   * @param value the value of the attribute
   */
  attr(attribute: string, value: string): DOM;
  attr(attribute: string, value?: string): string | null | DOM {
    if (arguments.length > 1) {
      return this.setAttr(attribute, value);
    }
    else {
      return this.getAttr(attribute);
    }
  }

  private getAttr(attribute: string): string | null {
    return this.elements[0].getAttribute(attribute);
  }

  private setAttr(attribute: string, value: string): DOM {
    this.forEach((element) => {
      element.setAttribute(attribute, value);
    });
    return this;
  }

  /**
   * Returns the value of a data element on the first element.
   * @param dataAttribute the name of the data attribute without the 'data-' prefix
   */
  data(dataAttribute: string): string | null;
  /**
   * Sets a data attribute on all elements.
   * @param dataAttribute the name of the data attribute without the 'data-' prefix
   * @param value the value of the data attribute
   */
  data(dataAttribute: string, value: string): DOM;
  data(dataAttribute: string, value?: string): string | null | DOM {
    if (arguments.length > 1) {
      return this.setData(dataAttribute, value);
    }
    else {
      return this.getData(dataAttribute);
    }
  }

  private getData(dataAttribute: string): string | null {
    return this.elements[0].getAttribute('data-' + dataAttribute);
  }

  private setData(dataAttribute: string, value: string): DOM {
    this.forEach((element) => {
      element.setAttribute('data-' + dataAttribute, value);
    });
    return this;
  }

  /**
   * Appends one or more DOM elements as children to all elements.
   * @param childElements the chrild elements to append
   * @returns {DOM}
   */
  append(...childElements: DOM[]): DOM {
    this.forEach((element) => {
      childElements.forEach((childElement) => {
        childElement.elements.forEach((_, index) => {
          element.appendChild(childElement.elements[index]);
        });
      });
    });
    return this;
  }

  /**
   * Removes all elements from the DOM.
   */
  remove(): void {
    this.forEach((element) => {
      let parent = element.parentNode;
      if (parent) {
        parent.removeChild(element);
      }
    });
  }

  /**
   * Returns the offset of the first element from the document's top left corner.
   * @returns {Offset}
   */
  offset(): Offset {
    let element = this.elements[0];
    let elementRect = element.getBoundingClientRect();
    let htmlRect = document.body.parentElement.getBoundingClientRect();

    // Virtual viewport scroll handling (e.g. pinch zoomed viewports in mobile browsers or desktop Chrome/Edge)
    // 'normal' zooms and virtual viewport zooms (aka layout viewport) result in different
    // element.getBoundingClientRect() results:
    //  - with normal scrolls, the clientRect decreases with an increase in scroll(Top|Left)/page(X|Y)Offset
    //  - with pinch zoom scrolls, the clientRect stays the same while scroll/pageOffset changes
    // This means, that the combination of clientRect + scroll/pageOffset does not work to calculate the offset
    // from the document's upper left origin when pinch zoom is used.
    // To work around this issue, we do not use scroll/pageOffset but get the clientRect of the html element and
    // subtract it from the element's rect, which always results in the offset from the document origin.
    // NOTE: the current way of offset calculation was implemented specifically to track event positions on the
    // seek bar, and it might break compatibility with jQuery's offset() method. If this ever turns out to be a
    // problem, this method should be reverted to the old version and the offset calculation moved to the seek bar.

    return {
      top: elementRect.top - htmlRect.top,
      left: elementRect.left - htmlRect.left
    };
  }

  /**
   * Returns the width of the first element.
   * @returns {number} the width of the first element
   */
  width(): number {
    // TODO check if this is the same as jQuery's width() (probably not)
    return this.elements[0].offsetWidth;
  }

  /**
   * Returns the height of the first element.
   * @returns {number} the height of the first element
   */
  height(): number {
    // TODO check if this is the same as jQuery's height() (probably not)
    return this.elements[0].offsetHeight;
  }

  /**
   * Attaches an event handler to one or more events on all elements.
   * @param eventName the event name (or multiple names separated by space) to listen to
   * @param eventHandler the event handler to call when the event fires
   * @returns {DOM}
   */
  on(eventName: string, eventHandler: EventListenerOrEventListenerObject): DOM {
    let events = eventName.split(' ');

    events.forEach((event) => {
      if (this.elements == null) {
        this.document.addEventListener(event, eventHandler);
      }
      else {
        this.forEach((element) => {
          element.addEventListener(event, eventHandler);
        });
      }
    });

    return this;
  }

  /**
   * Removes an event handler from one or more events on all elements.
   * @param eventName the event name (or multiple names separated by space) to remove the handler from
   * @param eventHandler the event handler to remove
   * @returns {DOM}
   */
  off(eventName: string, eventHandler: EventListenerOrEventListenerObject): DOM {
    let events = eventName.split(' ');

    events.forEach((event) => {
      if (this.elements == null) {
        this.document.removeEventListener(event, eventHandler);
      }
      else {
        this.forEach((element) => {
          element.removeEventListener(event, eventHandler);
        });
      }
    });

    return this;
  }

  /**
   * Adds the specified class(es) to all elements.
   * @param className the class(es) to add, multiple classes separated by space
   * @returns {DOM}
   */
  addClass(className: string): DOM {
    this.forEach((element) => {
      if (element.classList) {
        element.classList.add(className);
      }
      else {
        element.className += ' ' + className;
      }
    });

    return this;
  }

  /**
   * Removed the specified class(es) from all elements.
   * @param className the class(es) to remove, multiple classes separated by space
   * @returns {DOM}
   */
  removeClass(className: string): DOM {
    this.forEach((element) => {
      if (element.classList) {
        element.classList.remove(className);
      }
      else {
        element.className = element.className.replace(
          new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
      }
    });

    return this;
  }

  /**
   * Checks if any of the elements has the specified class.
   * @param className the class name to check
   * @returns {boolean} true if one of the elements has the class attached, else if no element has it attached
   */
  hasClass(className: string): boolean {
    let hasClass = false;

    this.forEach((element) => {
      if (element.classList) {
        if (element.classList.contains(className)) {
          // Since we are inside a handler, we can't just 'return true'. Instead, we save it to a variable
          // and return it at the end of the function body.
          hasClass = true;
        }
      }
      else {
        if (new RegExp('(^| )' + className + '( |$)', 'gi').test(element.className)) {
          // See comment above
          hasClass = true;
        }
      }
    });

    return hasClass;
  }

  /**
   * Returns the value of a CSS property of the first element.
   * @param propertyName the name of the CSS property to retrieve the value of
   */
  css(propertyName: string): string | null;
  /**
   * Sets the value of a CSS property on all elements.
   * @param propertyName the name of the CSS property to set the value for
   * @param value the value to set for the given CSS property
   */
  css(propertyName: string, value: string): DOM;
  /**
   * Sets a collection of CSS properties and their values on all elements.
   * @param propertyValueCollection an object containing pairs of property names and their values
   */
  css(propertyValueCollection: {[propertyName: string]: string}): DOM;
  css(propertyNameOrCollection: string | {[propertyName: string]: string}, value?: string): string | null | DOM {
    if (typeof propertyNameOrCollection === 'string') {
      let propertyName = propertyNameOrCollection;

      if (arguments.length === 2) {
        return this.setCss(propertyName, value);
      }
      else {
        return this.getCss(propertyName);
      }
    }
    else {
      let propertyValueCollection = propertyNameOrCollection;
      return this.setCssCollection(propertyValueCollection);
    }
  }

  private getCss(propertyName: string): string | null {
    return getComputedStyle(this.elements[0])[<any>propertyName];
  }

  private setCss(propertyName: string, value: string): DOM {
    this.forEach((element) => {
      // <any> cast to resolve TS7015: http://stackoverflow.com/a/36627114/370252
      element.style[<any>propertyName] = value;
    });
    return this;
  }

  private setCssCollection(ruleValueCollection: {[ruleName: string]: string}): DOM {
    this.forEach((element) => {
      // http://stackoverflow.com/a/34490573/370252
      Object.assign(element.style, ruleValueCollection);
    });

    return this;
  }
}

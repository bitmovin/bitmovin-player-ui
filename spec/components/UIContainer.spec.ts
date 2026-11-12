import { UIContainer } from '../../src/ts/components/UIContainer';
import { Container } from '../../src/ts/components/Container';
import { i18n } from '../../src/ts/localization/i18n';
import { PlayerUtils } from '../../src/ts/utils/PlayerUtils';
import type { UIInstanceManager } from '../../src/ts/UIManager';
import type { TestingPlayerAPI } from '../helper/MockHelper';
import { MockHelper } from '../helper/MockHelper';
import generateDOMMock = MockHelper.generateDOMMock;
import getUiInstanceManagerMock = MockHelper.getUiInstanceManagerMock;
import getPlayerMock = MockHelper.getPlayerMock;

jest.mock('../../src/ts/DOM', generateDOMMock);

let playerMock: TestingPlayerAPI;
let uiInstanceManagerMock: UIInstanceManager;

describe('UIContainer', () => {
  let uiContainer: UIContainer;
  beforeEach(() => {
    playerMock = getPlayerMock();
    uiInstanceManagerMock = getUiInstanceManagerMock();
  });

  describe('release', () => {
    beforeEach(() => {
      uiContainer = new UIContainer({
        hideDelay: 3000,
        components: [],
      });
    });

    describe('with configured hide delay of -1', () => {
      /* no exception expected */
      it('works without calling configure', () => {
        uiContainer.release();
      });

      /* no exception expected */
      it('works with calling configure', () => {
        uiContainer.configure(playerMock, uiInstanceManagerMock);

        uiContainer.release();
      });
    });
  });

  describe('automatically hiding', () => {
    describe('hidePlayerStateExceptions', () => {
      it('UI does not hide itself when switching into prevented state', () => {
        uiContainer = new UIContainer({
          components: [],
          hidePlayerStateExceptions: [PlayerUtils.PlayerState.Prepared],
        });
        uiContainer.configure(playerMock, uiInstanceManagerMock);

        const uiHideTimeoutSpy: any = jest.spyOn((uiContainer as any).uiHideTimeout, 'start');
        playerMock.eventEmitter.fireSourceLoadedEvent();

        expect(uiHideTimeoutSpy).not.toHaveBeenCalled();
      });
    });
  });

  describe('configure', () => {
    it('should subscribe to the onComponentViewModeChanged event', () => {
      uiContainer = new UIContainer({ hideDelay: 3000, components: [] });
      uiContainer.configure(playerMock, uiInstanceManagerMock);

      expect(uiInstanceManagerMock.onComponentViewModeChanged.subscribe).toHaveBeenCalled();
    });
  });

  describe('language attribute', () => {
    beforeEach(() => {
      uiContainer = new UIContainer({ components: [] });
    });

    afterEach(() => {
      uiContainer.release();
      i18n.setConfig({ language: 'en' });
      jest.restoreAllMocks();
    });

    it.each(['en', 'de', 'fr'])('should set the lang attribute to the active UI language %p', language => {
      i18n.setConfig({ language });
      const domMock = generateDOMMock();
      jest.spyOn(Container.prototype as any, 'toDomElement').mockReturnValue(domMock);

      uiContainer['toDomElement']();

      expect(domMock.attr).toHaveBeenCalledWith('lang', language);
    });

    it.each([
      ['de', 'de'],
      ['es-ES', 'es'],
    ])('should update the lang attribute when the UI language changes to %p', (newLanguage, expectedLanguage) => {
      i18n.setConfig({ language: 'nl' });
      const domMock = generateDOMMock();
      jest.spyOn(uiContainer, 'hasDomElement').mockReturnValue(true);
      jest.spyOn(uiContainer, 'getDomElement').mockReturnValue(domMock);

      i18n.setLanguage(newLanguage);

      expect(domMock.attr).toHaveBeenCalledWith('lang', expectedLanguage);
    });

    it.each([
      ['fr', 'Lecteur vidéo'],
      ['de', 'Videoplayer'],
    ])('should update the localized aria-label together with the lang attribute to %p', (language, expectedName) => {
      // A DOM mock that keeps its attributes, rendered with the accessible name like Container renders it
      const attributes = new Map<string, string>();
      const domMock = generateDOMMock();
      domMock.attr.mockImplementation(((name: string, value?: string) => {
        if (value === undefined) {
          return attributes.get(name) ?? null;
        }
        attributes.set(name, value);
        return domMock;
      }) as typeof domMock.attr);
      jest.spyOn(Container.prototype as any, 'toDomElement').mockImplementation(function (this: UIContainer) {
        return domMock.attr('aria-label', this['localizeAriaLabel'](this.getConfig().ariaLabel));
      });
      uiContainer.getDomElement();
      expect(attributes.get('aria-label')).toBe('Video player');

      i18n.setLanguage(language);

      expect(attributes.get('lang')).toBe(language);
      expect(attributes.get('aria-label')).toBe(expectedName);
    });

    it('should not update the lang attribute after the UI has been released', () => {
      const domMock = generateDOMMock();
      jest.spyOn(uiContainer, 'hasDomElement').mockReturnValue(true);
      jest.spyOn(uiContainer, 'getDomElement').mockReturnValue(domMock);
      uiContainer.release();

      i18n.setLanguage('de');

      expect(domMock.attr).not.toHaveBeenCalledWith('lang', expect.anything());
    });
  });

  describe('suspendHideTimeout', () => {
    it('should suspend the hide timeout', () => {
      uiContainer = new UIContainer({ hideDelay: 3000, components: [] });
      uiContainer.configure(playerMock, uiInstanceManagerMock);

      const suspendSpy = jest.spyOn(uiContainer['uiHideTimeout'], 'suspend');

      uiContainer['suspendHideTimeout']();

      expect(suspendSpy).toHaveBeenCalled();
    });
  });

  describe('resumeHideTimeout', () => {
    test.each`
      hidingPrevented | shouldReset
      ${true}         | ${false}
      ${false}        | ${true}
    `('should resume and reset=$shouldReset the hide timeout', ({ hidingPrevented, shouldReset }) => {
      uiContainer = new UIContainer({ hideDelay: 3000, components: [] });
      uiContainer.configure(playerMock, uiInstanceManagerMock);

      const resume = jest.spyOn(uiContainer['uiHideTimeout'], 'resume');

      uiContainer['hidingPrevented'] = () => hidingPrevented;
      uiContainer['resumeHideTimeout']();

      expect(resume).toHaveBeenCalledWith(shouldReset);
    });
  });
});

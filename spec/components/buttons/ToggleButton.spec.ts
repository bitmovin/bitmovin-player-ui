import { MockHelper, TestingPlayerAPI } from '../../helper/MockHelper';
import { UIInstanceManager } from '../../../src/ts/UIManager';
import { ToggleButton } from '../../../src/ts/components/buttons/ToggleButton';
import { ToggleButtonConfig } from '../../../src/ts/components/buttons/ToggleButton';
import { DOM } from '../../../src/ts/DOM';

let playerMock: TestingPlayerAPI;
let uiInstanceManagerMock: UIInstanceManager;
let mockDomElement: jest.Mocked<DOM>;

let toggleButton: ToggleButton<ToggleButtonConfig>;

describe('ToggleButton', () => {
  beforeEach(() => {
    playerMock = MockHelper.getPlayerMock();
    uiInstanceManagerMock = MockHelper.getUiInstanceManagerMock();

    // Setup DOM Mock
    mockDomElement = MockHelper.generateDOMMock();
    jest.spyOn(ToggleButton.prototype, 'getDomElement').mockReturnValue(mockDomElement);
  });

  describe('aria label', () => {
    it('should set on label when toggle state is on', () => {
      const onLocalizer = () => 'on';
      const offLocalizer = () => 'off';

      const config: ToggleButtonConfig = {
        onAriaLabel: onLocalizer,
        offAriaLabel: offLocalizer,
      };

      toggleButton = new ToggleButton(config);
      toggleButton.on();

      expect(mockDomElement.attr).toHaveBeenCalledWith('aria-label', 'on');
    });

    it('should set on label when toggle state is on (string label)', () => {
      const onLocalizer = 'on';
      const offLocalizer = 'off';

      const config: ToggleButtonConfig = {
        onAriaLabel: onLocalizer,
        offAriaLabel: offLocalizer,
      };

      toggleButton = new ToggleButton(config);
      toggleButton.on();

      expect(mockDomElement.attr).toHaveBeenCalledWith('aria-label', 'on');
    });

    it('should set off label when toggle state is off', () => {
      const onLocalizer = () => 'on';
      const offLocalizer = () => 'off';

      const config: ToggleButtonConfig = {
        onAriaLabel: onLocalizer,
        offAriaLabel: offLocalizer,
      };

      toggleButton = new ToggleButton(config);
      toggleButton.on();
      toggleButton.off();

      expect(mockDomElement.attr).toHaveBeenCalledWith('aria-label', 'off');
    });

    it('should set off label when toggle state is off (string label)', () => {
      const onLocalizer = 'on';
      const offLocalizer = 'off';

      const config: ToggleButtonConfig = {
        onAriaLabel: onLocalizer,
        offAriaLabel: offLocalizer,
      };

      toggleButton = new ToggleButton(config);
      toggleButton.on();
      toggleButton.off();

      expect(mockDomElement.attr).toHaveBeenCalledWith('aria-label', 'off');
    });
  });

  describe('aria pressed', () => {
    it('should set pressed to true when toggle state is on', () => {
      const onLocalizer = () => 'on';

      const config: ToggleButtonConfig = {
        ariaLabel: onLocalizer,
      };

      toggleButton = new ToggleButton(config);
      toggleButton.on();

      expect(mockDomElement.attr).toHaveBeenCalledWith('aria-pressed', 'true');
    });

    it('should set pressed to true when toggle state is on (string label)', () => {
      const onLocalizer = 'on';

      const config: ToggleButtonConfig = {
        ariaLabel: onLocalizer,
      };

      toggleButton = new ToggleButton(config);
      toggleButton.on();

      expect(mockDomElement.attr).toHaveBeenCalledWith('aria-pressed', 'true');
    });

    it('should set pressed to false when toggle state is off', () => {
      const onLocalizer = () => 'on';

      const config: ToggleButtonConfig = {
        ariaLabel: onLocalizer,
      };

      toggleButton = new ToggleButton(config);
      toggleButton.on();
      toggleButton.off();

      expect(mockDomElement.attr).toHaveBeenCalledWith('aria-pressed', 'false');
    });

    it('should set pressed to false when toggle state is off (string label)', () => {
      const onLocalizer = 'on';

      const config: ToggleButtonConfig = {
        ariaLabel: onLocalizer,
      };

      toggleButton = new ToggleButton(config);
      toggleButton.on();
      toggleButton.off();

      expect(mockDomElement.attr).toHaveBeenCalledWith('aria-pressed', 'false');
    });
  });
});

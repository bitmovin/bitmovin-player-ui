import { MockHelper, TestingPlayerAPI } from '../../helper/MockHelper';
import { UIInstanceManager } from '../../../src/ts/UIManager';
import { DOM } from '../../../src/ts/DOM';
import { VolumeSlider } from '../../../src/ts/components/seekbar/VolumeSlider';
import { VolumeController } from '../../../src/ts/utils/VolumeController';

describe('VolumeSlider', () => {
  let playerMock: TestingPlayerAPI;
  let uiInstanceManagerMock: UIInstanceManager;
  let volumeController: VolumeController;
  let volumeSlider: VolumeSlider;

  // The drag is tracked through handlers on the slider and on a DOM wrapper around the document
  const domHandlers = (method: 'on' | 'off') =>
    (DOM as jest.MockedClass<typeof DOM>).mock.instances.reduce(
      (calls, instance) => calls.concat((instance[method] as jest.Mock).mock.calls),
      [] as unknown[][],
    );
  const findHandler = (eventNames: string) =>
    domHandlers('on').find(([names]) => names === eventNames)?.[1] as (event: Event) => void;

  beforeEach(() => {
    playerMock = MockHelper.getPlayerMock();
    uiInstanceManagerMock = MockHelper.getUiInstanceManagerMock();
    volumeController = new VolumeController(playerMock);
    const uiConfig = uiInstanceManagerMock.getConfig();
    jest.spyOn(uiInstanceManagerMock, 'getConfig').mockReturnValue({ ...uiConfig, volumeController });

    volumeSlider = new VolumeSlider({ hideIfVolumeControlProhibited: false });
    volumeSlider.getDomElement();
    volumeSlider['seekBar'].offset = jest.fn().mockReturnValue({ left: 0, top: 0 });
    volumeSlider['seekBar'].width = jest.fn().mockReturnValue(100);
    volumeSlider.configure(playerMock, uiInstanceManagerMock);
  });

  it('should finish the volume transition of a drag during which the slider was disabled', () => {
    findHandler('touchstart mousedown')(new MouseEvent('mousedown'));
    const pointerUpHandler = findHandler('mouseup');
    expect(volumeController['transitionActive']).toBe(true);

    volumeSlider.disable();

    expect(domHandlers('off')).not.toContainEqual(['touchend mouseup', pointerUpHandler]);
    pointerUpHandler(new MouseEvent('mouseup'));
    expect(volumeController['transitionActive']).toBe(false);
  });
});

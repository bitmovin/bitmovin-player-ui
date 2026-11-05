import { MockHelper, TestingPlayerAPI } from '../../helper/MockHelper';
import { UIInstanceManager } from '../../../src/ts/UIManager';
import { PlaybackToggleButton } from '../../../src/ts/components/buttons/PlaybackToggleButton';

let playerMock: TestingPlayerAPI;
let uiInstanceManagerMock: UIInstanceManager;

let playbackToggleButton: PlaybackToggleButton;

describe('PlaybackToggleButton', () => {
  beforeEach(() => {
    playerMock = MockHelper.getPlayerMock();
    uiInstanceManagerMock = MockHelper.getUiInstanceManagerMock();

    playbackToggleButton = new PlaybackToggleButton();
    playbackToggleButton.initialize();

    // Setup DOM Mock
    const mockDomElement = MockHelper.generateDOMMock();
    jest.spyOn(playbackToggleButton, 'getDomElement').mockReturnValue(mockDomElement);

    playbackToggleButton.configure(playerMock, uiInstanceManagerMock);
  });

  describe('playback that never started', () => {
    it('starts playback of the next source instead of pausing it', () => {
      // Playback is initiated but never reaches the Playing state, e.g. because the source stalls.
      playerMock.eventEmitter.firePlayEvent();

      playerMock.eventEmitter.fireSourceUnloadedEvent();
      playerMock.eventEmitter.fireSourceLoadedEvent();

      const playSpy = jest.spyOn(playerMock, 'play');
      const pauseSpy = jest.spyOn(playerMock, 'pause');

      playbackToggleButton['onClickEvent']();

      expect(playSpy).toHaveBeenCalled();
      expect(pauseSpy).not.toHaveBeenCalled();
    });
  });
});

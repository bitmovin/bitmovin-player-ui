import { getKeyMapForPlatform } from '../../src/ts/spatialnavigation/keymap';
import { Action } from '../../src/ts/spatialnavigation/types';

const userAgent = {
  chrome:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.99 Safari/537.36',
  tizen:
    'Mozilla/5.0 (SMART-TV; LINUX; Tizen 4.0) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 TV Safari/537.36',
  webOs:
    'Mozilla/5.0 (Web0S; Linux/SmartTV) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.79 Safari/537.36 WebAppManager',
  playStation5:
    'Mozilla/5.0 (PlayStation; PlayStation 5/5.02) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Safari/605.1.15',
  android:
    'Mozilla/5.0 (Linux; U; Android 2.2.1; en-us; Nexus One Build/FRG83) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1',
  hisense:
    'Mozilla/5.0 (Linux; Android 7.0; Hisense F102) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.67 Mobile Safari/537.36',
};

describe('getKeyMapForPlatform', () => {
  test.each`
    userAgent                 | expectedBackKey
    ${userAgent.tizen}        | ${10009}
    ${userAgent.webOs}        | ${461}
    ${userAgent.chrome}       | ${27}
    ${userAgent.playStation5} | ${27}
    ${userAgent.hisense}      | ${8}
    ${userAgent.android}      | ${27}
  `('should return a key map with [$expectedBackKey]=Actions.BACK', ({ userAgent, expectedBackKey }) => {
    const userAgentSpy = jest.spyOn(window.navigator, 'userAgent', 'get').mockReturnValue(userAgent);
    const keyMap = getKeyMapForPlatform();

    expect(keyMap[expectedBackKey]).toEqual(Action.BACK);
    userAgentSpy.mockRestore();
  });
});

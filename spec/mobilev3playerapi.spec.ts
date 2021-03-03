import { PlayerAPI } from 'bitmovin-player';
import { isMobileV3PlayerAPI, MobileV3PlayerAPI, MobileV3PlayerEvent } from '../src/ts/mobilev3playerapi';
import { PlayerWrapper } from '../src/ts/uimanager';

describe('isMobileV3PlayerAPI', () => {
  const playerApi = { exports: { PlayerEvent: { } } } as PlayerAPI;
  const mobileV3PlayerApi = { exports: { PlayerEvent: MobileV3PlayerEvent } } as unknown as MobileV3PlayerAPI;
  const wrappedPlayerApi = new PlayerWrapper(playerApi);
  const wrappedMobileV3PlayerApi = new PlayerWrapper(mobileV3PlayerApi);

  it('should return false for a regular PlayerAPI instance', () => {
    expect(isMobileV3PlayerAPI(playerApi)).toBeFalsy();
  });

  it('should return false for a regular wrapped PlayerAPI instance', () => {
    expect(isMobileV3PlayerAPI(wrappedPlayerApi.getPlayer())).toBeFalsy();
  });

  it('should return true for a mobile v3 PlayerAPI instance', () => {
    expect(isMobileV3PlayerAPI(mobileV3PlayerApi)).toBeTruthy();
  });

  it('should return false for a mobile v3 wrapped PlayerAPI instance', () => {
    expect(isMobileV3PlayerAPI(wrappedMobileV3PlayerApi.getPlayer())).toBeTruthy();
  });
});

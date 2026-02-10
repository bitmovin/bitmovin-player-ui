import { StringUtils } from '../../src/ts/utils/StringUtils';

describe('StringUtils.replaceAdMessagePlaceholders', () => {
  const createPlayer = (overrides: any = {}) => {
    return {
      getCurrentTime: jest.fn().mockReturnValue(0),
      getDuration: jest.fn().mockReturnValue(0),
      ads: {
        isLinearAdActive: jest.fn().mockReturnValue(false),
        getActiveAdBreak: jest.fn().mockReturnValue(null),
        getActiveAd: jest.fn().mockReturnValue(null),
      },
      ...overrides,
    };
  };

  it('replaces remainingTime based on skip offset', () => {
    const playerMock = createPlayer({
      getCurrentTime: jest.fn().mockReturnValue(2.3),
      getDuration: jest.fn().mockReturnValue(10),
    });

    const result = StringUtils.replaceAdMessagePlaceholders('Skip in {remainingTime}', playerMock as any, 5.1);

    expect(result).toBe('Skip in 3');
  });

  it('replaces remainingTime based on ad duration when no skip offset is provided', () => {
    const playerMock = createPlayer({
      getCurrentTime: jest.fn().mockReturnValue(4),
      getDuration: jest.fn().mockReturnValue(10),
    });

    const result = StringUtils.replaceAdMessagePlaceholders('Ends in {remainingTime}', playerMock as any);

    expect(result).toBe('Ends in 6');
  });

  it('replaces playedTime and adDuration placeholders', () => {
    const playerMock = createPlayer({
      getCurrentTime: jest.fn().mockReturnValue(12),
      getDuration: jest.fn().mockReturnValue(34),
    });

    const result = StringUtils.replaceAdMessagePlaceholders(
      'Played {playedTime}, duration {adDuration}',
      playerMock as any,
    );

    expect(result).toBe('Played 12, duration 34');
  });

  it('replaces adBreakRemainingTime when a linear ad is active', () => {
    const ads = [
      { id: 'a1', isLinear: true, duration: 5 },
      { id: 'a2', isLinear: true, duration: 7 },
      { id: 'a3', isLinear: true, duration: 9 },
    ];
    const activeAd = ads[1];
    const playerMock = createPlayer({
      getCurrentTime: jest.fn().mockReturnValue(2),
      ads: {
        isLinearAdActive: jest.fn().mockReturnValue(true),
        getActiveAdBreak: jest.fn().mockReturnValue({ ads }),
        getActiveAd: jest.fn().mockReturnValue(activeAd),
      },
    });

    const result = StringUtils.replaceAdMessagePlaceholders('Remaining {adBreakRemainingTime}', playerMock as any);

    expect(result).toBe('Remaining 14');
  });

  it('returns 0 for adBreakRemainingTime when no linear ad is active', () => {
    const playerMock = createPlayer({
      ads: {
        isLinearAdActive: jest.fn().mockReturnValue(false),
        getActiveAdBreak: jest.fn(),
        getActiveAd: jest.fn(),
      },
    });

    const result = StringUtils.replaceAdMessagePlaceholders('Remaining {adBreakRemainingTime}', playerMock as any);

    expect(result).toBe('Remaining 0');
  });

  it('replaces activeAdIndex and totalAdsCount placeholders', () => {
    const ads = [{ id: 'a1' }, { id: 'a2' }, { id: 'a3' }];
    const playerMock = createPlayer({
      ads: {
        getActiveAdBreak: jest.fn().mockReturnValue({ ads }),
        getActiveAd: jest.fn().mockReturnValue(ads[1]),
      },
    });

    const result = StringUtils.replaceAdMessagePlaceholders('Ad {activeAdIndex} of {totalAdsCount}', playerMock as any);

    expect(result).toBe('Ad 2 of 3');
  });

  it('returns 0 when ad context is missing for ad index placeholders', () => {
    const playerMock = createPlayer({
      ads: {
        getActiveAdBreak: jest.fn().mockReturnValue(null),
        getActiveAd: jest.fn().mockReturnValue(null),
      },
    });

    const result = StringUtils.replaceAdMessagePlaceholders('Ad {activeAdIndex} of {totalAdsCount}', playerMock as any);

    expect(result).toBe('Ad 0 of 0');
  });
});

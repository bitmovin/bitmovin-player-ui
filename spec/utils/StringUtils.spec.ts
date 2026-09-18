import { StringUtils } from '../../src/ts/utils/StringUtils';
import { AdBreakTracker } from '../../src/ts/utils/AdBreakTracker';
import { i18n } from '../../src/ts/localization/i18n';

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

  const createAdBreakTracker = (values: Partial<AdBreakTracker>) => values as AdBreakTracker;

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

  it('treats skipOffset = 0 as a valid value', () => {
    const playerMock = createPlayer({
      getCurrentTime: jest.fn().mockReturnValue(0),
      getDuration: jest.fn().mockReturnValue(10),
    });

    const result = StringUtils.replaceAdMessagePlaceholders('Skip in {remainingTime}', playerMock as any, 0);

    expect(result).toBe('Skip in 0');
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

  it('replaces adBreakRemainingTime from the ad break tracker', () => {
    const getActiveAdBreak = jest.fn();
    const playerMock = createPlayer({ ads: { isLinearAdActive: jest.fn(), getActiveAdBreak, getActiveAd: jest.fn() } });

    const result = StringUtils.replaceAdMessagePlaceholders(
      'Remaining {adBreakRemainingTime}',
      playerMock as any,
      undefined,
      createAdBreakTracker({ adBreakRemainingTime: 14 }),
    );

    expect(result).toBe('Remaining 14');
    expect(getActiveAdBreak).not.toHaveBeenCalled();
  });

  it('returns 0 for adBreakRemainingTime when no tracker is provided', () => {
    const playerMock = createPlayer();

    const result = StringUtils.replaceAdMessagePlaceholders('Remaining {adBreakRemainingTime}', playerMock as any);

    expect(result).toBe('Remaining 0');
  });

  it('replaces ad count placeholders from the ad break tracker', () => {
    const ads = [{ id: 'a1' }, { id: 'a2' }, { id: 'a3' }];
    const getActiveAdBreak = jest.fn().mockReturnValue({ ads });
    const getActiveAd = jest.fn().mockReturnValue(ads[1]);
    const playerMock = createPlayer({ ads: { getActiveAdBreak, getActiveAd } });

    const result = StringUtils.replaceAdMessagePlaceholders(
      'Ad {activeAdIndex} of {totalAdsCount}',
      playerMock as any,
      undefined,
      createAdBreakTracker({ currentAdIndex: 1, totalNumberOfAds: 2 }),
    );

    // The tracker counts across ad breaks and applies UIConfig.adCountFilter, so the player is not consulted
    expect(result).toBe('Ad 1 of 2');
    expect(getActiveAdBreak).not.toHaveBeenCalled();
    expect(getActiveAd).not.toHaveBeenCalled();
  });

  it('replaces ad count placeholders with 0 when no tracker is provided', () => {
    const ads = [{ id: 'a1' }, { id: 'a2' }, { id: 'a3' }];
    const getActiveAdBreak = jest.fn().mockReturnValue({ ads });
    const playerMock = createPlayer({ ads: { getActiveAdBreak, getActiveAd: jest.fn().mockReturnValue(ads[1]) } });

    const result = StringUtils.replaceAdMessagePlaceholders('Ad {activeAdIndex} of {totalAdsCount}', playerMock as any);

    expect(result).toBe('Ad 0 of 0');
    expect(getActiveAdBreak).not.toHaveBeenCalled();
  });

  it('supports mm:ss formatting for time placeholders', () => {
    const playerMock = createPlayer({
      getCurrentTime: jest.fn().mockReturnValue(0),
      getDuration: jest.fn().mockReturnValue(100),
    });

    const result = StringUtils.replaceAdMessagePlaceholders('Ends in {remainingTime%mm:ss}', playerMock as any);

    expect(result).toBe('Ends in 01:40');
  });

  it('supports integer and float formatting with leading zeros', () => {
    const playerMock = createPlayer({
      getCurrentTime: jest.fn().mockReturnValue(0),
      getDuration: jest.fn().mockReturnValue(7.12),
    });

    const intResult = StringUtils.replaceAdMessagePlaceholders('Ends in {remainingTime%03d}', playerMock as any);
    const floatResult = StringUtils.replaceAdMessagePlaceholders('Ends in {remainingTime%04.2f}', playerMock as any);

    expect(intResult).toBe('Ends in 007');
    expect(floatResult).toBe('Ends in 0007.00');
  });
});

describe('StringUtils.secondsToTime', () => {
  it('formats seconds into hh:mm:ss by default', () => {
    expect(StringUtils.secondsToTime(3661)).toBe('01:01:01');
  });

  it('formats seconds into mm:ss when specified', () => {
    expect(StringUtils.secondsToTime(61, StringUtils.FORMAT_MMSS)).toBe('01:01');
  });

  it('preserves negative sign', () => {
    expect(StringUtils.secondsToTime(-61, StringUtils.FORMAT_MMSS)).toBe('-01:01');
  });
});

describe('StringUtils.secondsToText', () => {
  beforeEach(() => {
    i18n.setConfig({
      language: 'en',
      vocabularies: {
        en: {
          'settings.time.hours': 'hours',
          'settings.time.minutes': 'minutes',
          'settings.time.seconds': 'seconds',
        },
      },
    } as any);
  });

  it('formats hours, minutes, and seconds with localized labels', () => {
    expect(StringUtils.secondsToText(3661)).toBe('1 hours 1 minutes 1 seconds');
  });

  it('omits zero hours and minutes', () => {
    expect(StringUtils.secondsToText(5)).toBe('5 seconds');
  });

  it('preserves negative sign', () => {
    expect(StringUtils.secondsToText(-65)).toBe('-1 minutes 5 seconds');
  });
});

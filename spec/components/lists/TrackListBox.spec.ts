import { AudioTrackListBox } from '../../../src/ts/components/lists/AudioTrackListBox';
import { SubtitleListBox } from '../../../src/ts/components/lists/SubtitleListBox';

describe('TrackListBox constructors', () => {
  it('allows AudioTrackListBox title-only construction', () => {
    const audioTrackListBox = new AudioTrackListBox('Audio Tracks');

    expect((audioTrackListBox as any).config.title).toBe('Audio Tracks');
  });

  it('allows AudioTrackListBox config-object construction with comparator', () => {
    const comparator = jest.fn();
    const audioTrackListBox = new AudioTrackListBox({
      title: 'Audio Tracks',
      comparator,
    });

    expect((audioTrackListBox as any).config.title).toBe('Audio Tracks');
    expect((audioTrackListBox as any).config.listSelector.getConfig().comparator).toBe(comparator);
  });

  it('passes settings panel config through AudioTrackListBox config objects', () => {
    const audioTrackListBox = new AudioTrackListBox({
      title: 'Audio Tracks',
      hideDelay: 1234,
      pageTransitionAnimation: false,
    });

    expect((audioTrackListBox as any).config.hideDelay).toBe(1234);
    expect((audioTrackListBox as any).config.pageTransitionAnimation).toBe(false);
  });

  it('allows SubtitleListBox title-only construction', () => {
    const subtitleListBox = new SubtitleListBox('Subtitles');

    expect((subtitleListBox as any).config.title).toBe('Subtitles');
  });

  it('allows SubtitleListBox config-object construction with comparator', () => {
    const comparator = jest.fn();
    const subtitleListBox = new SubtitleListBox({
      title: 'Subtitles',
      comparator,
    });

    expect((subtitleListBox as any).config.title).toBe('Subtitles');
    expect((subtitleListBox as any).config.listSelector.getConfig().comparator).toBeDefined();
    expect((subtitleListBox as any).config.listSelector.getConfig().comparator).not.toBe(comparator);
  });

  it('passes list selector config through SubtitleListBox config objects', () => {
    const translator = jest.fn().mockImplementation(item => item.label);
    const filter = jest.fn().mockReturnValue(true);
    const subtitleListBox = new SubtitleListBox({
      title: 'Subtitles',
      translator,
      filter,
    });

    expect((subtitleListBox as any).config.listSelector.getConfig().translator).toBe(translator);
    expect((subtitleListBox as any).config.listSelector.getConfig().filter).toBe(filter);
  });
});

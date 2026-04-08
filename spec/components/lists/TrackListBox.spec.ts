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
});

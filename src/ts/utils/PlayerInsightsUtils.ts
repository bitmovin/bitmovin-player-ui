import type {
  AudioQuality,
  DownloadedAudioData,
  DownloadedVideoData,
  PlayerAPI,
  SourceConfig,
  VideoQuality,
} from 'bitmovin-player';

interface QualityInsight {
  id?: string;
  width?: number;
  height?: number;
  frameRate?: number;
  bitrate?: number;
  codec?: string;
}

export function formatVideoQualityInsight(player: PlayerAPI): string | null {
  const playbackVideo = safe(() => player.getPlaybackVideoData() as QualityInsight);
  const downloadedVideo = getDownloadedVideoInsight(player);

  return formatCombinedQualityInsight(
    playbackVideo,
    downloadedVideo,
    isSameVideoQuality,
    formatVideoQualityValue,
    '\u2193 ',
  );
}

export function formatAudioQualityInsight(player: PlayerAPI): string | null {
  const playbackAudio = safe(() => player.getPlaybackAudioData() as QualityInsight);
  const downloadedAudio = getDownloadedAudioInsight(player);

  return formatCombinedQualityInsight(playbackAudio, downloadedAudio, isSameAudioQuality, formatAudioQualityValue);
}

function getDownloadedVideoInsight(player: PlayerAPI): QualityInsight | undefined {
  const downloadedVideo = safe(() => player.getDownloadedVideoData());
  const availableVideoQualities = safe(() => player.getAvailableVideoQualities()) ?? [];

  return enrichDownloadedVideoData(downloadedVideo, availableVideoQualities);
}

function getDownloadedAudioInsight(player: PlayerAPI): QualityInsight | undefined {
  const downloadedAudio = safe(() => player.getDownloadedAudioData());
  const availableAudioQualities = safe(() => player.getAvailableAudioQualities()) ?? [];

  return enrichDownloadedAudioData(downloadedAudio, availableAudioQualities);
}

export function formatViewportFramesInsight(player: PlayerAPI): string | null {
  const videoElement = getVideoElement(player);
  const viewport = formatViewport(videoElement);
  const frames = formatFrames(player);
  const parts = [];

  if (viewport) {
    parts.push(viewport);
  }
  if (frames) {
    parts.push(frames);
  }

  return parts.length > 0 ? parts.join(' / ') : null;
}

export function formatManifestUrlInsight(player: PlayerAPI): string | null {
  const manifestUrl = pickManifestUrl(safe(() => player.getSource()));

  return manifestUrl ? escapeHtml(manifestUrl) : null;
}

export function formatBufferInsight(player: PlayerAPI): string | null {
  const videoBuffer = formatBufferLength(safe(() => player.getVideoBufferLength()));
  const audioBuffer = formatBufferLength(safe(() => player.getAudioBufferLength()));
  const parts = [];

  if (videoBuffer) {
    parts.push(videoBuffer);
  }
  if (audioBuffer) {
    parts.push(audioBuffer);
  }

  return parts.length > 0 ? parts.join(' / ') : null;
}

export function formatTimeInsight(player: PlayerAPI): string | null {
  const isLive = safe(() => player.isLive()) === true;
  const absoluteTimeMode = (player.exports as any).TimeMode?.AbsoluteTime;
  const currentTime = safe(() => player.getCurrentTime(isLive ? absoluteTimeMode : undefined));
  const duration = safe(() => player.getDuration());
  const speed = safe(() => player.getPlaybackSpeed()) ?? 1;
  const speedText = speed !== 1 ? ` @ ${speed.toFixed(2)}x` : '';

  if (typeof currentTime !== 'number') {
    return null;
  }

  if (isLive) {
    const timeShift = safe(() => player.getTimeShift());
    const latencyText = typeof timeShift === 'number' ? `, ${(-timeShift).toFixed(2)}s behind live` : '';
    return `${formatLiveTime(currentTime)}${latencyText}${speedText}`;
  }

  return typeof duration === 'number' && isFinite(duration)
    ? `${formatSeconds(currentTime)} / ${formatSeconds(duration)}${speedText}`
    : `${formatSeconds(currentTime)}${speedText}`;
}

export function formatStreamInsight(player: PlayerAPI): string | null {
  const streamType = safe(() => player.getStreamType());
  const playerType = safe(() => player.getPlayerType());

  if (!streamType && !playerType) {
    return null;
  }

  return [streamType, playerType ? `(${playerType})` : null].filter(Boolean).join(' ');
}

function enrichDownloadedVideoData(
  downloadedVideo: DownloadedVideoData | undefined,
  availableVideoQualities: VideoQuality[],
): QualityInsight | undefined {
  if (!downloadedVideo) {
    return undefined;
  }

  const matchingQuality =
    availableVideoQualities.find(videoQuality => videoQuality.id === downloadedVideo.id) ??
    availableVideoQualities.find(
      videoQuality =>
        videoQuality.bitrate === downloadedVideo.bitrate &&
        videoQuality.width === downloadedVideo.width &&
        videoQuality.height === downloadedVideo.height,
    );

  return {
    ...downloadedVideo,
    codec: matchingQuality?.codec,
    frameRate: matchingQuality?.frameRate,
  };
}

function enrichDownloadedAudioData(
  downloadedAudio: DownloadedAudioData | undefined,
  availableAudioQualities: AudioQuality[],
): QualityInsight | undefined {
  if (!downloadedAudio) {
    return undefined;
  }

  const matchingQuality =
    availableAudioQualities.find(audioQuality => audioQuality.id === downloadedAudio.id) ??
    availableAudioQualities.find(audioQuality => audioQuality.bitrate === downloadedAudio.bitrate);

  return {
    ...downloadedAudio,
    codec: matchingQuality?.codec,
  };
}

function isSameVideoQuality(playbackVideo: QualityInsight | undefined, downloadedVideo: QualityInsight | undefined) {
  if (!playbackVideo || !downloadedVideo) {
    return false;
  }

  if (playbackVideo.id && downloadedVideo.id) {
    return playbackVideo.id === downloadedVideo.id;
  }

  const hasComparableRendition =
    playbackVideo.width != null &&
    downloadedVideo.width != null &&
    playbackVideo.height != null &&
    downloadedVideo.height != null &&
    playbackVideo.bitrate != null &&
    downloadedVideo.bitrate != null;
  const sameRendition =
    playbackVideo.width === downloadedVideo.width &&
    playbackVideo.height === downloadedVideo.height &&
    playbackVideo.bitrate === downloadedVideo.bitrate;

  return hasComparableRendition && sameRendition && isSameCodec(playbackVideo, downloadedVideo);
}

function isSameAudioQuality(playbackAudio: QualityInsight | undefined, downloadedAudio: QualityInsight | undefined) {
  if (!playbackAudio || !downloadedAudio) {
    return false;
  }

  if (playbackAudio.id && downloadedAudio.id) {
    return playbackAudio.id === downloadedAudio.id;
  }

  return (
    playbackAudio.bitrate != null &&
    downloadedAudio.bitrate != null &&
    playbackAudio.bitrate === downloadedAudio.bitrate &&
    isSameCodec(playbackAudio, downloadedAudio)
  );
}

function isSameCodec(playbackQuality: QualityInsight, downloadedQuality: QualityInsight): boolean {
  return !playbackQuality.codec || !downloadedQuality.codec || playbackQuality.codec === downloadedQuality.codec;
}

function formatCombinedQualityInsight(
  playbackQuality: QualityInsight | undefined,
  downloadedQuality: QualityInsight | undefined,
  isSameQuality: (
    playbackQuality: QualityInsight | undefined,
    downloadedQuality: QualityInsight | undefined,
  ) => boolean,
  formatQuality: (quality: QualityInsight | undefined) => string,
  downloadedPrefix = '',
): string | null {
  const playbackValue = formatQuality(playbackQuality);
  const downloadedValue = formatQuality(downloadedQuality);
  const prefixedDownloadedValue = downloadedValue ? `${downloadedPrefix}${downloadedValue}` : '';

  if (!playbackValue) {
    return downloadedValue || null;
  }
  if (!downloadedValue || isSameQuality(playbackQuality, downloadedQuality)) {
    return playbackValue;
  }

  return `${playbackValue} / ${prefixedDownloadedValue}`;
}

function formatVideoQualityValue(quality: QualityInsight | undefined): string {
  if (!quality) {
    return '';
  }

  const parts = formatVideoQualityParts(quality);

  return parts.length > 0 ? parts.join(',') : '';
}

function formatAudioQualityValue(quality: QualityInsight | undefined): string {
  const parts = formatAudioQualityParts(quality);

  return parts.length > 0 ? parts.join(',') : '';
}

function formatVideoQualityParts(quality: QualityInsight): string[] {
  const parts = [];
  const resolution = formatResolution(quality);
  const bitrate = formatBitrate(quality.bitrate);

  if (resolution) {
    parts.push(resolution);
  }
  if (bitrate) {
    parts.push(bitrate);
  }
  if (quality.codec) {
    parts.push(quality.codec);
  }

  return parts;
}

function formatAudioQualityParts(quality: QualityInsight | undefined): string[] {
  if (!quality) {
    return [];
  }

  const parts = [];
  const bitrate = formatBitrate(quality.bitrate);

  if (bitrate) {
    parts.push(bitrate);
  }
  if (quality.codec) {
    parts.push(quality.codec);
  }

  return parts;
}

function formatResolution(quality: QualityInsight): string | null {
  return quality.width && quality.height
    ? `${quality.width}x${quality.height}${quality.frameRate ? `@${quality.frameRate}` : ''}`
    : null;
}

function formatBufferLength(bufferLength: number | undefined): string | null {
  return typeof bufferLength === 'number' ? `${bufferLength.toFixed(2)}s` : null;
}

function formatViewport(videoElement: HTMLVideoElement | null): string | null {
  return videoElement && videoElement.clientWidth > 0 && videoElement.clientHeight > 0
    ? `${videoElement.clientWidth}x${videoElement.clientHeight}`
    : null;
}

function formatFrames(player: PlayerAPI): string | null {
  const droppedFrames = safe(() => player.getDroppedVideoFrames());

  if (typeof droppedFrames !== 'number') {
    return null;
  }

  return `${droppedFrames} dropped`;
}

function getVideoElement(player: PlayerAPI): HTMLVideoElement | null {
  return safe(() => player.getContainer().querySelector('video') as HTMLVideoElement | null) ?? null;
}

function pickManifestUrl(source: SourceConfig | null | undefined): string | null {
  if (!source) {
    return null;
  }

  if (source.dash) {
    return source.dash;
  }
  if (source.hls) {
    return source.hls;
  }
  if (source.smooth) {
    return source.smooth;
  }
  if (typeof source.progressive === 'string') {
    return source.progressive;
  }

  const progressiveSource = source.progressive?.find(sourceConfig => sourceConfig.preferred) ?? source.progressive?.[0];
  return progressiveSource?.url ?? null;
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function safe<T>(fn: () => T): T | undefined {
  try {
    return fn();
  } catch {
    return undefined;
  }
}

export function formatBitrate(bitrate: number | undefined): string {
  if (!bitrate || !isFinite(bitrate)) {
    return '';
  }

  if (bitrate >= 1_000_000) {
    return `${(bitrate / 1_000_000).toFixed(2)}Mbps`;
  }

  return `${Math.round(bitrate / 1000)}kbps`;
}

export function formatSeconds(seconds: number): string {
  if (!isFinite(seconds)) {
    return 'Infinity';
  }

  const sign = seconds < 0 ? '-' : '';
  const total = Math.floor(Math.abs(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const remainingSeconds = total % 60;
  const pad = (value: number) => (value < 10 ? `0${value}` : value.toString());

  return hours > 0
    ? `${sign}${hours}:${pad(minutes)}:${pad(remainingSeconds)}`
    : `${sign}${minutes}:${pad(remainingSeconds)}`;
}

function formatLiveTime(seconds: number): string {
  return isUnixTimestamp(seconds) ? formatClockTime(seconds) : formatSeconds(seconds);
}

function isUnixTimestamp(seconds: number): boolean {
  return seconds >= Date.UTC(2000, 0, 1) / 1000;
}

function formatClockTime(seconds: number): string {
  const date = new Date(seconds * 1000);
  const pad = (value: number) => (value < 10 ? `0${value}` : value.toString());

  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

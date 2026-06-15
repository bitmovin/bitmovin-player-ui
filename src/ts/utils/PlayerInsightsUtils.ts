import { PlayerAPI } from 'bitmovin-player';

const DOWN_ARROW_CHARACTER = '\u2193';

interface QualityInsight {
  id?: string;
  width?: number;
  height?: number;
  frameRate?: number;
  bitrate?: number;
  codec?: string;
}

export namespace PlayerInsightsUtils {
  /** Formats the currently playing and downloaded video quality details for the panel row. */
  export function formatVideoQualityInsight(player: PlayerAPI): string | null {
    const availableVideoQualities = player.getAvailableVideoQualities();

    const playbackVideoQualityInsight = player.getPlaybackVideoData() as QualityInsight;
    // The downloadVideoQuality does not contain the frame-rate or other quality-related properties.
    // Therefore, we extract them from the available video qualities by mapping them via their IDs.
    const downloadedVideo = player.getDownloadedVideoData();
    const downloadVideoQualityInsight = enrichDownloadedQualityData(downloadedVideo, availableVideoQualities);

    return formatPlaybackAndDownloadedQuality(playbackVideoQualityInsight, downloadVideoQualityInsight);
  }

  /** Formats the currently playing and downloaded audio quality details for the panel row. */
  export function formatAudioQualityInsight(player: PlayerAPI): string | null {
    const availableAudioQualities = player.getAvailableAudioQualities();

    const playbackAudioQualityInsight = player.getPlaybackAudioData() as QualityInsight;
    // The downloadAudioQuality does not contain the frame-rate or other quality-related properties.
    // Therefore, we extract them from the available video qualities by mapping them via their IDs.
    const downloadedAudio = player.getDownloadedAudioData();
    const downloadAudioQualityInsight = enrichDownloadedQualityData(downloadedAudio, availableAudioQualities);

    return formatPlaybackAndDownloadedQuality(playbackAudioQualityInsight, downloadAudioQualityInsight);
  }

  /** Formats the current video element size together with dropped frame count. */
  export function formatViewportFramesInsight(player: PlayerAPI): string {
    const videoElement = player.getVideoElement();
    const viewport =
      videoElement.clientWidth > 0 && videoElement.clientHeight > 0
        ? `${videoElement.clientWidth}x${videoElement.clientHeight}`
        : null;
    const frames = `${player.getDroppedVideoFrames()} dropped`;

    return viewport ? `${viewport} / ${frames}` : frames;
  }

  /** Formats forward video and audio buffer levels from the player buffer API. */
  export function formatBufferInsight(player: PlayerAPI): string | null {
    const videoBufferLevel = player.buffer.getLevel(
      player.exports.BufferType.ForwardDuration,
      player.exports.MediaType.Video,
    ).level;
    const audioBufferLevel = player.buffer.getLevel(
      player.exports.BufferType.ForwardDuration,
      player.exports.MediaType.Audio,
    ).level;

    if (videoBufferLevel == null && audioBufferLevel == null) {
      return null;
    }

    const bufferLevels = [
      videoBufferLevel != null ? `${videoBufferLevel.toFixed(2)}s` : `-`,
      audioBufferLevel != null ? `${audioBufferLevel.toFixed(2)}s` : `-`,
    ];

    return bufferLevels.join(' / ');
  }

  /** Formats the current playback time, duration, live latency, and playback speed. */
  export function formatTimeInsight(player: PlayerAPI): string | null {
    const isLive = player.isLive();

    if (isLive) {
      const timeShift = player.getTimeShift();
      const currentTime = player.getCurrentTime();
      return `${formatLiveTime(currentTime)} / TimeShift: ${timeShift.toFixed(2)}s`;
    }

    const currentTime = player.getCurrentTime();
    const duration = player.getDuration();

    return `${formatSeconds(currentTime)} / ${formatSeconds(duration)}`;
  }

  /** Formats the stream technology and active player type for the panel row. */
  export function formatStreamInsight(player: PlayerAPI): string | null {
    const streamType = player.getStreamType();
    const playerType = player.getPlayerType();

    if (!streamType && !playerType) {
      return null;
    }

    return [streamType, playerType ? `(${playerType})` : null].filter(Boolean).join(' ');
  }
}

function enrichDownloadedQualityData(
  downloadedQuality: QualityInsight | undefined,
  availableQualities: QualityInsight[],
): QualityInsight | undefined {
  if (!downloadedQuality) {
    return undefined;
  }

  const matchingQuality = availableQualities.find(quality => quality.id === downloadedQuality.id);

  return {
    ...downloadedQuality,
    codec: matchingQuality?.codec,
    frameRate: matchingQuality?.frameRate,
  };
}

function formatPlaybackAndDownloadedQuality(
  playbackQuality: QualityInsight | undefined,
  downloadedQuality: QualityInsight | undefined,
): string | null {
  const playbackValue = formatQualityInsight(playbackQuality);
  const downloadedValue = formatQualityInsight(downloadedQuality);

  if (!playbackValue) {
    return downloadedValue || null;
  }
  if (!downloadedValue || playbackQuality?.id === downloadedQuality?.id || playbackValue === downloadedValue) {
    return playbackValue;
  }

  // Show both values when playback and downloaded renditions differ.
  return `${playbackValue} / ${DOWN_ARROW_CHARACTER}${downloadedValue}`;
}

/** Builds the display value for a quality value. */
function formatQualityInsight(quality: QualityInsight | undefined): string {
  if (!quality) {
    return '';
  }

  const parts: string[] = [];
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

  return parts.length > 0 ? parts.join(',') : '';
}

/** Formats resolution and optional frame rate for video quality display. */
function formatResolution(quality: QualityInsight): string | null {
  return quality.width && quality.height
    ? `${quality.width}x${quality.height}${quality.frameRate ? `@${quality.frameRate}` : ''}`
    : null;
}

/** Formats bitrate in Mbps or kbps depending on its size. */
function formatBitrate(bitrate: number | undefined): string {
  if (!bitrate || !isFinite(bitrate)) {
    return '';
  }

  if (bitrate >= 1_000_000) {
    return `${(bitrate / 1_000_000).toFixed(2)}Mbps`;
  }

  return `${Math.round(bitrate / 1000)}kbps`;
}

/** Formats a duration-like value as h:mm:ss or m:ss. */
function formatSeconds(seconds: number): string {
  if (!isFinite(seconds)) {
    return 'Infinity';
  }

  const total = Math.floor(Math.abs(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const remainingSeconds = total % 60;
  const pad = (value: number) => (value < 10 ? `0${value}` : value.toString());

  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(remainingSeconds)}` : `${minutes}:${pad(remainingSeconds)}`;
}

/** Formats absolute live time as a clock and relative live time as a duration. */
function formatLiveTime(seconds: number): string {
  return isUnixTimestamp(seconds) ? formatClockTime(seconds) : formatSeconds(seconds);
}

/** Detects absolute wall-clock timestamps returned for live playback. */
function isUnixTimestamp(seconds: number): boolean {
  return seconds >= Date.UTC(2000, 0, 1) / 1000;
}

/** Formats a Unix timestamp in seconds as a local wall-clock time. */
function formatClockTime(seconds: number): string {
  const date = new Date(seconds * 1000);
  const pad = (value: number) => (value < 10 ? `0${value}` : value.toString());

  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

declare namespace bitmovin {

    function player(htmlElementID: string): player.Player;

    namespace player {

        interface PlayerEventCallback {
            (data?: any): void;
        }

        interface ViewingDirection {
            yaw: number;
            pitch: number;
            roll: number;
        }

        interface VRStatus {
            contentType: string;
            playbackState?: string;
            lastError?: string;
            isStereo?: boolean;
            viewingDirection?: ViewingDirection;
        }

        interface Thumbnail {
            start: number;
            end: number;
            w: number;
            h: number;
            i: number;
            x: number;
            y: number;
            url: string;
            text: string;
        }

        interface Quality {
            bitrate: number;
            id: string;
            label: string;
        }

        interface AudioQuality extends Quality {
        }

        interface VideoQuality extends Quality {
            width: number;
            height: number;
        }

        interface AudioTrack {
            id: string;
            lang: string;
            label: string;
        }

        interface SkipMessage {
            countdown: string;
            skip: string;
        }

        interface ScheduleAdOptions {
            timeOffset?: any;
            persistent?: boolean;
            adMessage?: string;
            skipMessage?: SkipMessage;
            style?: Object;
            skip?: Object;
        }

        interface SupportedTech {
            player: string;
            streaming: string;
        }

        interface Subtitle {
            id: string;
            lang: string;
            label: string;
        }

        interface Snapshot {
            width: number;
            height: number;
            data: String;
        }

        interface DownloadedData {
            bitrate: number;
            id: string;
            isAuto: boolean;
        }

        interface DownloadedAudioData extends DownloadedData {
        }

        interface DownloadedVideoData extends DownloadedData {
            width: number
            height: number;
        }

        interface Player {
            addEventHandler(eventType: EVENT, callback: PlayerEventCallback): Player;
            addMetadata(metadataType: string, metadata: any): void;
            addSubtitle(url: string, subtitleTrackID: string, kind: string, lang: string, label? : string): Player;
            castStop(): Player;
            castVideo(): Player;
            clearQueryParameters(): Player;
            destroy(): void;
            enterFullscreen(): void;
            exitFullscreen(): void;
            getAudio(): AudioTrack;
            getAudioBufferLength(): number;
            getAvailableAudio(): AudioTrack[];
            getAvailableAudioQualities(): AudioQuality[];
            getAvailableImpressionServers(): string[];
            getAvailableLicenseServers(): string[];
            getAvailableSubtitles(): Subtitle[];
            getAvailableVideoQualities(): VideoQuality[];
            getConfig(getMergedConfig?: boolean): any;
            getCurrentTime(): number;
            getDownloadedAudioData(): DownloadedAudioData;
            getDownloadedVideoData(): DownloadedVideoData;
            getDroppedFrames(): number;
            getDuration(): number;
            getFigure(): HTMLElement;
            getManifest(): Object;
            getMaxTimeShift(): number;
            getPlaybackAudioData(): AudioQuality;
            getPlaybackSpeed(): number;
            getPlaybackVideoData(): VideoQuality;
            getPlayerType(): string;
            getSnapshot(type?: string, quality?: number): Snapshot;
            getStreamType(): string;
            getSubtitle(): Subtitle;
            getSupportedDRM(): Promise<string[]>;
            getSupportedTech(): SupportedTech[];
            getThumb(time: number): Thumbnail;
            getTimeShift(): number;
            getTotalStalledTime(): number;
            getVersion(): string;
            getVideoBufferLength(): number;
            getVolume(): number;
            getVRStatus(): VRStatus;
            hasEnded(): boolean;
            isAd(): boolean;
            isCastAvailable(): boolean;
            isCasting(): boolean;
            isDRMSupported(drmSystem: string): Promise<string>;
            isFullscreen(): boolean;
            isLive(): boolean;
            isMuted(): boolean;
            isPaused(): boolean;
            isPlaying(): boolean;
            isReady(): boolean;
            isSetup(): boolean;
            isStalled(): boolean;
            load(source: Object, forceTechnology?: boolean, disableSeeking?: boolean): void;
            mute(): Player;
            pause(): Player;
            play(): Player;
            removeEventHandler(eventType: EVENT, callback: PlayerEventCallback): Player;
            removeSubtitle(subtitleTrackID: string): Player;
            scheduleAd(adManifestUrl: string, adType: string, options?: ScheduleAdOptions): void;
            seek(time: number): boolean;
            setAudio(trackID: string): Player;
            setAudioQuality(audioQualityID: string): Player;
            setAuthentication(customData: any): void;
            setLastSegment(lastSegmentNum: number): Player;
            setPlaybackSpeed(speed: number): void;
            setPosterImage(url: string, keepPersistent: boolean): void;
            setQueryParameters(queryParameters: Object): Player;
            setSkin(param: string | Object): Promise<void>;
            setSubtitle(trackID: string): Player;
            setup(userConfig: any, forceTechnology?: string): Promise<Player>;
            setVideoElement(videoElement: HTMLElement): void;
            setVideoQuality(videoQualityID: string): Player;
            setVolume(volume: number): Player;
            setVRStereo(enableStereo: boolean): boolean;
            skipAd(): void;
            timeShift(offset: number): Player;
            unload(): Player;
            unmute(): Player;
        }

        enum EVENT {
            ON_AD_CLICKED,
            ON_AD_ERROR,
            ON_AD_FINISHED,
            ON_AD_LINEARITY_CHANGED,
            ON_AD_MANIFEST_LOADED,
            ON_AD_SCHEDULED,
            ON_AD_SKIPPED,
            ON_AD_STARTED,
            ON_AUDIO_ADAPTATION,
            ON_AUDIO_CHANGE,
            ON_AUDIO_DOWNLOAD_QUALITY_CHANGE,
            ON_AUDIO_PLAYBACK_QUALITY_CHANGE,
            ON_CAST_AVAILABLE,
            ON_CAST_LAUNCHED,
            ON_CAST_PAUSE,
            ON_CAST_PLAYBACK_FINISHED,
            ON_CAST_PLAYING,
            ON_CAST_START,
            ON_CAST_STOP,
            ON_CAST_TIME_UPDATE,
            ON_CAST_WAITING_FOR_DEVICE,
            ON_CUE_ENTER,
            ON_CUE_EXIT,
            ON_DOWNLOAD_FINISHED,
            ON_DVR_WINDOW_EXCEEDED,
            ON_ERROR,
            ON_FULLSCREEN_ENTER,
            ON_FULLSCREEN_EXIT,
            ON_HIDE_CONTROLS,
            ON_METADATA,
            ON_MUTE,
            ON_PAUSE,
            ON_PERIOD_SWITCHED,
            ON_PLAY,
            ON_PLAYBACK_FINISHED,
            ON_PLAYER_RESIZE,
            ON_READY,
            ON_SEEK,
            ON_SEEKED,
            ON_SEGMENT_REQUEST_FINISHED,
            ON_SHOW_CONTROLS,
            ON_SOURCE_LOADED,
            ON_SOURCE_UNLOADED,
            ON_START_BUFFERING,
            ON_STOP_BUFFERING,
            ON_SUBTITLE_ADDED,
            ON_SUBTITLE_CHANGE,
            ON_SUBTITLE_REMOVED,
            ON_TIME_CHANGED,
            ON_TIME_SHIFT,
            ON_TIME_SHIFTED,
            ON_UNMUTE,
            ON_VIDEO_ADAPTATION,
            ON_VIDEO_DOWNLOAD_QUALITY_CHANGE,
            ON_VIDEO_PLAYBACK_QUALITY_CHANGE,
            ON_VOLUME_CHANGE,
            ON_VR_ERROR,
            ON_VR_MODE_CHANGED,
            ON_VR_STEREO_CHANGED,
            ON_WARNING
        }
    }
}

declare namespace bitmovin {

    namespace player {

        interface PlayerEventCallback {
            (): void;
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

        interface VideoQuality extends Quality {
            width: number;
            height: number;
        }

        interface AudioQuality extends Quality {
        }

        interface AudioTrack {
            id: string;
            lang: string;
            label: string;
        }

        interface Player {
            addEventHandler(eventType: EVENT, callback: PlayerEventCallback): Player;
            //addMetadata
            //addSubtitle
            //castStop
            //castVideo
            //castVideo
            //clearQueryParameters
            //destroy
            enterFullscreen(): void;
            exitFullscreen(): void;
            getAudio(): AudioTrack;
            //getAudioBufferLength
            getAvailableAudio(): AudioTrack[];
            getAvailableAudioQualities(): AudioQuality[];
            //getAvailableImpressionServers
            //getAvailableLicenseServers
            //getAvailableSubtitles
            getAvailableVideoQualities(): VideoQuality[];
            getConfig(getMergedConfig?: boolean): any;
            getCurrentTime(): number;
            //getDownloadedAudioData
            //getDownloadedVideoData
            //getDroppedFrames
            getDuration(): number;
            //getFigure
            //getManifest
            //getMaxTimeShift
            //getPlaybackAudioData
            //getPlaybackSpeed
            //getPlaybackVideoData
            //getPlayerType
            //getSnapshot
            //getStreamType
            //getSubtitle
            //getSupportedDRM
            //getSupportedTech
            getThumb(time: number): Thumbnail;
            //getTimeShift
            //getTotalStalledTime
            //getVersion
            getVideoBufferLength(): number;
            getVolume(): number;
            getVRStatus(): VRStatus;
            //hasEnded
            //isAd
            //isCastAvailable
            //isCasting
            //isDRMSupported
            isFullscreen(): boolean;
            //isLive
            isMuted(): boolean;
            //isPaused
            isPlaying(): boolean;
            //isReady
            //isSetup
            //isStalled
            //load
            mute(): Player;
            pause(): Player;
            play(): Player;
            //removeEventHandler
            //removeSubtitle
            //scheduleAd
            seek(time: number): boolean;
            setAudio(trackID: string): Player;
            setAudioQuality(audioQualityID: string): Player;
            //setAuthentication
            //setLastSegment
            //setPlaybackSpeed
            //setPosterImage
            //setQueryParameters
            //setSkin
            //setSubtitle
            //setup
            //setVideoElement
            setVideoQuality(videoQualityID: string): Player;
            setVolume(volume: number): Player;
            setVRStereo(enableStereo: boolean): boolean;
            //skipAd
            //timeShift
            //unload
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

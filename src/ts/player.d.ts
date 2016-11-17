/*
 * Copyright (C) 2016, bitmovin GmbH, All Rights Reserved
 *
 * Authors: Mario Guggenberger <mario.guggenberger@bitmovin.com>
 *
 * This source code and its use and distribution, is subject to the terms
 * and conditions of the applicable license agreement.
 */

/// <reference path="player-config.d.ts" />
/// <reference path="player-events.d.ts" />

declare namespace bitmovin {

    /**
     * Creates and returns a new player instance attached to the provided DOM element ID.
     * @param domElementID the ID of the DOM (i.e. HTML) element that the player should be added to
     */
    function player(domElementID: string): player.Player;

    namespace player {

        /**
         * The direction in which the viewport of the VR player is looking.
         */
        interface ViewingDirection {
            /**
             * Rotation around the vertical axis in degrees.
             */
            yaw: number;
            /**
             * Rotation around the horizontal axis in degrees.
             */
            pitch: number;
            /**
             * Rotation around the depth axis in degrees.
             */
            roll: number;
        }

        interface VRStatus {
            /**
             * The type of the VR content. Either one of the {@link VR.CONTENT_TYPE} enum values or "none" for
             * non-VR content.
             * TODO add "none" to CONTENT_TYPE enum
             */
            contentType: VR.CONTENT_TYPE | string;
            /**
             * The current playback state. Is either "ready" (if playback has not yet started), "playing"
             * (if VR content is playing) or "error" if an error occurred and VR playback has been disabled.
             * Will only be present if contentType is not "none".
             * TODO introduce PlaybackState enum
             */
            playbackState?: string;
            /**
             * The last error that occurred. Will only be present if playbackState equals "error".
             * TODO update description to PlaybackState.Error enum value
             */
            lastError?: string;
            /**
             * True, if the content is currently played back in stereo. Will only be present if contentType is
             * not "none" and playbackState is not "error".
             * TODO update description with enum values
             */
            isStereo?: boolean;
            /**
             * The direction the player is currently facing. Will only be present if contentType is not "none"
             * and playbackState is not "error".
             * TODO update description with enum values
             */
            viewingDirection?: ViewingDirection;
        }

        /**
         * Properties of a thumbnail out of a seeking thumbnail preview definition.
         */
        interface Thumbnail {
            /**
             * Start time of the thumbnail.
             */
            start: number;
            /**
             * End time of the thumbnail.
             */
            end: number;
            /**
             * Width of the thumbnail.
             */
            w: number;
            /**
             * Height of the thumbnail.
             */
            h: number;
            /**
             * Index of the thumbnail in its spritesheet.
             */
            i: number;
            /**
             * Horizontal offset of the thumbnail in its spritesheet.
             */
            x: number;
            /**
             * Vertical offset of the thumbnail in its spritesheet.
             */
            y: number;
            /**
             * URL of the spritesheet.
             */
            url: string;
            /**
             * Raw cue data.
             */
            text: string;
        }

        /**
         * Quality definition of a media representation.
         */
        interface Quality {
            /**
             * The bitrate of the media representation.
             */
            bitrate: number;
            /**
             * The id of the media representation.
             */
            id: string;
            /**
             * The label of the media representation that should be exposed to the user (e.g. in the UI).
             */
            label: string;
        }

        /**
         * Quality definition of an audio representation.
         */
        interface AudioQuality extends Quality {
        }

        /**
         * Quality definition of a video representation.
         */
        interface VideoQuality extends Quality {
            /**
             * The width of the video representation.
             */
            width: number;
            /**
             * The heights of the video representation.
             */
            height: number;
        }

        /**
         * Definition of an audio track.
         */
        interface AudioTrack {
            /**
             * The id of the audio track that is used to identify and set the track.
             */
            id: string;
            /**
             * The language of the audio track.
             */
            lang: string;
            /**
             * The text used to represent this track to the user (e.g. in the UI).
             */
            label: string;
        }

        /**
         * Defines messages to be shown during ad playback.
         */
        interface SkipMessage {
            /**
             * The message that is displayed until the ad can be skipped.
             * Has the placeholder 'xx', which is replaced by the remaining time until the ad can be skipped.
             * TODO replace placeholder with a better pattern, e.g. "{remainingTime}" instead of "xx" which can
             *      appear in normal text (for backwards compatibility, the new pattern could be matched first and
             *      if not found, fallback to the old pattern)
             */
            countdown: string;
            /**
             * The message that is displayed once the ad can be skipped.
             */
            skip: string;
        }

        /**
         * Options for scheduling an ad through {@link Player#scheduleAd}.
         * TODO check how this relates to {@link AdvertisingScheduleItem}/{@link AdvertisingConfig} and if interfaces can be consolidated
         */
        interface ScheduleAdOptions {
            timeOffset?: any;
            persistent?: boolean;
            adMessage?: string;
            skipMessage?: SkipMessage;
            style?: Object;
            skip?: Object;
        }

        /**
         * A player and streaming technology tuple describing a supported technology of the player.
         */
        interface SupportedTech {
            /**
             * A string determining a rendering mode used to render the player.
             * Possible values are html5, flash, and native.
             * TODO convert to enum
             */
            player: string;
            /**
             * A string determining a streaming technology.
             * Possible values are currently dash, hls, and progressive.
             * TODO convert to enum
             */
            streaming: string;
        }

        /**
         * Definition of a subtitle/caption track.
         */
        interface Subtitle {
            /**
             * Used to identify and set the subtitle track.
             */
            id: string;
            /**
             * The language of the subtitle track.
             */
            lang: string;
            /**
             * The text used to represent this track to the user (e.g. in the UI).
             */
            label: string;
            /**
             * The URL to the subtitle track.
             * TODO check why this is missing from the API docs
             */
            url: string;
        }

        /**
         * A snapshot of a video frame.
         */
        interface Snapshot {
            /**
             * The width of the image.
             */
            width: number;
            /**
             * The height of the image.
             */
            height: number;
            /**
             * A Base64-encoded string that contains the image.
             */
            data: String;
        }

        /**
         * Data describing a downloaded segment of a representation.
         */
        interface DownloadedData {
            /**
             * The id of the representation.
             */
            id: string;
            /**
             * The bitrate of the representation.
             */
            bitrate: number;
            /**
             * True if the player’s logic automatically selects the best representation (default),
             * or false if a fixed representation is currently chosen.
             */
            isAuto: boolean;
        }

        /**
         * Data describing a downloaded audio segment of an audio representation.
         */
        interface DownloadedAudioData extends DownloadedData {
        }

        /**
         * Data describing a downloaded video segment of a video representation.
         */
        interface DownloadedVideoData extends DownloadedData {
            /**
             * The width of the video representation.
             */
            width: number
            /**
             * The height of the video representation.
             */
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
            /**
             * TODO is it possible to take a snapshot of DRM protected content?
             * @param type
             * @param quality
             */
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
            setup(userConfig: Config, forceTechnology?: string): Promise<Player>;
            setVideoElement(videoElement: HTMLElement): void;
            setVideoQuality(videoQualityID: string): Player;
            setVolume(volume: number): Player;
            setVRStereo(enableStereo: boolean): boolean;
            skipAd(): void;
            timeShift(offset: number): Player;
            unload(): Player;
            unmute(): Player;
        }

        namespace VR {
            enum CONTENT_TYPE {
                /**
                 * A single equirectangular video typically used for 2D VR/360 content.
                 */
                SINGLE,
                /**
                 * Two equirectangular videos for 3D content in top-and-bottom position.
                 */
                TAB,
                /**
                 *  Two equirectangular videos for 3D content in side-by-side position.
                 */
                SBS
            }
        }
    }
}

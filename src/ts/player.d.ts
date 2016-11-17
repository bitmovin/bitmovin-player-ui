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

    function player(htmlElementID: string): player.Player;

    namespace player {

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
            url: string;
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

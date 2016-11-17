/*
 * Copyright (C) 2016, bitmovin GmbH, All Rights Reserved
 *
 * Authors: Mario Guggenberger <mario.guggenberger@bitmovin.com>
 *
 * This source code and its use and distribution, is subject to the terms
 * and conditions of the applicable license agreement.
 */

declare namespace bitmovin {

    namespace player {

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

        interface PlayerEvent {
            timestamp: number;
            type: EVENT;
        }

        interface SubtitleChangedEvent extends PlayerEvent {
            time: number;
            sourceSubtitle: Subtitle;
            targetSubtitle: Subtitle;
        }

        interface SubtitleAddedEvent extends PlayerEvent {
            subtitle: Subtitle;
        }

        interface SubtitleRemovedEvent extends PlayerEvent {
            subtitleId: string;
        }

        interface SubtitleCueEvent extends PlayerEvent {
            start: number;
            end: number;
            text: string;
            region?: string;
            regionStyle?: string;
        }

        interface VolumeChangeEvent extends PlayerEvent {
            sourceVolume: number;
            targetVolume: number;
        }

        interface CastStartedEvent extends PlayerEvent {
        }

        interface CastWaitingForDeviceEvent extends PlayerEvent {
            castPayload: {
                currentTime: number;
                deviceName: string;
                timestamp: number;
                type: string;
            }
        }

        interface CastLaunchedEvent extends PlayerEvent {
            resuming: boolean;
        }

        interface CastStoppedEvent extends PlayerEvent {
        }

        interface PlayerEventCallback {
            (event: PlayerEvent): void;
        }
    }
}
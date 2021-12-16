import {PlayerAPI} from "bitmovin-player";

export function getMinBufferLevel(player: PlayerAPI): number {

    const playerDuration = player.getDuration();

    const videoBufferLength = player.getVideoBufferLength();
    const audioBufferLength = player.getAudioBufferLength();
    // Calculate the buffer length which is the smaller length of the audio and video buffers. If one of these
    // buffers is not available, we set it's value to MAX_VALUE to make sure that the other real value is taken
    // as the buffer length.
    let bufferLength = Math.min(
        videoBufferLength != null ? videoBufferLength : Number.MAX_VALUE,
        audioBufferLength != null ? audioBufferLength : Number.MAX_VALUE);
    // If both buffer lengths are missing, we set the buffer length to zero
    if (bufferLength === Number.MAX_VALUE) {
        bufferLength = 0;
    }

    return 100 / playerDuration * bufferLength;
}

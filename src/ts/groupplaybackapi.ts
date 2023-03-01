import { PlayerAPI } from 'bitmovin-player';
/**
 * The Group Playback API offers control over synchronized playback of a group of clients, e.g. for Apple SharePlay
 * sessions. 

 * Note: The API currently only covers the immediate needs of the iOS SDK in combination with our UI which is regarding
 * temporarily suspending synchronization of the player from the group. But it is open to be extended as needed in the
 * future.
 */

/**
 * Reason for suspending the synchronization with the group.
 */
export enum GroupPlaybackSuspensionReason {
  UserIsScrubbing = "userIsScrubbing",
}

/**
 * A representation of a temporary break in participation.
 */
export interface GroupPlaybackSuspension {
  /**
   * The reason for the suspension.
   */
  reason: GroupPlaybackSuspensionReason;

  /**
   * A unique identifier.
   */
  id: string;
}

/**
 * Options to be considered upon ending a suspension.
 */
interface EndGroupPlaybackSuspensionOptions {
  /**
   * A proposed time for the group to seek to.
   */
  proposedPlaybackTime?: number;
}

/**
 * Group Playback API offering control over the player's participation in synchronized playback of a group of clients.
 * For example, an Apple SharePlay session.
 */
interface GroupPlaybackAPI {
  /**
   * Begins a new suspension.
   *
   * Temporarily suspends the local player's synchronization with the group. While suspended, any local playback control
   * action (e.g. play, pause, seek) will not be forwarded to the group and any action originating from another group
   * participant will not be performed on the local player.
   *
   * @remarks
   * It is possible for multiple suspensions to exist exist simultaneously with different suspension reasons. The player
   * will re-synchronize with the group once all existing suspensions have ended.
   *
   * @param reason - The reason for the suspension.
   * @returns A suspension object.
   */
  beginSuspension(reason: GroupPlaybackSuspensionReason): GroupPlaybackSuspension;

  /**
   * Ends the given suspension.
   *
   * @param suspension - The suspension to be ended.
   * @param options - Optional. Options to be considered when ending the suspension, e.g. a proposed seek time for the group.
   */
  endSuspension(suspension: GroupPlaybackSuspension, options?: EndGroupPlaybackSuspensionOptions): void;

  /**
   * Whether the player is currently participating in a group playback session.
   */
  hasJoined(): boolean;

  /**
   * Whether the player is currently suspending synchronization with the group.
   * Can only return true if `hasJoined()` also is true.
   */
  isSuspended(): boolean;
}


export interface ExtendedPlayerAPI extends PlayerAPI {
  /**
   * Group Playback API
   *
   * @remarks
   * This API is optional as not every platform supports group playback.
   */
  groupPlayback?: GroupPlaybackAPI;
}

// These event names are currently emitted only for pause ads. They are not yet part of the
// `PlayerEvent` enum of the player version this UI builds against.
export const NON_LINEAR_AD_STARTED_EVENT: string = 'nonlinearadstarted';

export const NON_LINEAR_AD_ENDED_EVENTS: ReadonlyArray<string> = ['nonlinearadfinished', 'nonlinearadskipped'];

export const NON_LINEAR_AD_EVENTS: ReadonlyArray<string> = [NON_LINEAR_AD_STARTED_EVENT, ...NON_LINEAR_AD_ENDED_EVENTS];

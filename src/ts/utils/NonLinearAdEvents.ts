// These event names are currently emitted only for pause ads.
export const NON_LINEAR_AD_STARTED_EVENTS: ReadonlyArray<string> = ['nonlinearadstarted', 'onNonLinearAdStarted'];

export const NON_LINEAR_AD_ENDED_EVENTS: ReadonlyArray<string> = [
  'nonlinearadfinished',
  'onNonLinearAdFinished',
  'nonlinearadskipped',
  'onNonLinearAdSkipped',
];

export const NON_LINEAR_AD_EVENTS: ReadonlyArray<string> = [
  ...NON_LINEAR_AD_STARTED_EVENTS,
  ...NON_LINEAR_AD_ENDED_EVENTS,
];

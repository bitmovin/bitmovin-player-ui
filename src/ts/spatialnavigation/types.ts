export type Callback<T> = (data: T, target: HTMLElement, preventDefault: () => void) => boolean;
export type NavigationCallback = Callback<Direction>;
export type ActionCallback = Callback<Action>;
export type KeyMap = {
  [keyCode: number]: Action | Direction;
};

export enum Direction {
  UP = 'up',
  DOWN = 'down',
  LEFT = 'left',
  RIGHT = 'right',
}

export enum Action {
  SELECT = 'select',
  BACK = 'back',
}

import type { PlayerAPI } from 'bitmovin-player';

import { Button, ButtonConfig } from '../../src/ts/components/buttons/Button';
import type { ComponentConfig } from '../../src/ts/components/Component';
import { Component, ViewMode } from '../../src/ts/components/Component';
import type { Container, ContainerConfig } from '../../src/ts/components/Container';
import { ControlBar } from '../../src/ts/components/ControlBar';
import { TitleBar } from '../../src/ts/components/TitleBar';
import { EventDispatcher, NoArgs } from '../../src/ts/EventDispatcher';
import type { UIContainer } from '../../src/ts/components/UIContainer';
import type { UIInstanceManager } from '../../src/ts/UIManager';
import { MockHelper } from '../helper/MockHelper';

const FOCUS_VISIBLE_CLASS = '{{PREFIX}}-focus-visible';

type ContainerFactory = (button: Button<ButtonConfig>) => Container<ContainerConfig>;

const autoHidingContainers: { name: string; create: ContainerFactory }[] = [
  { name: 'ControlBar', create: button => new ControlBar({ components: [button] }) },
  { name: 'TitleBar', create: button => new TitleBar({ components: [button] }) },
];

describe.each(autoHidingContainers)('$name keyboard focus', ({ create }) => {
  let playerMock: PlayerAPI;
  let uiInstanceManagerMock: UIInstanceManager;
  let onInactive: EventDispatcher<UIContainer, NoArgs>;
  let container: Container<ContainerConfig>;
  let button: Button<ButtonConfig>;
  let outsideElement: HTMLElement;
  let viewModes: ViewMode[];

  const buttonElement = () => button.getDomElement().get(0);

  const focusButton = ({ keyboard }: { keyboard: boolean }) => {
    // The FocusVisibilityTracker marks keyboard focus before the focusin event bubbles up
    buttonElement().classList.toggle(FOCUS_VISIBLE_CLASS, keyboard);
    buttonElement().dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
  };

  const blurButton = (relatedTarget: HTMLElement | null) => {
    buttonElement().classList.remove(FOCUS_VISIBLE_CLASS);
    buttonElement().dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget }));
  };

  const configure = ({ spatialNavigation = false } = {}) => {
    jest.spyOn(uiInstanceManagerMock, 'hasSpatialNavigation').mockReturnValue(spatialNavigation);
    container.configure(playerMock, uiInstanceManagerMock);
    document.body.appendChild(container.getDomElement().get(0));
  };

  beforeEach(() => {
    playerMock = MockHelper.getPlayerMock();
    uiInstanceManagerMock = MockHelper.getUiInstanceManagerMock();
    onInactive = new EventDispatcher<UIContainer, NoArgs>();
    Object.defineProperty(uiInstanceManagerMock, 'onInactive', { value: onInactive });

    button = new Button({});
    container = create(button);
    viewModes = [];
    container.onViewModeChanged.subscribe((_, { mode }) => viewModes.push(mode));

    outsideElement = document.createElement('button');
    document.body.appendChild(outsideElement);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should keep the UI shown while a control inside has keyboard focus', () => {
    configure();

    focusButton({ keyboard: true });

    expect(viewModes).toEqual([ViewMode.Persistent]);
  });

  it('should not keep the UI shown when a control inside is focused by a pointer', () => {
    configure();

    focusButton({ keyboard: false });

    expect(viewModes).toEqual([]);
  });

  it.each`
    destination
    ${'outside of the UI'}
    ${'nowhere'}
  `('should let the UI hide again when keyboard focus moves $destination', ({ destination }) => {
    configure();
    focusButton({ keyboard: true });

    blurButton(destination === 'nowhere' ? null : outsideElement);

    expect(viewModes).toEqual([ViewMode.Persistent, ViewMode.Temporary]);
  });

  it('should keep the UI shown while keyboard focus moves between controls inside', () => {
    configure();
    focusButton({ keyboard: true });
    const otherControl = document.createElement('button');
    container.getDomElement().get(0).appendChild(otherControl);

    blurButton(otherControl);

    expect(viewModes).toEqual([ViewMode.Persistent]);
  });

  it.each`
    trigger                                        | act
    ${'is hidden'}                                 | ${() => container.hide()}
    ${'belongs to a UI variant that got inactive'} | ${() => onInactive.dispatch(undefined)}
    ${'is released'}                               | ${() => container.release()}
  `('should let the UI hide again when the focused container $trigger', ({ act }: { act: () => void }) => {
    configure();
    focusButton({ keyboard: true });

    act();

    expect(viewModes).toEqual([ViewMode.Persistent, ViewMode.Temporary]);
  });

  it('should not keep the UI shown with spatial navigation, where focus never leaves the UI', () => {
    configure({ spatialNavigation: true });

    focusButton({ keyboard: true });

    expect(viewModes).toEqual([]);
  });

  it('should forward the view mode to the UI instance manager', () => {
    const dispatchSpy = jest.spyOn(uiInstanceManagerMock.onComponentViewModeChanged, 'dispatch');
    configure();

    focusButton({ keyboard: true });

    expect(dispatchSpy).toHaveBeenCalledWith(container as unknown as Component<ComponentConfig>, {
      mode: ViewMode.Persistent,
    });
  });
});

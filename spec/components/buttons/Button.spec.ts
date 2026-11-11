import { Button, ButtonConfig } from '../../../src/ts/components/buttons/Button';
import { ToggleButton, ToggleButtonConfig } from '../../../src/ts/components/buttons/ToggleButton';

const buttonFactories = [
  { name: 'Button', create: () => new Button<ButtonConfig>({}) },
  { name: 'ToggleButton', create: () => new ToggleButton<ToggleButtonConfig>({}) },
];

describe('Button', () => {
  it.each(buttonFactories)('should not activate a disabled $name', ({ create }) => {
    const button = create();
    const onClickSpy = jest.fn();
    button.onClick.subscribe(onClickSpy);
    button.disable();

    // Keyboard activation of a focused button reaches the component as a click
    button.getDomElement().get(0).click();

    expect(onClickSpy).not.toHaveBeenCalled();
  });

  it.each(buttonFactories)('should activate a $name again once it is enabled', ({ create }) => {
    const button = create();
    const onClickSpy = jest.fn();
    button.onClick.subscribe(onClickSpy);
    button.disable();
    button.enable();

    button.getDomElement().get(0).click();

    expect(onClickSpy).toHaveBeenCalledTimes(1);
  });
});

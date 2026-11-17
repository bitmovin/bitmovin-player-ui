import { isElementRendered } from '../../src/ts/utils/isElementRendered';

describe('isElementRendered', () => {
  let row: HTMLElement;
  let button: HTMLButtonElement;

  beforeEach(() => {
    row = document.createElement('div');
    button = document.createElement('button');
    row.appendChild(button);
    document.body.appendChild(row);
  });

  afterEach(() => {
    document.body.innerHTML = '';
    delete (button as Partial<HTMLElement>).checkVisibility;
  });

  it('should accept a visible element', () => {
    expect(isElementRendered(button, 'ui-hidden', row)).toBe(true);
  });

  it.each`
    description                                      | hide
    ${'is disabled'}                                 | ${() => (button.disabled = true)}
    ${'carries the hidden class'}                    | ${() => button.classList.add('ui-hidden')}
    ${'is inside an ancestor with the hidden class'} | ${() => row.classList.add('ui-hidden')}
    ${'has display: none'}                           | ${() => (button.style.display = 'none')}
    ${'is inside an ancestor with display: none'}    | ${() => (row.style.display = 'none')}
    ${'has visibility: hidden'}                      | ${() => (button.style.visibility = 'hidden')}
    ${'inherits visibility: hidden'}                 | ${() => (row.style.visibility = 'hidden')}
  `('should reject an element that $description', ({ hide }: { hide: () => void }) => {
    hide();

    expect(isElementRendered(button, 'ui-hidden', row)).toBe(false);
  });

  it('should only look for the hidden class up to the root', () => {
    document.body.classList.add('ui-hidden');

    expect(isElementRendered(button, 'ui-hidden', row)).toBe(true);

    document.body.classList.remove('ui-hidden');
  });

  it('should ask checkVisibility to include visibility: hidden where the browser supports it', () => {
    const checkVisibility = jest.fn().mockReturnValue(false);
    button.checkVisibility = checkVisibility;

    expect(isElementRendered(button, 'ui-hidden', row)).toBe(false);
    expect(checkVisibility).toHaveBeenCalledWith({ visibilityProperty: true, checkVisibilityCSS: true });
  });
});

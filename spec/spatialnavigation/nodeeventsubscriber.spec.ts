import { mockHtmlElement } from '../helper/mockComponent';
import { NodeEventSubscriber } from '../../src/ts/spatialnavigation/nodeeventsubscriber';

describe('NodeEventSubscriber', () => {
  let htmlElementMock: jest.Mocked<HTMLElement>;
  let nodeEventSubscriber: NodeEventSubscriber;

  beforeEach(() => {
    htmlElementMock = mockHtmlElement();
    nodeEventSubscriber = new NodeEventSubscriber();
  });

  describe('on', () => {
    it('should attach event handler to passed in html element', () => {
      const listener = () => false;
      nodeEventSubscriber.on(htmlElementMock, 'click', listener);

      expect(htmlElementMock.addEventListener).toHaveBeenCalledWith('click', listener, undefined);
    });
  });

  describe('off', () => {
    it('should remove event handler from passed in html element', () => {
      const listener = () => false;
      nodeEventSubscriber.on(htmlElementMock, 'click', listener);
      nodeEventSubscriber.off(htmlElementMock, 'click', listener);

      expect(htmlElementMock.removeEventListener).toHaveBeenCalledWith('click', listener, undefined);
    });
  });

  describe('release', () => {
    it('should clear up attached listeners', () => {
      const listener = () => false;
      nodeEventSubscriber.on(htmlElementMock, 'click', listener);

      nodeEventSubscriber.release();
      expect(htmlElementMock.removeEventListener).toHaveBeenCalledWith('click', listener, undefined);
    });
  });
});

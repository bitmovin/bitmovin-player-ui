import { PlayerWrapper } from '../src/ts/uimanager';
import { PlayerAPI } from 'bitmovin-player';

// This just simulates a Class that can be wrapped by our PlayerWrapper.
// To enable this simple class structure we need a lot of any casts in the tests.
class A {
  private value: object = undefined;

  get a() {
    return this.value;
  }

  // This is needed to change the actual value of the property
  giveValueAValue() {
    this.value = { foo: 'bar' };
  }
}

class B extends A {
  get b() {
    return {};
  }
}

class C extends B {
  get c() {
    return {};
  }
}

describe('UIManager', () => {
  describe('PlayerWrapper', () => {
    let playerWrapper: PlayerWrapper;

    describe('without inheritance', () => {
      let superClassInstance: A;

      beforeEach(() => {
        const testInstance: PlayerAPI = new A() as any as PlayerAPI;
        playerWrapper = new PlayerWrapper(testInstance);
        (testInstance as any).giveValueAValue(); // Change the value of the actual property to simulate async loaded module
        superClassInstance = playerWrapper.getPlayer() as any as A;
      });

      it('wraps functions', () => {
        expect(superClassInstance.a).not.toBeUndefined();
      });
    });

    describe('with inheritance', () => {
      let inheritedClassInstance: C;

      beforeEach(() => {
        const testInstance: PlayerAPI = new C() as any as PlayerAPI;
        playerWrapper = new PlayerWrapper(testInstance);
        (testInstance as any).giveValueAValue(); // Change the value of the actual property to simulate async loaded module
        inheritedClassInstance = playerWrapper.getPlayer() as any as C;
      });

      it('wraps functions of super class', () => {
        expect(inheritedClassInstance.a).not.toBeUndefined();
      });
    });
  });
});

import { async, fakeAsync, tick } from '@angular/core/testing';
import { LoadingController } from '@ionic/angular';

import noop from 'lib/noop';

import { LoadingControllerMock, LoadingMock } from 'mocks';
import { beforeEachCompiler, FixturePayload } from 'test-base';

import { LoadingSpinnerComponent } from './loading-spinner';
import Spy = jasmine.Spy;

// tslint:disable:no-string-literal

const testDelayInMs: number = 5000;

let testFixturePayload: FixturePayload<LoadingSpinnerComponent>;

const testLoadingMock: LoadingMock = LoadingMock.instance();
testLoadingMock['onDidDismiss'].and.callFake((fn: Function) => {
  setTimeout(fn, testDelayInMs);
});
testLoadingMock['present'].and.callFake(() => {
  noop();
});

describe('LoadingSpinnerComponent', () => {
  beforeEach(async(() => {
    beforeEachCompiler(
      LoadingSpinnerComponent,
      [{ provide: LoadingController, useValue: LoadingControllerMock.instance(testLoadingMock) }],
      [],
      [LoadingSpinnerComponent]
    )
      .then((fixturePayload: FixturePayload<LoadingSpinnerComponent>) => {
        testFixturePayload = fixturePayload;
      })
      .catch((error: any) => {
        console.log(error); // tslint:disable-line
      });
  }));

  describe('Lifecycle', () => {
    it('should create loading spinner component', () => {
      expect(testFixturePayload.instance).toBeDefined();
    });
  });

  describe('Validate behavior', () => {
    beforeEach(() => {
      testFixturePayload.instance['spinnerDisplayPending'] = false;
    });

    afterEach(() => {
      testFixturePayload.instance['spinnerDisplayPending'] = false;
      if (testFixturePayload.instance['spinner']) {
        testFixturePayload.instance['spinner'].dismiss();
        testFixturePayload.instance['spinner'] = undefined;
      }
    });

    it('should show spinner and then dismiss (no delay)', () => {
      const animateSpy: Spy = spyOn(<any>testFixturePayload.instance, 'createLoadingAnimation').and.callThrough();
      testFixturePayload.instance.show();
      expect(animateSpy).toHaveBeenCalled();
    });

    it('should show spinner and then dismiss (preconfigured delay)', fakeAsync(() => {
      const animateSpy: Spy = spyOn(<any>testFixturePayload.instance, 'createLoadingAnimation').and.callThrough();
      testFixturePayload.instance.showSpinner();
      expect(animateSpy).not.toHaveBeenCalled();
      tick(2000);
      expect(animateSpy).toHaveBeenCalled();
    }));

    it('should show spinner given a custom delay', () => {
      const presentSpy: Spy = spyOn(<any>testFixturePayload.instance, 'presentSpinner').and.callThrough();
      const animateSpy: Spy = spyOn(<any>testFixturePayload.instance, 'createLoadingAnimation').and.callThrough();

      testFixturePayload.instance.showSpinnerWithDuration(testDelayInMs);
      expect(presentSpy).toHaveBeenCalledWith(testDelayInMs);
      expect(animateSpy).toHaveBeenCalledWith(testDelayInMs);
    });

    it('should clean up spinner', () => {
      testFixturePayload.instance.show();
      testFixturePayload.instance['setSpinnerPending'](true);
      testFixturePayload.instance.cleanup();
      expect(testFixturePayload.instance['spinner']).toBeUndefined();
    });

    it('should dismiss spinner', () => {
      const setSpy: Spy = spyOn(<any>testFixturePayload.instance, 'setPending');
      const cleanupSpy: Spy = spyOn(testFixturePayload.instance, 'cleanup');

      testFixturePayload.instance['setSpinnerPending'](true);
      testFixturePayload.instance.dismiss();
      expect(setSpy).toHaveBeenCalledWith(false);
      expect(cleanupSpy).toHaveBeenCalled();
    });
  });
});

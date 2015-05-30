"use strict";

import * as reactive from '../../src/reactive/index';

describe('.asObservable', () => {
    var subject;

    beforeEach(() => {
        subject = new reactive.Subject();
    });

    it('.asObservable propagates onCompleted', () => {
        var onCompleteCalled = false;
        subject.asObservable().observe(
            () => { },
            () =>{ },
            () => onCompleteCalled = true
        );
        subject.onCompleted();
        expect(onCompleteCalled).toEqual(true);
    });
});
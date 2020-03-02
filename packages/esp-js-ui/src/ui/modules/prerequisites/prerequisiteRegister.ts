import * as Rx from 'rxjs';
import {Unit} from '../../../core';

export interface PrerequisiteRegister {
    //Useful when you want late-bound dependencies
    registerStreamFactory(factory: () => Rx.Observable<Unit>, name: string): void;
    registerStream(stream: Rx.Observable<Unit>, name: string): void;
    registerAction(action: () => void, name: string);
}

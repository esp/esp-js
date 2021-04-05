import { Observable } from 'rxjs';
import {Unit} from '../../../core';

export interface PrerequisiteRegister {
    //Useful when you want late-bound dependencies
    registerStreamFactory(factory: () => Observable<Unit>, name: string): void;
    registerStream(stream: Observable<Unit>, name: string): void;
    registerAction(action: () => void, name: string);
}

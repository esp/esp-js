import * as Rx from 'rx';
import Unit from '../../../core/unit';

interface PrerequisiteRegistrar {
    //Useful when you want late-bound dependencies
    registerStreamFactory(factory: () => Rx.Observable<Unit>, name: string): void;
    registerStream(stream: Rx.Observable<Unit>, name: string): void;
    registerAction(action: () => void, name: string);
}

export default PrerequisiteRegistrar;
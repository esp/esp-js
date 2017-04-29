import * as Rx from 'rx';
import Unit from '../../../core/unit';

interface PrerequisiteRegistrar {
    registerStream(stream: Rx.Observable<Unit>, name: string): void;
    registerAction(action: () => void, name: string);
}

export default PrerequisiteRegistrar;


import {Observer} from './Observer';
import {Disposable} from '../system/disposables/disposable';

export interface Subscribe {
    (observer: Observer): Disposable;
}
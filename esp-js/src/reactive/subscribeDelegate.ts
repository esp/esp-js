import {Observer} from './observer';
import {Disposable} from '../system/disposables/disposable';

export interface Subscribe<T> {
    (observer: Observer<T>): Disposable;
}
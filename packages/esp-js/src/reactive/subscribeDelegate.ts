import {Observer} from './observer';
import {Disposable} from '../system/disposables';

export interface Subscribe<T> {
    (observer: Observer<T>): Disposable;
}
import {Container} from 'microdi-js';

declare module 'microdi-js' {
    interface Container {
        isDisposed: boolean;
    }
}

import * as React from 'react';
import { Router } from 'esp-js';
import { Modal } from '../models/modal';
export interface ModalViewProps {
    model: Modal;
    router: Router;
}
export declare class ModalView extends React.Component<ModalViewProps, {}> {
    render(): JSX.Element;
}

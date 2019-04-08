import * as React from 'react';
import { Router } from 'esp-js';
import { ShellModel } from '../models/shellModel';
export declare class ShellView extends React.Component<{
    model: ShellModel;
    router: Router;
}, any> {
    render(): JSX.Element;
}

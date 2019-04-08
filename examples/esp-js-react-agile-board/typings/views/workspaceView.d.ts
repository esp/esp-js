import * as React from 'react';
import { Router } from 'esp-js';
import { Workspace } from '../models/workspace';
export interface WorkspaceViewProps {
    model: Workspace;
    router: Router;
}
export declare class WorkspaceView extends React.Component<WorkspaceViewProps, {}> {
    render(): JSX.Element;
}

import * as React from 'react';
import { Story } from '../models/story';
import { Router } from 'esp-js';
export interface StoryDetailsViewProps {
    story: Story;
    router: Router;
}
export declare class StoryDetailsView extends React.Component<StoryDetailsViewProps, {}> {
    constructor(props?: StoryDetailsViewProps, context?: any);
    shouldComponentUpdate(nextProps: Readonly<StoryDetailsViewProps>, nextState: Readonly<StoryDetailsViewProps>, nextContext: any): boolean;
    render(): JSX.Element;
}

import * as React from 'react';
import { Story } from '../models/story';
import { Router } from 'esp-js';
export interface StoryListItemViewProps {
    story: Story;
    router: Router;
}
export declare class StoryListItemView extends React.Component<StoryListItemViewProps, {}> {
    _publishEvent(eventType: any, event: any): void;
    render(): JSX.Element;
}

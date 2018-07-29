import * as classnames from 'classnames';
import * as React from 'react';
import { EventConst } from '../eventConst';
import { EpicLabel } from './epicLabel';
import { Story } from '../models/story';
import { StoryStatus } from '../models/storyStatus';
import { Router } from 'esp-js';
import { shouldUpdateMixin } from 'esp-js-react';

export interface StoryListItemViewProps {
    story: Story;
    router: Router;
}

@shouldUpdateMixin((nextProps: StoryListItemViewProps) => {
    return {
        isSelected: nextProps.story.isSelected,
        name: nextProps.story.name,
        description: nextProps.story.description,
        status: nextProps.story.status,
        epicName: nextProps.story.epic.name,
        epicColour: nextProps.story.epic.colour
    };
})
export class StoryListItemView extends React.Component<StoryListItemViewProps, {}> {
    _publishEvent(eventName, event) {
        this.props.router.publishEvent(this.props.story.modelId, eventName, event);
    }

    render() {
        let story = this.props.story;
        let className = classnames('storyListItem', {'selectedItem': story.isSelected});
        return (
            <div className={className} onClick={() => {this._publishEvent(EventConst.STORY_SELECTED, {story});}}>
                <label>Story:{story.name}</label>
                <p>{story.description}</p>
                <EpicLabel colour={story.epic.colour} displayText={story.epic.name}/>
                {story.status === StoryStatus.DONE ? <label>Done</label> : null}
            </div>
        );
    }
}
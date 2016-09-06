import * as esp from 'esp-js';
import classnames from 'classnames';
import React from 'react';
import EventConsts from '../eventConsts';
import EpicLabel from './epicLabel';
import Story from '../models/story';
import StoryStatus from '../models/storyStatus';

export default class StoryListItemView extends React.Component {
    static propTypes = {
        story: React.PropTypes.instanceOf(Story).isRequired,
        router: React.PropTypes.instanceOf(esp.Router).isRequired
    };

    _publishEvent(eventName, event) {
        this.props.router.publishEvent(this.props.story.modelId, eventName, event);
    }

    shouldComponentUpdate(nextProps, nextState) {
        // return nextProps.story.isDirty; when https://github.com/esp/esp-js-react/issues/1 is implemented
        return true;
    }

    render() {
        var story = this.props.story;
        let className = classnames('storyListItem', {'selectedItem':story.isSelected});
        return (
            <div className={className} onClick={() => {this._publishEvent(EventConsts.STORY_SELECTED, {story});}}>
                <label>Story:{story.name}</label>
                <p>{story.description}</p>
                <EpicLabel colour={story.epic.colour} displayText={story.epic.name} />
                {story.status === StoryStatus.DONE ? <label>Done</label> : null}
            </div>
        );
    }
}
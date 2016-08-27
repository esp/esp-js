import * as esp from 'esp-js';
import classnames from 'classnames';
import React from 'react';
import EventConsts from '../eventConsts';
import EpicLabel from './epicLabel';
import Story from '../models/story';

export default class StoryListItemView extends React.Component {
    static propTypes = {
        story: React.PropTypes.instanceOf(Story).isRequired,
        router: React.PropTypes.instanceOf(esp.Router).isRequired
    };

    _publishEvent(eventName, event) {
        this.props.router.publishEvent(this.props.story.modelId, eventName, event);
    }

    render() {
        var story = this.props.story;
        let className = classnames('storyListItem', {'selectedItem':story.isSelected});
        return (
            <div
                className={className}
                onClick={() => {this._publishEvent(EventConsts.STORY_SELECTED, {story});}}>
                <div>
                    <label>Story:</label>
                    <input
                        type='text'
                        value={story.name}
                        onChange={e => {this._publishEvent(EventConsts.STORY_NAME_CHANGED, {story, name:e.target.value});}} />
                </div>
                <EpicLabel epic={story.epic} />
                <input
                    type="button"
                    onClick={() => {this._publishEvent(EventConsts.EDIT_STORY, {story});}}
                    value="Edit"/>
            </div>
        );
    }
}
import * as esp from 'esp-js';
import classnames from 'classnames';
import React from 'react';
import EventConsts from '../eventConsts';
import EpicLabel from './epicLabel';

export default class StoryListItemView extends React.Component {
    static propTypes = {
        model: React.PropTypes.object.isRequired,
        router: React.PropTypes.instanceOf(esp.Router).isRequired
    };

    _publishEvent(eventName, event) {
        this.props.router.publishEvent(this.props.model.modelId, eventName, event);
    }

    render() {
        var model = this.props.model;
        let className = classnames('storyListItem', {'selectedItem':model.isSelected});
        return (
            <div
                className={className}
                onClick={() => {this._publishEvent(EventConsts.STORY_SELECTED, {story:model});}}>
                <div>
                    <label>Story:</label>
                    <input
                        type='text'
                        value={model.name}
                        onChange={e => {this._publishEvent(EventConsts.STORY_NAME_CHANGED, {storyId:model.storyId, name:e.target.value});}} />
                </div>
                <EpicLabel epic={model.epic} />
                <input
                    type="button"
                    onClick={() => {this._publishEvent(EventConsts.EDIT_STORY, {storyId:model.storyId});}}
                    value="Edit"/>
            </div>
        );
    }
}
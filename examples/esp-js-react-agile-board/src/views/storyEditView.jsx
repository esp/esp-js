import * as esp from 'esp-js';
import React from 'react';
import EventConsts from '../eventConsts';
import EpicLabel from './epicLabel';

export default class StoryEditView extends React.Component {
    static propTypes = {
        model: React.PropTypes.object.isRequired,
        router: React.PropTypes.instanceOf(esp.Router).isRequired
    };

    _publishEvent(eventName, event) {
        this.props.router.publishEvent(this.props.model.modelId, eventName, event);
    }

    render() {
        let story = this.props.model;
        return (
            <div className='storyEdit'>
                <label>Name</label>
                <input
                    type='text'
                    value={story.name}
                    onChange={e => this._publishEvent(EventConsts.STORY_NAME_CHANGED, {name: e.target.value, story})}/>
                <EpicLabel epic={story.epic} />
                <label>Description</label>
                <textarea
                    value={story.description}
                    onChange={e => this._publishEvent(EventConsts.STORY_DESCRIPTION_CHANGED, {description: e.target.value, story})}/>
            </div>
        )
    }
}
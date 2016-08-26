import React from 'react';
import EventConsts from '../eventConsts';
import EpicLabel from './epicLabel';

export default class StoryEditView extends React.Component {
    _publishEvent(eventName, event) {
        this.props.router.publishEvent(this.props.model.modelId, eventName, event);
    }
    render() {
        let model = this.props.model;
        return (
            <div className='storyEdit'>
                <label>Name</label>
                <input
                    type='text'
                    value={model.name}
                    onChange={e => this._publishEvent(EventConsts.STORY_NAME_CHANGED, {name: e.target.value, storyId: model.storyId})}/>
                <EpicLabel epic={model.epic} />
                <label>Description</label>
                <textarea
                    value={model.description}
                    onChange={e => this._publishEvent(EventConsts.STORY_DESCRIPTION_CHANGED, {description: e.target.value, storyId: model.storyId})}/>
            </div>
        )
    }
}
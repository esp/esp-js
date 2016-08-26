import React from 'react';
import EventConsts from '../eventConsts';
import EpicLabel from './epicLabel';

export default class StoryDetailsView extends React.Component {
    render() {
        let model = this.props.model;
        let router = this.props.router;
        return (
            <div className='storyDetails'>
                <h1>Story details</h1>
                <input
                    type='text'
                    value={model.name}
                    onChange={e => router.publishEvent(model.modelId, EventConsts.STORY_NAME_CHANGED, {storyId:model.storyId, name:e.target.value})} />
                <EpicLabel epic={model.epic} />
                <h3>Description</h3>
                <label>{model.description}</label>
                <h3>History</h3>
                <ul>
                    <li>Lorem ipsum dolor sit amet consectetuer.</li>
                    <li>Aenean commodo ligula eget dolor.</li>
                    <li>Aenean massa cum sociis natoque penatibus.</li>
                </ul>
                <input
                    type="button"
                    onClick={() => {router.publishEvent(model.modelId, EventConsts.EDIT_STORY, {storyId:model.storyId})}}
                    value="Edit"/>
            </div>
        )
    }
}
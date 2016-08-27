import * as esp from 'esp-js';
import React from 'react';
import EventConsts from '../eventConsts';
import EpicLabel from './epicLabel';
import Story from '../models/story';

export default class StoryDetailsView extends React.Component {
    static propTypes = {
        story: React.PropTypes.instanceOf(Story).isRequired,
        router: React.PropTypes.instanceOf(esp.Router).isRequired
    };

    render() {
        let story = this.props.story;
        let router = this.props.router;
        return (
            <div className='storyDetails'>
                <h1>Story details</h1>
                <input
                    type='text'
                    disabled={story.isDone}
                    value={story.name}
                    onChange={e => router.publishEvent(story.modelId, EventConsts.STORY_NAME_CHANGED, {story, name:e.target.value})} />
                <EpicLabel epic={story.epic} />
                <h3>Description</h3>
                <label>{story.description}</label>
                <h3>History</h3>
                <ul>
                    <li>Lorem ipsum dolor sit amet consectetuer.</li>
                    <li>Aenean commodo ligula eget dolor.</li>
                    <li>Aenean massa cum sociis natoque penatibus.</li>
                </ul>
                <div>
                    <input
                        type="button"
                        disabled={story.isDone}
                        onClick={() => {router.publishEvent(story.modelId, EventConsts.EDIT_STORY, {story})}}
                        value="Edit"/>
                    <input
                        type="button"
                        disabled={story.isDone}
                        onClick={() => {router.publishEvent(story.modelId, EventConsts.DONE_STORY, {story})}}
                        value="Done"/>
                </div>
            </div>
        )
    }
}
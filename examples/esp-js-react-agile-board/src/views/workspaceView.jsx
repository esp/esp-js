import React from 'react';
import ViewDisplayConsts from '../viewDisplayConsts';
import EventConsts from '../eventConsts';
import EpicListItemView from './epicListItemView.jsx';
import StoryListItemView from './storyListItemView.jsx';
import classnames from 'classnames';
import { ViewBinder, SmartComponent } from 'esp-js-react';

export default class WorkspaceView extends React.Component {
    render() {
        let model = this.props.model;
        let router = this.props.router;
        let epics = model.epics.map(epic => {
            return (<EpicListItemView key={epic.epicId} model={epic} router={router} />);
        });
        let showAllClassName = classnames({'hide':!model.showAllStoriesButton});
        let displayedStories = model.displayedStories.map(story => {
            return (<StoryListItemView key={story.storyId} model={story} router={router}/>);
        });
        return (
            <div className="workspace">
                <h1>Agile Workspace (esp-js-react demo)</h1>
                <input
                    type="button"
                    onClick={() => {this.props.router.publishEvent(model.modelId, EventConsts.ADD_EPIC, {})}}
                    value="Add Epic"/>
                <input
                    type="button"
                    className={showAllClassName}
                    onClick={() => {this.props.router.publishEvent(model.modelId, EventConsts.SHOW_ALL_STORIES, {})}}
                    value="Show All Stories"/>
                <div className="workspace__main-content">
                    <div className="workspace__epic-list">
                        <h3>Epics</h3>
                        {epics}
                    </div>
                    <div className="workspace__story-list">
                        <h3>Stories</h3>
                        {displayedStories}
                    </div>
                    <div className="workspace__story-details">
                        <h3>Story Details</h3>
                        <ViewBinder model={model.selectedStory} viewContext={ViewDisplayConsts.STORY_DETAILS_VIEW} />
                    </div>
                </div>
                <SmartComponent modelId={model.modal.modelId} />
            </div>
        );
    }
}
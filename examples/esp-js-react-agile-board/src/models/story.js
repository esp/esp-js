import esp from 'esp-js';
import ModelBase from './modelBase';
import EventConsts from '../eventConsts';
import StoryStatus from './storyStatus';
import idFactory from './idFactory';
// All stories share the same views so events fired from these views get routed to all instances of a stories.
// `observeEvent` optionally takes a predicate we can use to filter out events for the right instance.
const storyEventPredicate = (story, event) => story == event.story;

export default class Story extends ModelBase {
    constructor(modelId, router, epic, name) {
        super(modelId, router);
        this.epic = epic;
        this.name = name;
        this.storyId = idFactory('story');
        this.status = StoryStatus.NORMAL;
        this.isSelected = false;
        this.description = '';
        this._sateBackup = null;
    }

    @esp.observeEvent(EventConsts.STORY_NAME_CHANGED, storyEventPredicate)
    _onStoryNameChanged(event) {
        this.name = event.name || '';
    }

    @esp.observeEvent(EventConsts.STORY_DESCRIPTION_CHANGED, storyEventPredicate)
    _onStoryDescriptionChanged(event) {
        this.description = event.description || '';
    }

    @esp.observeEvent(EventConsts.EDIT_STORY, storyEventPredicate)
    _onEditStory() {
        this._saveState();
        this.status = StoryStatus.EDITING;
    }

    @esp.observeEvent(EventConsts.CANCEL_EDIT_STORY, storyEventPredicate)
    _onCancelEditStory() {
        this.status = StoryStatus.NORMAL;
        this._restore();
    }

    @esp.observeEvent(EventConsts.SAVE_STORY, storyEventPredicate)
    _onSaveStory() {
        this.status = StoryStatus.NORMAL;
        this._sateBackup = null;
    }

    @esp.observeEvent(EventConsts.DONE_STORY, storyEventPredicate)
    _onDoneStory() {
        this.status = StoryStatus.DONE;
    }

    _saveState() {
        this._sateBackup = {
            name:this.name,
            description:this.description,
            isDone:this.isDone,
            status:this.status
        };
    }

    _restore() {
        this.name = this._sateBackup.name;
        this.description = this._sateBackup.description;
        this.isDone = this._sateBackup.isDone;
        this.status = this._sateBackup.status;
        this._sateBackup = null;
    }
}

import { ModelBase } from './modelBase';
import { EventConst } from '../eventConst';
import { StoryStatus } from './storyStatus';
import { idFactory } from './idFactory';
import { Epic } from './epic';
import { observeEvent } from 'esp-js';
// All stories share the same views so events fired from these views get routed to all instances of a stories.
// `observeEvent` optionally takes a predicate we can use to filter out events for the right instance.
const storyEventPredicate = (story, event) => story === event.story;

interface StateBackup {
    name: string;
    description: string;
    isDone: boolean;
    status: StoryStatus;
}

export class Story extends ModelBase {
    private _epic: Epic;
    private _name: string;
    private _storyId: string;
    private _status: StoryStatus;
    private _isSelected: boolean;
    private _isDone: boolean;
    private _description: string;
    private _stateBackup: StateBackup;

    constructor(modelId, router, epic, name) {
        super(modelId, router);
        this._epic = epic;
        this._name = name;
        this._storyId = idFactory('story');
        this._status = StoryStatus.NORMAL;
        this._isSelected = false;
        this._description = '';
    }

    public get epic() {
        return this._epic;
    }

    public get name() {
        return this._name;
    }

    public get storyId() {
        return this._storyId;
    }

    public get status() {
        return this._status;
    }

    public get isSelected() {
        return this._isSelected;
    }

    public set isSelected(value: boolean) {
        this._isSelected = value;
    }

    public get description() {
        return this._description;
    }

    public get isDone() {
        return this._isDone;
    }

    @observeEvent(EventConst.STORY_NAME_CHANGED, storyEventPredicate)
    _onStoryNameChanged(event: { name: string }) {
        this._name = event.name || '';
    }

    @observeEvent(EventConst.STORY_DESCRIPTION_CHANGED, storyEventPredicate)
    _onStoryDescriptionChanged(event: { description: string }) {
        this._description = event.description || '';
    }

    @observeEvent(EventConst.EDIT_STORY, storyEventPredicate)
    _onEditStory() {
        this._saveState();
        this._status = StoryStatus.EDITING;
    }

    @observeEvent(EventConst.CANCEL_EDIT_STORY, storyEventPredicate)
    _onCancelEditStory() {
        this._status = StoryStatus.NORMAL;
        this._restore();
    }

    @observeEvent(EventConst.SAVE_STORY, storyEventPredicate)
    _onSaveStory() {
        this._status = StoryStatus.NORMAL;
        this._stateBackup = null;
    }

    @observeEvent(EventConst.DONE_STORY, storyEventPredicate)
    _onDoneStory() {
        this._status = StoryStatus.DONE;
    }

    _saveState() {
        this._stateBackup = {
            name: this._name,
            description: this._description,
            isDone: this._isDone,
            status: this._status
        };
    }

    _restore() {
        this._name = this._stateBackup.name;
        this._description = this._stateBackup.description;
        this._isDone = this._stateBackup.isDone;
        this._status = this._stateBackup.status;
        this._stateBackup = null;
    }
}

import esp from 'esp-js';
import { viewBinding } from 'esp-js-react';
import ModelBase from './modelBase';
import StoryEditView from '../views/storyEditView.jsx';
import EventConsts from '../eventConsts';
import ModalResultType from './modalResultType';

let id = 0;
const idFactory = () => `story-${id++}`;
const storyEventPredicate = (story, event) => story == event.story;
const STORY_EDIT_VIEW = 'STORY_EDIT_VIEW';

@viewBinding(StoryEditView, STORY_EDIT_VIEW)
export default class Story extends ModelBase {
    constructor(modelId, router, epic, modal, name) {
        super(modelId, router);
        this.storyId = idFactory();
        this.name = name;
        this.epic = epic;
        this.isSelected = false;
        this.modal = modal;
        this.description = '';
        this._sateBackup = null;
        this.isDone = false;
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
        this.modal.open(this, {modelViewContext: STORY_EDIT_VIEW, title: 'Edit Story', saveButtonText:'Save Story' })
            .streamFor(this.modelId)
            .subscribe(
                modalResultType => {
                    if(modalResultType === ModalResultType.Saved) {
                        // nothing to do for now
                    } else {
                        this._restore();
                    }
                }
            );
    }

    @esp.observeEvent(EventConsts.DONE_STORY, storyEventPredicate)
    _onDoneStory() {
        this.isDone = true;
    }

    _saveState() {
        this._sateBackup = {
            name:this.name,
            description:this.description,
            isDone:this.isDone
        };
    }

    _restore() {
        this.name = this._sateBackup.name;
        this.description = this._sateBackup.description;
        this.isDone = this._sateBackup.isDone;
        this._sateBackup = null;
    }
}

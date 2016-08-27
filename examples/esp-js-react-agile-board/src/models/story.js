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
    constructor(modelId, router, epic, modal) {
        super(modelId, router);
        this.storyId = idFactory();
        this.name = `Temp Name ${id}`;
        this.epic = epic;
        this.isSelected = false;
        this.modal = modal;
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
        this.modal.open(this, STORY_EDIT_VIEW, 'Edit Story')
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

    _saveState() {
        this._sateBackup = {
            name:this.name,
            description:this.description
        };
    }

    _restore() {
        this.name = this._sateBackup.name;
        this.description = this._sateBackup.description;
        this._sateBackup = null;
    }
}

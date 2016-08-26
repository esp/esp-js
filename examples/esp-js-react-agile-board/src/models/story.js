import esp from 'esp-js';
import {viewBinding} from 'esp-js-react';
import ModelBase from './modelBase';
import StoryDetailsView from '../views/storyDetailsView.jsx';
import StoryEditView from '../views/storyEditView.jsx';
import ViewDisplayConsts from '../viewDisplayConsts';
import EventConsts from '../eventConsts';
import ModalResultType from './modalResultType';

let id = 0;
let idFactory = () => `story-${id++}`;
let storyEventPredicate = (story, event) => story.storyId == event.storyId;

@viewBinding(StoryEditView, ViewDisplayConsts.STORY_EDIT_VIEW)
@viewBinding(StoryDetailsView, ViewDisplayConsts.STORY_DETAILS_VIEW)
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
    _onStoryNameChanged(e) {
        this.name = e.name || '';
    }

    @esp.observeEvent(EventConsts.STORY_DESCRIPTION_CHANGED, storyEventPredicate)
    _onStoryDescriptionChanged(e) {
        this.description = e.description || '';
    }

    @esp.observeEvent(EventConsts.EDIT_STORY, storyEventPredicate)
    _onEditStory(e) {
        this._saveState();
        this.modal.open(this, ViewDisplayConsts.STORY_EDIT_VIEW, 'Edit Story')
            .streamFor(this.modelId)
            .subscribe(
                modalResultType => {
                    if(modalResultType === ModalResultType.Saved) {

                    } else {
                        this._restore();
                    }
                },
                () => {

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
    }
}

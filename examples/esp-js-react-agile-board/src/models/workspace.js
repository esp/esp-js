import _ from 'lodash';
import esp from 'esp-js';
import ModelBase from './modelBase';
import Epic from './epic';
import EventConsts from '../eventConsts';
import Modal from './modal';

export default class Wokspace extends ModelBase {
    constructor(router) {
        super('workspaceModelId', router);
        this.epics = [];
        this.allStories = [];
        this.displayedStories = [];
        this.selectedEpic = null;
        this.selectedStory = null;
        this.modal = new Modal(router);
        this.showAllStoriesButton = false;
    }

    observeEvents() {
        super.observeEvents();
        this.router.addModel(this.modelId, this);
        this.modal.observeEvents();
    }

    @esp.observeEvent(EventConsts.ADD_EPIC)
    _onAddEpic() {
        var epic = new Epic(this.modelId, this.router, this.modal);
        epic.observeEvents();
        this.epics.push(epic);
    }

    @esp.observeEvent(EventConsts.SHOW_ALL_STORIES)
    _onShowAllStories(event) {
        this.selectedEpic.isSelected = false;
        this.selectedEpic = null;
    }

    @esp.observeEvent(EventConsts.EPIC_SELECTED)
    _onEpicSelected(event) {
        this.selectedEpic = event.epic;
        _.forEach(this.epics, epic => {
            epic.isSelected = epic == event.epic;
        });
        if(this.selectedStory && this.selectedStory.epic !== this.selectedEpic) {
            this.selectedStory.isSelected = false;
            this.selectedStory = null;
        }
    }

    @esp.observeEvent(EventConsts.STORY_SELECTED)
    _onStorySelected(event) {
        this.selectedStory = event.story;
        _.forEach(this.allStories, story => {
            story.isSelected = story == event.story;
        });
    }

    postProcess() {
        this.allStories = _.reduce(
            this.epics, (result, epic) => {
                return result.concat(epic.stories);
            },
            []
        );
        if(this.selectedEpic) {
            this.displayedStories = _(this.allStories)
                .filter(story => story.epic === this.selectedEpic)
                .value();
        } else {
            this.displayedStories = this.allStories;
        }
        this.showAllStoriesButton = this.selectedEpic && this.allStories.length !== this.displayedStories.length;
    }
}
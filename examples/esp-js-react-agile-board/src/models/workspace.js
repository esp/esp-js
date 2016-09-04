import _ from 'lodash';
import esp from 'esp-js';
import { viewBinding } from 'esp-js-react';
import ModelBase from './modelBase';
import Epic from './epic';
import EventConsts from '../eventConsts';
import ItemNameDialog from './itemNameDialog';
import ItemNameDialogResultType from './itemNameDialogResultType';
import WorkspaceView from '../views/workspaceView.jsx';
import idFactory from './idFactory';

@viewBinding(WorkspaceView)
export default class Workspace extends ModelBase {
    constructor(router, modal) {
        super(idFactory('workspace'), router);
        this.modal = modal;
        this.epics = [];
        this.allStories = [];
        this.displayedStories = [];
        this.selectedEpic = null;
        this.selectedStory = null;
        this.showAllStoriesButton = false;
        this._createEpicDialog = new ItemNameDialog(router, modal, 'Create Epic', 'Create Epic');
        this._createStoryDialog = new ItemNameDialog(router, modal, 'Create Story', 'Create Story');
    }

    observeEvents() {
        this.router.addModel(this.modelId, this);
        super.observeEvents();
        this._createEpicDialog.observeEvents();
        this._createStoryDialog.observeEvents();
    }

    @esp.observeEvent(EventConsts.ADD_EPIC)
    _onAddEpic() {
        this._createEpicDialog.resultsStream
            .streamFor(this.modelId)
            .take(1)
            .subscribe(results => {
                if(results.type === ItemNameDialogResultType.Saved) {
                    var epic = new Epic(this.modelId, this.router, this._createStoryDialog, results.name);
                    epic.observeEvents();
                    this.epics.push(epic);
                }
                this._createEpicDialog.close();
            });
        this._createEpicDialog.open();
    }

    @esp.observeEvent(EventConsts.SHOW_ALL_STORIES)
    _onShowAllStories() {
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

    // Gets called by the router when an event for this model has been processed by observers,
    // great place for aggregate operations and/or validation.
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
        _.forEach(this.epics, epic => {
            epic.postProcess();
        });
    }
}
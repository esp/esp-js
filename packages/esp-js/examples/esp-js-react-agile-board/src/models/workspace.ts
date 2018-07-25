import { viewBinding } from 'esp-js-react';
import { ModelBase } from './modelBase';
import { Epic } from './epic';
import { EventConst } from '../eventConst';
import { ItemNameDialog, ItemNameDialogResultType } from './itemNameDialog';
import { WorkspaceView } from '../views/workspaceView';
import { idFactory } from './idFactory';
import { List } from 'immutable';
import { Modal } from './modal';
import { Story } from './story';
import { observeEvent } from 'esp-js';

@viewBinding(WorkspaceView)
export class Workspace extends ModelBase {
    private _modal: Modal;
    private _epics: List<Epic>;
    private _allStories: List<Story>;
    private _displayedStories: List<Story>;
    private _selectedEpic: Epic;
    private _selectedStory: Story;
    private _showAllStoriesButton: boolean;
    private _createEpicDialog: ItemNameDialog;
    private _createStoryDialog: ItemNameDialog;

    constructor(router, modal: Modal) {
        super(idFactory('workspace'), router);
        this._modal = modal;
        this._epics = List<Epic>();
        this._allStories = List<Story>();
        this._displayedStories = List<Story>();
        this._selectedEpic = null;
        this._selectedStory = null;
        this._showAllStoriesButton = false;
        this._createEpicDialog = new ItemNameDialog(router, modal, 'Create Epic', 'Create Epic');
        this._createStoryDialog = new ItemNameDialog(router, modal, 'Create Story', 'Create Story');
    }

    public get modal() {
        return this._modal;
    }

    public get epics() {
        return this._epics;
    }

    public get allStories() {
        return this._allStories;
    }

    public get displayedStories() {
        return this._displayedStories;
    }

    public get selectedEpic() {
        return this._selectedEpic;
    }

    public get selectedStory() {
        return this._selectedStory;
    }

    public get showAllStoriesButton() {
        return this._showAllStoriesButton;
    }

    observeEvents() {
        this.router.addModel(this.modelId, this);
        super.observeEvents();
        this._createEpicDialog.observeEvents();
        this._createStoryDialog.observeEvents();
    }

    @observeEvent(EventConst.ADD_EPIC)
    _onAddEpic() {
        this._createEpicDialog.resultsStream
            .streamFor(this.modelId)
            .take(1)
            .subscribe(results => {
                if (results.type === ItemNameDialogResultType.Saved) {
                    let epic = new Epic(this.modelId, this.router, this._createStoryDialog, results.name);
                    epic.observeEvents();
                    this._epics = this._epics.push(epic);
                }
                this._createEpicDialog.close();
            });
        this._createEpicDialog.open();
    }

    @observeEvent(EventConst.SHOW_ALL_STORIES)
    _onShowAllStories() {
        this._selectedEpic.isSelected = false;
        this._selectedEpic = null;
    }

    @observeEvent(EventConst.EPIC_SELECTED)
    _onEpicSelected(event) {
        this._selectedEpic = event.epic;
        this._epics.forEach(epic => {
            epic.isSelected = epic === event.epic;
        });
        if (this._selectedStory && this._selectedStory.epic !== this._selectedEpic) {
            this._selectedStory.isSelected = false;
            this._selectedStory = null;
        }
    }

    @observeEvent(EventConst.STORY_SELECTED)
    _onStorySelected(event) {
        this._selectedStory = event.story;
        this._allStories.forEach(story => {
            story.isSelected = story === event.story;
        });
    }

    // Gets called by the router when an event for this model has been processed by observers,
    // great place for aggregate operations and/or validation.
    postProcess() {
        this._allStories = this._epics.flatMap(epic => epic.stories).toList();

        if (this._selectedEpic) {
            this._displayedStories = this._allStories
                .filter(story => story.epic === this.selectedEpic)
                .toList();
        } else {
            this._displayedStories = this.allStories;
        }
        this._showAllStoriesButton = this.selectedEpic && this.allStories.count() !== this.displayedStories.count();
        this._epics.forEach(epic => {
            epic.postProcess();
        });
    }
}
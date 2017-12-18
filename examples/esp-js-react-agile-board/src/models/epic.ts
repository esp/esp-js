import { ModelBase } from './modelBase';
import { Story } from './story';
import { EventConst } from '../eventConst';
import { Colour, allColours } from './colours';
import { List } from 'immutable';
import { observeEvent, Router } from 'esp-js';
import { ItemNameDialog, ItemNameDialogResult, ItemNameDialogResultType } from './itemNameDialog';
// All epics share the same views so events fired from these views get routed to all instances of a epics.
// `observeEvent` optionally takes a predicate we can use to filter out events for the right instance.
let epicEventPredicate = (epic, event) => epic === event.epic;

export class Epic extends ModelBase {
    static _epicCounterId = 0;
    static _colourFactory = (() => {
        let id = 0;
        return () => {
            id++;
            return allColours[id % allColours.length];
        };
    })();

    private _epicId: string;
    private _name: string;
    private _stories: List<Story>;
    private _colour: Colour;
    private _doneCount: number;
    private _createStoryDialog: ItemNameDialog;
    private _isSelected: boolean;

    constructor(modelId: string, router: Router, createStoryDialog: ItemNameDialog, name: string) {
        super(modelId, router);
        this._epicId = `epic-${Epic._epicCounterId++}`;
        this._name = name;
        this._stories = List<Story>();
        this._colour = Epic._colourFactory();
        this._doneCount = 0;
        this._createStoryDialog = createStoryDialog;
        this._isSelected = false;
    }

    public get epicId(): string {
        return this._epicId;
    }

    public get name(): string {
        return this._name;
    }

    public get stories(): List<Story> {
        return this._stories;
    }

    public get colour(): Colour {
        return this._colour;
    }

    public get doneCount(): number {
        return this._doneCount;
    }

    public get isSelected(): boolean {
        return this._isSelected;
    }

    public set isSelected(value: boolean) {
        this._isSelected = value;
    }

    @observeEvent(EventConst.EPIC_NAME_CHANGED, epicEventPredicate)
    private _onNameChanged(event) {
        this._name = event.name;
    }

    @observeEvent(EventConst.ADD_STORY, epicEventPredicate)
    private _onAddStory() {
        this._createStoryDialog.resultsStream
            .streamFor(this.modelId)
            .take(1)
            .subscribe((results: ItemNameDialogResult) => {
                if (results.type === ItemNameDialogResultType.Saved) {
                    let story = new Story(this.modelId, this.router, this, results.name);
                    story.observeEvents();
                    this._stories = this._stories.push(story);
                }
                this._createStoryDialog.close();
            });
        this._createStoryDialog.open();
    }

    public postProcess() {
        this._doneCount = this._stories.filter(story => story.isDone).count();
    }
}
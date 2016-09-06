import _ from 'lodash';
import esp from 'esp-js'
import ModelBase from './modelBase';
import Story from './story';
import EventConsts from '../eventConsts';
import Colours from './colours';
import ItemNameDialogResultType from './itemNameDialogResultType';
// All epics share the same views so events fired from these views get routed to all instances of a epics.
// `observeEvent` optionally takes a predicate we can use to filter out events for the right instance.
let epicEventPredicate = (epic, event) => epic == event.epic;

export default class Epic extends ModelBase {
    static _epicCounterId = 0;
    static _colourFactory = (() => {
        let id = 0;
        return () => {
            id++;
            return Colours.all[id%Colours.all.length];
        };
    })();
    constructor(modelId, router, createStoryDialog, name) {
        super(modelId, router);
        this.epicId = `epic-${Epic._epicCounterId++}`;
        this.name = name;
        this.stories = [];
        this.colour = Epic._colourFactory();
        this.doneCount = 0;
        this._createStoryDialog = createStoryDialog;
    }

    @esp.observeEvent(EventConsts.EPIC_NAME_CHANGED, epicEventPredicate)
    _onNameChanged(event) {
        this.name = event.name;
    }

    @esp.observeEvent(EventConsts.ADD_STORY, epicEventPredicate)
    _onAddStory() {
        this._createStoryDialog.resultsStream
            .streamFor(this.modelId)
            .take(1)
            .subscribe(results => {
                if(results.type === ItemNameDialogResultType.Saved) {
                    var story = new Story(this.modelId, this.router, this, results.name);
                    story.observeEvents();
                    this.stories.push(story);
                }
                this._createStoryDialog.close();
            });
        this._createStoryDialog.open();
    }

    postProcess() {
        this.doneCount = _.filter(this.stories, story => story.isDone).length;
    }
}
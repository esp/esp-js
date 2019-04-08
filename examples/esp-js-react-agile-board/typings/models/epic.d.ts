import { ModelBase } from './modelBase';
import { Story } from './story';
import { Colour } from './colours';
import { List } from 'immutable';
import { Router } from 'esp-js';
import { ItemNameDialog } from './itemNameDialog';
export declare class Epic extends ModelBase {
    static _epicCounterId: number;
    static _colourFactory: () => Colour;
    private _epicId;
    private _name;
    private _stories;
    private _colour;
    private _doneCount;
    private _createStoryDialog;
    private _isSelected;
    constructor(modelId: string, router: Router, createStoryDialog: ItemNameDialog, name: string);
    readonly epicId: string;
    readonly name: string;
    readonly stories: List<Story>;
    readonly colour: Colour;
    readonly doneCount: number;
    isSelected: boolean;
    private _onNameChanged;
    private _onAddStory;
    postProcess(): void;
}

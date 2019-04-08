import { ModelBase } from './modelBase';
import { StoryStatus } from './storyStatus';
import { Epic } from './epic';
export declare class Story extends ModelBase {
    private _epic;
    private _name;
    private _storyId;
    private _status;
    private _isSelected;
    private _isDone;
    private _description;
    private _stateBackup;
    constructor(modelId: any, router: any, epic: any, name: any);
    readonly epic: Epic;
    readonly name: string;
    readonly storyId: string;
    readonly status: StoryStatus;
    isSelected: boolean;
    readonly description: string;
    readonly isDone: boolean;
    _onStoryNameChanged(event: {
        name: string;
    }): void;
    _onStoryDescriptionChanged(event: {
        description: string;
    }): void;
    _onEditStory(): void;
    _onCancelEditStory(): void;
    _onSaveStory(): void;
    _onDoneStory(): void;
    _saveState(): void;
    _restore(): void;
}

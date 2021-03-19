import {LoadResult} from './prerequisites';

export enum ModuleChangeType {
    Change = 'Change',
    Error = 'Error'
}

export enum ModuleLoadStage {
    Loading = 1,
    Registered = 2,
    Prerequisites = 3,
    Initialising = 4,
    Loaded = 5,
}

/**
 * An interface which provides information about the load progress of a module.
 */
export interface ModuleLoadResult {
    type: ModuleChangeType;
    moduleKey: string;
    moduleName: string;
    description?: string;
    prerequisiteResult?: LoadResult;
    errorMessage?: string;
    hasCompletedLoaded?: boolean;
    stage: ModuleLoadStage;
}

export class AggregateModuleLoadResult {
    public static readonly EMPTY = new AggregateModuleLoadResult(0);

    private readonly _expectedModuleCount: number;
    private readonly _currentModuleLoadResult: ModuleLoadResult;
    private readonly _allResults: Map<string, ModuleLoadResult>;

    constructor(expectedModuleCount: number);
    constructor(expectedModuleCount: number, currentModuleLoadResult: ModuleLoadResult, allResults: Map<string, ModuleLoadResult>);
    constructor(...args: any[]) {
        if (args.length === 3) {
            this._expectedModuleCount = args[0];
            this._currentModuleLoadResult = args[1];
            this._allResults = args[2];
        } else {
            this._expectedModuleCount = args[0];
            this._currentModuleLoadResult = null;
            this._allResults = new Map();
        }
    }

    public get isComplete() {
        return this._expectedModuleCount === this._allResults.size; // note that 0 is an acceptable _expectedModuleCount value
    }

    public get currentModuleLoadResult(): ModuleLoadResult {
        return this._currentModuleLoadResult;
    }

    public getModuleResults(moduleKey: string): ModuleLoadResult {
        return this._allResults.get(moduleKey);
    }

    public allResults() {
        return new Map(this._allResults);
    }

    public allModulesAtOrLaterThanStage(stage: ModuleLoadStage): boolean {
        if (this === AggregateModuleLoadResult.EMPTY || this._expectedModuleCount !== this._allResults.size) {
            return false;
        }
        if (this._expectedModuleCount === 0) {
            // in two minds about blowing up (with a comment to use `isComplete`) here or just return true
            return true;
        }
        return Array
            .from<ModuleLoadResult>(this._allResults.values())
            .every(r => r.stage >= stage);
    }

    public addModuleLoadResult(result: ModuleLoadResult): AggregateModuleLoadResult {
        const map = new Map(this._allResults);
        map.set(result.moduleKey, result);
        return new AggregateModuleLoadResult(this._expectedModuleCount, result, map);
    }
}
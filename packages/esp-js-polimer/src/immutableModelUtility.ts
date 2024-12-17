import {StrictModeSettings} from './strictMode';
import {logger} from './logger';
import { Guard } from 'esp-js';

const isExpireableModelProxy = Symbol("__isProxy__")

type ExpirableModelProxy<TModel> = {
    model: TModel,
    setExpired: () => void
};
/**
 * If strict mode is enabled, this will wrap the draftModel in a proxy which we can later 'expire'.
 * When 'expired', depending on StrictModeSettings settings, model access may result in an error or warning.
 */
const createExpireableModelProxy =  <TModel>(modelId: string, draftModel: TModel): ExpirableModelProxy<TModel> => {
    Guard.isFalsey(draftModel[isExpireableModelProxy], 'The draftModel can not be a proxy')
    let expired = false;
    const traps = {
        get(target: any, prop: any) {
            if (prop === isExpireableModelProxy) {
                return true;
            }
            if (expired) {
                tryThrowOrWarnIfModelExpired(modelId);
            }
            return target[prop];
        },
    };
    const model = StrictModeSettings.modeIsOff()
        ? Object.freeze(draftModel)
        : new Proxy(Object.freeze(draftModel), traps);
    return {
        get model() {
            return model;
        },
        setExpired() {
            expired = true;
        },
    };
};

type DraftableModelProxy<TModel> = {
    /**
     * Proxy implementing change tracking
     */
    draftProxy: TModel,
    /**
     * Underlying model being tracked
     */
    draftModel: TModel,
    readonly hasChanges: boolean;
    setExpired: () => void
};

const createDraftableModelProxy = <TModel>(modelId: string, baseModel: TModel, defaultHasChanges = false): DraftableModelProxy<TModel> => {
    let hasChanges = defaultHasChanges;
    let expired = false;
    const draftModel = {
        ...baseModel
    };
    const traps = {
        get(target: any, prop: any) {
            if (expired) {
                throw new Error(`Draft copy has expired. ModelID: ${modelId}`);
            }
            return target[prop];
        },
        set(target: any, prop: any, value: any) {
            hasChanges = true;
            target[prop] = value;
            return target;
        },
        deleteProperty(target: any, prop: string) {
            if (!(prop in target)) {
                return false;
            }
            hasChanges = true;
            delete target[prop];
            return target;
        },
    };
    return {
        draftProxy: new Proxy(draftModel, traps),
        draftModel: draftModel,
        get hasChanges() {
            return hasChanges;
        },
        setExpired() {
            expired = true;
        },
    }
};

export type ImmutableModelUtility<TModel> = {
    readonly immutableModel: TModel;
    readonly hasChanges: boolean;
    beginMutation(): void
    replaceModel(other: TModel): void
    endMutation(): void;
}

export const createImmutableModelUtility = <TModel>(modelId: string, initialDraft: TModel): ImmutableModelUtility<TModel> => {
    let expireableModel: ExpirableModelProxy<TModel> = createExpireableModelProxy<TModel>(modelId, initialDraft);
    let draftableModel: DraftableModelProxy<TModel> = null;
    return {
        get immutableModel() {
            if (draftableModel) {
                // we expose draftProxy, not draftModel, so we can track changes to it.
                return draftableModel.draftProxy;
            }
            return expireableModel.model;
        },
        get hasChanges() {
            return draftableModel ? draftableModel.hasChanges : false;
        },
        beginMutation() {
            draftableModel = createDraftableModelProxy(modelId, expireableModel.model);
        },
        replaceModel(other: TModel) {
            if (!draftableModel) {
                throw new Error(`Model ${modelId} currently in draft/mutation mode. Can not replace.`);
            }
            draftableModel = createDraftableModelProxy(modelId, other, true);
        },
        endMutation() {
            if (draftableModel.hasChanges) {
                expireableModel.setExpired();
                // we create the next expireableModel using draftModel, not draftProxy, we can expire the draft proxy now.
                expireableModel = createExpireableModelProxy(modelId, draftableModel.draftModel);
            }
            draftableModel.setExpired();
            draftableModel = null;
        }
    };
};

const tryThrowOrWarnIfModelExpired = (modelId: string) => {
    if (StrictModeSettings.modeIsOff()) {
        return;
    }
    const errorMessage = `esp-js-polimer immutable model (id ${modelId}} accessed after change. You are likely closing over an old version of the model. This will cause issues as the model's state has since.`;
    if (StrictModeSettings.modeIsThrowError()) {
        throw new Error(errorMessage);
    }
    if (StrictModeSettings.modeIsWarn()) {
        let stack: string | undefined = undefined;
        try {
            // noinspection ExceptionCaughtLocallyJS
            throw new Error();
        } catch (e) {
            stack = (e as Error).stack;
        }
        logger.warn(`${errorMessage} Stack: ${stack}`);
    }
};

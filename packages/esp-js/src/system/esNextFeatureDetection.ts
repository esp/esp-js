import {GlobalState} from './globalState';

const SupportsWeakRef = !!GlobalState.WeakRef;

export interface EsNextFeatureDetectionLike {
    supportsWeakRef: boolean;
}

export const EsNextFeatureDetection: EsNextFeatureDetectionLike = {
    supportsWeakRef: SupportsWeakRef
};

const SupportsWeakRef = !!window.WeakRef;

export interface EsNextFeatureDetectionLike {
    supportsWeakRef: boolean;
}

export const EsNextFeatureDetection: EsNextFeatureDetectionLike = {
    supportsWeakRef: SupportsWeakRef
};

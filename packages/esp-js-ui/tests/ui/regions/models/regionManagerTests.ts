import {
    RegionItem,
    IdFactory,
    RegionBase,
    RegionManager,
    ViewRegistryModel
} from '../../../../src';
import {Router} from 'esp-js';

class StubRegion extends RegionBase<{}> {
    constructor(
        regionName: string,
        router: Router,
        regionManager: RegionManager,
        viewRegistry: ViewRegistryModel,
        modelId: string
    ) {
        super(regionName, router, regionManager, viewRegistry, modelId);
    }

    get stateSavingEnabled(): boolean {
        return false;
    }
}

describe('RegionManager', () => {
    let router: Router;
    let regionManager: RegionManager;
    let stubRegion: StubRegion;
    let viewRegistryModel: ViewRegistryModel;

    beforeEach(() => {
        router = new Router();
        viewRegistryModel = new ViewRegistryModel(router);
        regionManager = new RegionManager(router);
        stubRegion = new StubRegion(
            'region1',
            router,
            regionManager,
            viewRegistryModel,
            'region1-model-id'
        );
    });

    it('can add to region', () => {

        regionManager.registerRegion('region1', stubRegion);
    });
});

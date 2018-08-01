import {RegionNames} from '../../../shell/regionNames';
export class BlotterState {
    public regionName:string;

    static create(regionName = RegionNames.blotterRegion) {
        const state = new BlotterState();
        state.regionName = regionName;
        return state;
    }
}

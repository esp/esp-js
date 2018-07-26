import RegionNames from '../../../shell/regionNames';
export default class BlotterState {
    public regionName:string;

    static create(regionName = RegionNames.blotterRegion) {
        let state = new BlotterState();
        state.regionName = regionName;
        return state;
    }
}

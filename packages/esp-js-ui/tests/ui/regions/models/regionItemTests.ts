import {RegionItem} from '../../../../src/ui/regions/models';

describe('Region Item Tests', () => {
    it('ctor(modelId)', () => {
        const item = RegionItem.create('modelId');
        expect(item.modelId).toEqual('modelId');
        expect(item.regionRecordExists).toEqual(false);
        expect(item.regionRecordId).toBeDefined();
    });

    it('ctor(modelId, undefined)', () => {
        const item = RegionItem.create('modelId', undefined);
        expect(item.modelId).toEqual('modelId');
        expect(item.regionRecordExists).toEqual(false);
        expect(item.regionRecordId).toBeDefined();
    });

    it('ctor(modelId, options)', () => {
        const item = RegionItem.create('modelId', {title: 'foo'});
        expect(item.modelId).toEqual('modelId');
        expect(item.regionRecordExists).toEqual(false);
        expect(item.regionRecordId).toBeDefined();
        expect(item.displayOptions.title).toEqual('foo');
    });

    it('RegionItem.createExisting(recordId, modelId)', () => {
        const item = RegionItem.createExisting('recordId','modelId');
        expect(item.regionRecordId).toEqual('recordId');
        expect(item.modelId).toEqual('modelId');
        expect(item.regionRecordExists).toEqual(true);
    });

    it('ctor(modelId, modelId, null)', () => {
        const item = RegionItem.createExisting('recordId','modelId', null);
        expect(item.regionRecordId).toEqual('recordId');
        expect(item.modelId).toEqual('modelId');
        expect(item.regionRecordExists).toEqual(true);
        expect(item.displayOptions).toBeNull();
    });
});

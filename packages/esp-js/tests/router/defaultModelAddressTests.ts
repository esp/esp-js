import {DefaultModelAddress} from '../../src';

describe('defaultModelAddressTests.ts', () => {
    let expectedError = 'Can not correctly construct an address to dispatch event. You must publish with a string modelId or valid ModelAddress shape';

    it('Can set modelId only as string', () => {
        const ma = new DefaultModelAddress('the-id');
        expect(ma.modelId).toEqual('the-id');
        expect(ma.entityKey).not.toBeDefined();
        expect(ma.hasEntityKey).toBe(false);
    });

    it('Can set modelId only via ModelAddress', () => {
        const ma = new DefaultModelAddress({ modelId: 'the-id' });
        expect(ma.modelId).toEqual('the-id');
        expect(ma.entityKey).not.toBeDefined();
        expect(ma.hasEntityKey).toBe(false);
    });

    it('Can set modelId and entityKey', () => {
        const ma = new DefaultModelAddress({ modelId: 'the-id', entityKey: 'the-key' });
        expect(ma.modelId).toEqual('the-id');
        expect(ma.entityKey).toEqual('the-key');
        expect(ma.hasEntityKey).toBe(true);
    });

    it('Throws if modelId not string', () => {
        expect(() => {
            let ma = new DefaultModelAddress(<any>1);
        }).toThrow(expectedError);
    });

    it('Throws if eventKey not string', () => {
        expect(() => {
            const ma = new DefaultModelAddress({ modelId: 'the-id', entityKey: <any>1 });
        }).toThrow(expectedError);
    });

    it('Throws if modelId not set via ModelAddress', () => {
        expect(() => {
            const ma = new DefaultModelAddress({ entityKey: 'the-key' });
        }).toThrow(expectedError);
    });
});
import {DefaultModelAddress} from '../../src';

describe('defaultModelAddressTests.ts', () => {

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
        }).toThrow('Invalid modelIdOrModelAddress provided, expected an object conforming to \'string | ModelAddress\'');
    });

    it('Throws if entityKey not string', () => {
        expect(() => {
            const ma = new DefaultModelAddress({ modelId: 'the-id', entityKey: <any>1 });
        }).toThrow('Invalid ModelAddress provided, expected entityKey property to be a string, received 1');
    });

    it('Throws if modelId not set via ModelAddress', () => {
        expect(() => {
            const ma = new DefaultModelAddress({ entityKey: 'the-key' });
        }).toThrow('Invalid ModelAddress provided, expected modelId property to be defined, received undefined');
    });
});
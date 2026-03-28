import {DefaultStoreAddress} from '../../src';

describe('defaultStoreAddressTests.ts', () => {

    it('Can set storeId only as string', () => {
        const sa = new DefaultStoreAddress('the-id');
        expect(sa.storeId).toEqual('the-id');
        expect(sa.entityKey).not.toBeDefined();
        expect(sa.hasEntityKey).toBe(false);
    });

    it('Can set storeId only via StoreAddress', () => {
        const sa = new DefaultStoreAddress({ storeId: 'the-id' });
        expect(sa.storeId).toEqual('the-id');
        expect(sa.entityKey).not.toBeDefined();
        expect(sa.hasEntityKey).toBe(false);
    });

    it('Can set storeId and entityKey', () => {
        const sa = new DefaultStoreAddress({ storeId: 'the-id', entityKey: 'the-key' });
        expect(sa.storeId).toEqual('the-id');
        expect(sa.entityKey).toEqual('the-key');
        expect(sa.hasEntityKey).toBe(true);
    });

    it('Throws if storeId not string', () => {
        expect(() => {
            let sa = new DefaultStoreAddress(<any>1);
        }).toThrow('Invalid storeIdOrStoreAddress provided, expected an object conforming to \'string | StoreAddress\'');
    });

    it('Throws if entityKey not string', () => {
        expect(() => {
            const sa = new DefaultStoreAddress({ storeId: 'the-id', entityKey: <any>1 });
        }).toThrow('Invalid StoreAddress provided, expected entityKey property to be a string, received 1');
    });

    it('Throws if storeId not set via StoreAddress', () => {
        expect(() => {
            const sa = new DefaultStoreAddress({ entityKey: 'the-key' });
        }).toThrow('Invalid StoreAddress provided, expected storeId property to be defined, received undefined');
    });
});

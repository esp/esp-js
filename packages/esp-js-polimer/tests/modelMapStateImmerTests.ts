import produce, {enableMapSet} from 'immer';
import {ModelMapState} from '../src';

// required so Immer correctly drafts/mutates Maps and Sets
enableMapSet();

type MyEntity = { espEntityId: string; someNumber?: number, someAlpha?: string };

describe('ModelMapState works with Immer', () => {
    let mapState:  ModelMapState<MyEntity>;

    beforeEach(() => {
        mapState = new ModelMapState<MyEntity>();
    });

    it('Can upsert item', () => {
        mapState = produce(mapState, draft => {
            draft.upsert('id1', { espEntityId: 'id1', someNumber: 1});
        });
        expect(mapState.items.length).toEqual(1);
        expect(mapState.getByKey('id1').someNumber).toEqual(1);

        mapState = produce(mapState, draft => {
            draft.upsert('id1', { espEntityId: 'id1', someNumber: 2});
        });
        expect(mapState.getByKey('id1').someNumber).toEqual(2);
    });

    it('Can delete item', () => {
        mapState = produce(mapState, draft => {
            draft.upsert('id1', { espEntityId: 'id1', someNumber: 1});
        });
        expect(mapState.items.length).toEqual(1);
        mapState = produce(mapState, draft => {
            draft.deleteByKey('id1');
        });
        expect(mapState.items.length).toEqual(0);
    });

    it('Sorting works', () => {
        mapState = new ModelMapState<MyEntity>((e1, e2) => e1.someAlpha.localeCompare(e2.someAlpha));

        mapState = produce(mapState, draft => {
            draft.upsert('a', { espEntityId: 'a', someAlpha: 'a'});
            draft.upsert('d', { espEntityId: 'd', someAlpha: 'd'});
            draft.upsert('b', { espEntityId: 'b', someAlpha: 'b'});
        });
        expect(mapState.items.length).toEqual(3);
        expect(mapState.items[0].someAlpha).toEqual('a');
        expect(mapState.items[1].someAlpha).toEqual('b');
        expect(mapState.items[2].someAlpha).toEqual('d');

        // test that subsequent drafts correct pull the comparison function when drafted/updated
        mapState = produce(mapState, draft => {
            draft.upsert('c', { espEntityId: 'c', someAlpha: 'c'});
        });
        expect(mapState.items.length).toEqual(4);
        expect(mapState.items[0].someAlpha).toEqual('a');
        expect(mapState.items[1].someAlpha).toEqual('b');
        expect(mapState.items[2].someAlpha).toEqual('c');
        expect(mapState.items[3].someAlpha).toEqual('d');
    });
});
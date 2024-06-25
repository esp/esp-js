import produce, {enableMapSet} from 'immer';
import {StateMap} from '../src';

// required so Immer correctly drafts/mutates Maps and Sets
enableMapSet();

type MyEntity = { modelPath: string; someNumber?: number, someAlpha?: string };

describe('StateMap works with Immer', () => {
    let mapState:  StateMap<MyEntity>;

    beforeEach(() => {
        mapState = new StateMap<MyEntity>();
    });

    it('Can upsert item', () => {
        mapState = produce(mapState, draft => {
            draft.upsert('id1', { modelPath: 'id1', someNumber: 1});
        });
        expect(mapState.items.length).toEqual(1);
        expect(mapState.getByPath('id1').someNumber).toEqual(1);

        mapState = produce(mapState, draft => {
            draft.upsert('id1', { modelPath: 'id1', someNumber: 2});
        });
        expect(mapState.getByPath('id1').someNumber).toEqual(2);
    });

    it('Can delete item', () => {
        mapState = produce(mapState, draft => {
            draft.upsert('id1', { modelPath: 'id1', someNumber: 1});
        });
        expect(mapState.items.length).toEqual(1);
        mapState = produce(mapState, draft => {
            draft.deleteByPath('id1');
        });
        expect(mapState.items.length).toEqual(0);
    });

    it('Sorting works', () => {
        mapState = new StateMap<MyEntity>((e1, e2) => e1.someAlpha.localeCompare(e2.someAlpha));

        mapState = produce(mapState, draft => {
            draft.upsert('a', { modelPath: 'a', someAlpha: 'a'});
            draft.upsert('d', { modelPath: 'd', someAlpha: 'd'});
            draft.upsert('b', { modelPath: 'b', someAlpha: 'b'});
        });
        expect(mapState.items.length).toEqual(3);
        expect(mapState.items[0].someAlpha).toEqual('a');
        expect(mapState.items[1].someAlpha).toEqual('b');
        expect(mapState.items[2].someAlpha).toEqual('d');

        // test that subsequent drafts correct pull the comparison function when drafted/updated
        mapState = produce(mapState, draft => {
            draft.upsert('c', { modelPath: 'c', someAlpha: 'c'});
        });
        expect(mapState.items.length).toEqual(4);
        expect(mapState.items[0].someAlpha).toEqual('a');
        expect(mapState.items[1].someAlpha).toEqual('b');
        expect(mapState.items[2].someAlpha).toEqual('c');
        expect(mapState.items[3].someAlpha).toEqual('d');
    });
});
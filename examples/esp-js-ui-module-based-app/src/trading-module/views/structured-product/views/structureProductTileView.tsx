import * as React from 'react';
import {Logger} from 'esp-js-ui';
import {StructureProductTileModel} from '../model/structureProductTileModel';

const _log: Logger = Logger.create('CashTileView');

export interface StructureProductTileViewProps {
    model: StructureProductTileModel;
}

export const StructureProductTileView = ({model}: StructureProductTileViewProps) => {

    return (
        <div>

        </div>
    );
};
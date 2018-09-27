import {defaultRootStateFactory, RootState} from './root/rootState';
import {defaultRequestForQuoteStateFactory, RequestForQuoteState} from './rfq/requestForQuoteState';
import {defaultInputsStateFactory, InputsState} from './inputs/inputsState';
import {defaultReferenceDataStateFactory, ReferenceDataState} from './refData/referenceDataState';
import {IdFactory} from '../../../../../../packages/esp-js-ui';

export interface CashTileStore  {
    modelId: string;
    rootState: RootState;
    inputs: InputsState;
    requestForQuote: RequestForQuoteState;
    referenceData: ReferenceDataState;
}

export const defaultStoreFactory = (ccyPair: string): CashTileStore => {
    return {
        modelId: IdFactory.createId('cashTileStore'),
        rootState: defaultRootStateFactory(),
        inputs: defaultInputsStateFactory(ccyPair),
        requestForQuote: defaultRequestForQuoteStateFactory(),
        referenceData: defaultReferenceDataStateFactory()
    };
};

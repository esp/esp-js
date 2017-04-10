import {Router} from 'esp-js';
export interface ViewBaseProps<TModel> {
    model:TModel;
    router:Router;
}

export default ViewBaseProps;
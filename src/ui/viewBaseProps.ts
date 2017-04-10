import {Router} from 'esp-js';
interface ViewBaseProps<TModel> {
    model:TModel;
    router:Router;
}

export default ViewBaseProps;
// allows you to inject a literal value, for example a string
import {Container, Resolver} from 'microdi-js';

export default class LiteralResolver implements Resolver<any> {
    resolve<T>(container : Container, dependencyKey:{value:any}) {
        return dependencyKey.value;
    }
}

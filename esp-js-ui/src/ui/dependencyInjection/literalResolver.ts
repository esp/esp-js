// allows you to inject a literal value, for example a string
import {Container, Resolver} from 'microdi-js';

// a resolver that allows you to to inject/resolve a literal value (for example a string)
export default class LiteralResolver<T> implements Resolver<T> {
    public static get resolverName() : string { return 'literal'; }
    resolve(container : Container, dependencyKey:{value:any}) {
        return dependencyKey.value;
    }
}

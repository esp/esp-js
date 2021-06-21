import {Container, Resolver} from 'esp-js-di';
import {Guard} from 'esp-js';

/**
 * A
 * resolver that allows you to to inject/resolve a literal value (for example a string)
 * @deprecated this is now included by default in esp-js-di. 
 * This can still be added to a container, it will just replace the build in one with the same implementation. 
 */
export class LiteralResolver<T> implements Resolver<T> {
    public static get resolverName() : string { return 'literal'; }
    resolve(container : Container, dependencyKey:{value:any}) {
        Guard.isDefined(dependencyKey.value, `Invalid container configuration. A literal resolver key is missing the 'value' property. That property should hold the value to be resolved.`);
        return dependencyKey.value;
    }
}

/* notice_start
 * Copyright 2016 Dev Shop Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 notice_end */

export class Container {
    createChildContainer(): Container;
    register(name: string, proto: any):RegistrationModifier;
    registerInstance<T>(name: string, instance: T, isExternallyOwned?: boolean): void;
    registerFactory<T>(name: string, factory:(context: Container, ...additionalDependencies: any[]) => T): RegistrationModifier;
    resolve<T>(name: string, ...additionalDependencies: any[]): T;
    /**
     * Resolves several items at once into an object keyed by name, e.g. `const {bus, svc} = container.resolveMany('bus', 'svc')`.
     * Pass a ResolveManySpec to provide additional dependencies for an item.
     */
    resolveMany<T extends object = Record<string, any>>(...specs: Array<string | ResolveManySpec>): T;
    resolveGroup<T>(groupName: string,  ...additionalDependencies: any[]): Array<T>;
    isRegistered(name: string, options?: IsRegisteredQueryOptions) : boolean;
    isGroupRegistered(groupName: string, options?: IsRegisteredQueryOptions) : boolean;
    addResolver<T>(name:string, resolver:Resolver<T>): void;
    on<T extends object = object>(eventType: ContainerEventType, eventHandler: (notification: ContainerNotification<T>) => void): void;
    off<T extends object = object>(eventType: ContainerEventType, eventHandler: (notification: ContainerNotification<T>) => void): void;
    dispose():void;
    readonly isDisposed: boolean;
}

export interface ResolveManySpec {
    /** The registered name to resolve, also used as the key in the result */
    name: string;
    /** Additional dependencies passed to the item's constructor/factory */
    additionalDependencies?: any[];
}

export type Key = string | LiteralResolverKey | FactoryResolverKey | DelegateResolverKey | ExternalFactoryResolverKey | CustomResolverKey;

export class RegistrationModifier {
    inject(...args: Key[]):RegistrationModifier;
    transient():RegistrationModifier;
    singleton():RegistrationModifier;
    singletonPerContainer():RegistrationModifier;
    inGroup(groupName:string):RegistrationModifier;
}

/**
 * An optional param which can modify how an 'isRegistered' or 'isGroupRegistered' search is performed.
 *
 * If omitted defaults to { searchParentContainers: true }
 */
export interface IsRegisteredQueryOptions {
    /**
     * If true or omitted (default) will search in the current container, and along its chain up to the root container.
     * If false only the current container is searched.
     */
    searchParentContainers?: boolean;
}

/**
 * A key that contains a literal value to inject
 */
export interface LiteralResolverKey {
    /**
     * The name of the resolver
     */
    resolver: 'literal';
    /**
     * The value to inject
     */
    value: any;
}

/**
 * A key that itself can handel resolution
 */
export interface FactoryResolverKey {
    /**
     * The name of the resolver
     */
    resolver: 'factory';
    /**
     * The key (i.e. name) of the item to resolve from the container
     */
    key: string;
}

/**
 * A key that itself can handel resolution
 */
export interface DelegateResolverKey {
    /**
     * The name of the resolver
     */
    resolver: 'delegate';
    resolve: <T>(container: Container) => T;
}

/**
 * A key that contains a factory which will be called with all dependencies
 */
export interface ExternalFactoryResolverKey {
    /**
     * The name of the resolver
     */
    resolver: 'externalFactory';
    factory: <T>(container: Container, ...additionalDeps: any[]) => T;
}

/**
 * A key for custom resolvers
 *
 * Note: this will also be the fallback if there are incorrect types passed for the other keys, not ideal but at least the typings above provide better docs that nothing at all.
 */
export interface CustomResolverKey {
    /**
     * The name of the resolver
     */
    resolver: string;
    [others: string]: any;
}

export interface Resolver<T> {
    resolve(container:Container, dependencyKey:any):T;
}

export class EspDiConsts {
    static readonly owningContainer : string;
}

/**
 * Internal: tracks the chain of names being resolved to detect circular dependencies.
 */
export class ResolverContext {
    beginResolve(key: string): { endResolve(): void };
}

export class ResolverNames {
    static readonly delegate : string;
    static readonly factory : string;
    static readonly externalFactory : string;
    static readonly literal : string;
}

export type ContainerEventType =
    /*
     * Occurs when an instance is registered with the container
     */
    'instanceRegistered' |
    /*
     * Occurs when an instance is created by the container
     */
    'instanceCreated'
;

export interface ContainerNotification<T extends object = object> {
    /**
     * The  name of the registered item
     */
    name: string;
    /**
     * The instance
     */
    instance: T;
    eventType: ContainerEventType;
}

declare const _default: {
    Container: typeof Container;
    RegistrationModifier: typeof RegistrationModifier;
    ResolverContext: typeof ResolverContext;
    EspDiConsts: typeof EspDiConsts;
    ResolverNames: typeof ResolverNames;
};
export default _default;

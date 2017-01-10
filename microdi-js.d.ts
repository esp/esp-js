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
    createChildContainer():Container;
    register(name:String, proto:any):RegistrationModifier;
    registerInstance<T>(name:String, instance:T, isExternallyOwned?):void;
    resolve<T>(name:String, ...additionalDependencies):T;
    resolveGroup(groupName:String):Array<any>;
    isRegistered(name : string) : boolean;
    isGroupRegistered(groupName : string) : boolean;
    addResolver<T>(name:String, resolver:Resolver<T>);
    dispose():void;
}

export class RegistrationModifier {
    inject(...args):RegistrationModifier;
    transient():RegistrationModifier;
    singleton():RegistrationModifier;
    singletonPerContainer():RegistrationModifier;
    inGroup(groupName:String):RegistrationModifier;
}

export interface Resolver<T> {
    resolve(container:Container, dependencyKey:any):T
}
export class MicroDiConsts {
    static readonly owningContainer : string;
}
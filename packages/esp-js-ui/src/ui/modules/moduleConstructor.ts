import {StateService} from '../state/stateService';
import {Container} from 'esp-js-di';
import {Module} from './module';

export interface ModuleConstructor {
    new (container:Container, stateService:StateService) : Module;
}
import {StateService} from '../state/stateService';
import {Container} from 'microdi-js';
import {Module} from './module';

export interface ModuleConstructor {
    new (container:Container, stateService:StateService) : Module;
}
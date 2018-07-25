import StateService from '../state/stateService';
import {Container} from 'microdi-js';
import Module from './module';

interface ModuleConstructor {
    new (container:Container, stateService:StateService) : Module;
}

export default ModuleConstructor;

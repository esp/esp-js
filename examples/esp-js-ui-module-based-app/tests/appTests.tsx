import 'jest';
import {configure, mount} from 'enzyme';
import  ReactSixteenAdapter = require('enzyme-adapter-react-16');
import {ShellBootstrapper} from '../src/shell/shellBootstrapper';
import {ShellView} from '../src/shell/views/shellView';
import * as React from 'react';

configure({adapter: new ReactSixteenAdapter()});

describe('ShellBootstrapper Tests', () => {
    // This is a high level integration test to see if the example actually loads
    it('Catch all integration tests', () => {
        let shellBootstrapper = new ShellBootstrapper();
        const shellBootstrapperWrapper = mount(shellBootstrapper.rootElement);
        expect(shellBootstrapperWrapper.containsMatchingElement(<ShellView />)).toBeTruthy();
    });
});
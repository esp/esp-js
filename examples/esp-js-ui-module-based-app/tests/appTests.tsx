import 'jest';
import {configure, mount} from 'enzyme';
import  ReactSixteenAdapter = require('enzyme-adapter-react-16');
import {AppShell} from '../src/shell/appShell';
import {WorkspaceView} from '../src/shell/views/workspace/views/workspaceView';
import * as React from 'react';

configure({adapter: new ReactSixteenAdapter()});

describe('ShellBootstrapper Tests', () => {
    // This is a high level integration test to see if the example actually loads
    it('Catch all integration tests', () => {
        let shellBootstrapper = new AppShell();
        shellBootstrapper.start();
        const shellBootstrapperWrapper = mount(shellBootstrapper.rootElement);
        expect(shellBootstrapperWrapper.containsMatchingElement(<WorkspaceView model={undefined}/>)).toBeTruthy();
    });
});
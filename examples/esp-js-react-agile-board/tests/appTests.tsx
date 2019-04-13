import 'jest';
import {configure, mount} from 'enzyme';
import  ReactSixteenAdapter = require('enzyme-adapter-react-16');
import {App} from '../src/app';
import * as React from 'react';
import {WorkspaceView} from '../src/views/workspaceView';

configure({adapter: new ReactSixteenAdapter()});

describe('ShellBootstrapper Tests', () => {
    // This is a high level integration test to see if the example actually loads
    it('Catch all integration tests', () => {
        const appWrapper = mount(<App />);
        expect(appWrapper.containsMatchingElement(<WorkspaceView />)).toBeTruthy();
    });
});
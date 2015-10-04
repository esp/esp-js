import React from 'react';
import MessageSection from './MessageSection.react';
import ThreadSection from './ThreadSection.react';

export default class ChatApp extends React.Component {
    constructor() {
        super();
    }
    render() {
        var router = this.props.router;
        return (
            <div className="chatapp">
                <ThreadSection router={router} />
                <MessageSection router={router} />
            </div>
        );
    }
}

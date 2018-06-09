import React from 'react';
import MessageSection from './messageSection';
import ThreadSection from './threadSection';

export class ChatApp extends React.Component {
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

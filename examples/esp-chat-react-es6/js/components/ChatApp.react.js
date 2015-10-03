import React from 'react';
import MessageSection from './MessageSection.react';
import ThreadSection from './ThreadSection.react';

export default class ChatApp extends React.Component {
    render() {
        return (
            <div className="chatapp">
                <ThreadSection />
                <MessageSection />
            </div>
        );
    }
}

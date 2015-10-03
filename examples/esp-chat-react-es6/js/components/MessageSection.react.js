import MessageComposer from './MessageComposer.react';
import MessageListItem from './MessageListItem.react';
import React from 'react';
import router from '../router';

export default class MessageSection extends React.Component {

    constructor( ) {
        this._subscription = null;
    }

    componentWillMount() {
        this._subscription = router
            .getModelObservable()
            .where(model => model.messageSection.hasChanges)
            .observe(model => {
                this.setState(model.messageSection);
            };
    }

    componentDidMount () {
        this._scrollToBottom();
    }

    componentDidUpdate() {
        this._scrollToBottom();
    }

    componentWillUnmount() {
        this._subscription.dispose();
    }

    _scrollToBottom() {
        if (this.state === null) {
            return null;
        }
        var ul = this.refs.messageList.getDOMNode();
        ul.scrollTop = ul.scrollHeight;
    }

    render() {
        if (this.state === null) {
            return null;
        }
        var messageListItems = this.state.sortedMessages.map(function (message) {
            return (
                <li key={message.id}>
                    <MessageListItem model={message} />
                </li>
            );
        });
        return (
            <div className="message-section">
                <h3 className="message-thread-heading">{this.state.threadName}</h3>
                <ul className="message-list" ref="messageList">
                {messageListItems}
                </ul>
                <MessageComposer />
            </div>
        );
    }
}
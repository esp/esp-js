import MessageComposer from './MessageComposer.react';
import MessageListItem from './MessageListItem.react';
import React from 'react';

export default class MessageSection extends React.Component {
    constructor( ) {
        super();
        this._subscription = null;
    }
    componentWillMount() {
        this._subscription = this.props.router
            .getModelObservable()
            .where(model => model.messageSection.hasChanges)
            .observe(model => {
                this.setState(model.messageSection);
            });
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
        var ul = this.refs.messageList;
        ul.scrollTop = ul.scrollHeight;
    }
    render() {
        if (this.state === null) {
            return null;
        }
        var messageListItems = this.state.sortedMessages.map(message => {
            return (
                <li key={message.id}>
                    <MessageListItem model={message} />
                </li>
            );
        });
        var router = this.props.router;
        return (
            <div className="message-section">
                <h3 className="message-thread-heading">{this.state.threadName}</h3>
                <ul className="message-list" ref="messageList">
                {messageListItems}
                </ul>
                <MessageComposer router={router} />
            </div>
        );
    }
}
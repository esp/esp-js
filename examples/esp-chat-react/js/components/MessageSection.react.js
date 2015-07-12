"use strict";

var MessageComposer = require('./MessageComposer.react');
var MessageListItem = require('./MessageListItem.react');
var React = require('react');

var MessageSection = React.createClass({
    componentDidMount: function () {
        this._scrollToBottom();
    },

    componentDidUpdate: function() {
        this._scrollToBottom();
    },

    _scrollToBottom: function() {
        var ul = this.refs.messageList.getDOMNode();
        ul.scrollTop = ul.scrollHeight;
    },

    render: function () {
        var messageSection = this.props.model;
        var messageListItems = messageSection.sortedMessages.map(function (message) {
            return (
                <MessageListItem
                    key={message.id}
                    model={message}
                />
            );
        });
        return (
            <div className="message-section">
                <h3 className="message-thread-heading">{messageSection.threadName}</h3>
                <ul className="message-list" ref="messageList">
                {messageListItems}
                </ul>
                <MessageComposer
                    router={this.props.router}
                    modelId={this.props.modelId}
                />
            </div>
        );
    }
});

module.exports = MessageSection;

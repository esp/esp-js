"use strict";

var MessageComposer = require('./MessageComposer.react');
var MessageListItem = require('./MessageListItem.react');
var React = require('react');
var modelRouter = require('../model/modelRouter');

var MessageSection = React.createClass({

    componentWillMount: function () {
        modelRouter
            .getModelObservable()
            .observe(function (model) {
                this.setState(model.messageSection);
            }.bind(this));
    },

    componentDidMount: function () {
        this._scrollToBottom();
    },

    componentDidUpdate: function() {
        this._scrollToBottom();
    },

    _scrollToBottom: function() {
        if (this.state === null) {
            return null;
        }

        var ul = this.refs.messageList.getDOMNode();
        ul.scrollTop = ul.scrollHeight;
    },

    render: function () {
        if (this.state === null) {
            return null;
        }

        var messageListItems = this.state.sortedMessages.map(function (message) {
            return (
                <MessageListItem
                    key={message.id}
                    model={message}
                />
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
});

module.exports = MessageSection;

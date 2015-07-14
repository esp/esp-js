"use strict";

var React = require('react');
var cx = require('react/lib/cx');

var ThreadListItem = React.createClass({

    _onClick: function() {
        var thread = this.props.model;
        this.props.router.publishEvent(this.props.modelId, "threadSelected", { threadId: thread.id, threadName: this.props.model.name });
    },

    render: function () {
        var thread = this.props.model;
        return (
            <div
                className={cx({
                'thread-list-item': true,
                'active': thread.isActive
                })}
                onClick={this._onClick}
            >
                <h5 className="thread-name">{thread.name}</h5>
                <div className="thread-time">
                    {thread.lastMessageTime.toLocaleTimeString()}
                </div>
                <div className="thread-last-message">
                    {thread.lastMessageText}
                </div>
            </div>
        );
    }
});

module.exports = ThreadListItem;

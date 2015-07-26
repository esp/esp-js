"use strict";

var React = require('react');
var cx = require('react/lib/cx');
var modelRouter = require('../model/modelRouter');
var Thread = require('../model/entities/Thread');

var ThreadListItem = React.createClass({

    propTypes: {
        model: React.PropTypes.instanceOf(Thread)
    },

    _onClick: function() {
        var thread = this.props.model;
        modelRouter.publishEvent("threadSelected", { threadId: thread.id, threadName: this.props.model.name });
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

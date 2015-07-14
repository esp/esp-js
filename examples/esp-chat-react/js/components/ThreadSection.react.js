"use strict";

var React = require('react');
var ThreadListItem = require('../components/ThreadListItem.react');

var ThreadSection = React.createClass({

    render: function () {
        var threadSection = this.props.model;
        var threadListItems = threadSection.sortedThreads.map(function (thread) {
                return (
                    <li>
                        <ThreadListItem
                            key={thread.id}
                            router={this.props.router}
                            modelId={this.props.modelId}
                            model={thread}
                        />
                    </li>
                );
            }, this);
        var unread = null;
        if (threadSection.unreadCount.isVisible) {
            unread = <span>Unread threads: {threadSection.unreadCount.value}</span>;
        }
        return (
            <div className="thread-section">
                <div className="thread-count">
                    {unread}
                </div>
                <ul className="thread-list">
                    {threadListItems}
                </ul>
            </div>
        );
    }

});

module.exports = ThreadSection;

"use strict";

var React = require('react');
var Message = require('../model/entities/Message');

var MessageListItem = React.createClass({

    propTypes: {
        model: React.PropTypes.instanceOf(Message)
    },

    render: function () {
        var message = this.props.model;
        return (
            <li className="message-list-item">
                <h5 className="message-author-name">{message.authorName}</h5>
                <div className="message-time">
                {message.time.toLocaleTimeString()}
                </div>
                <div className="message-text">{message.text}</div>
            </li>
        );
    }

});

module.exports = MessageListItem;

import React from 'react';
import {Message} from '../model/Message';
import PropTypes from 'prop-types';

export class MessageListItem extends React.Component {
    render() {
        var message = this.props.model;
        return (
            <div className="message-list-item">
                <h5 className="message-author-name">{message.authorName}</h5>
                <div className="message-time">
                {message.time.toLocaleTimeString()}
                </div>
                <div className="message-text">{message.text}</div>
            </div>
        );
    }
}
MessageListItem.propTypes = {
    model: PropTypes.instanceOf(Message)
};
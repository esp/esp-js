import React from 'react';
import cx from 'react/lib/cx';
import router from '../router';
import Thread from '../model/Thread';

export default class ThreadListItem extends React.Component {

    static propTypes = {
        model: React.PropTypes.instanceOf(Thread)
    }

    _onClick() {
        var thread = this.props.model;
        modelRouter.publishEvent("threadSelected", { threadId: thread.id, threadName: this.props.model.name });
    }

    render () {
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
}

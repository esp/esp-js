import React from 'react';
import classnames from 'classnames';
import Thread from '../model/Thread';

class ThreadListItem extends React.Component {
    // ES7 or babel with the playground flag
    //static propTypes = {
    //    model: React.PropTypes.instanceOf(Thread)
    //}
    constructor() {
        super();
        // http://reactjsnews.com/es6-gotchas/
        this._onClick = this._onClick.bind(this)
    }
    _onClick() {
        var thread = this.props.model;
        this.props.router.publishEvent("ThreadSelected", { threadId: thread.id, threadName: this.props.model.name });
    }
    render () {
        var thread = this.props.model;
        return (
            <div
                className={classnames({
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
ThreadListItem.propTypes = {
    model: React.PropTypes.instanceOf(Thread)
}
export default ThreadListItem;
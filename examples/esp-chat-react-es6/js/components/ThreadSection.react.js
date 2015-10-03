import React from 'react';
import router from '../router';
import ThreadListItem from './ThreadListItem.react';

export default class ThreadSection extends React.Component {

    constructor() {
        this._subscription = null;
    }

    componentWillMount() {
        this._subscription = router
            .getModelObservable()
            .where(model => model.threadSection.hasChanges)
            .observe(model => {
                this.setState(model.threadSection);
            };
    }

    componentWillUnmount() {
        this._subscription.dispose();
    }

    render() {
        if (this.state === null) {
            return null;
        }
        var threadListItems = this.state.sortedThreads.map(function (thread) {
                return (
                    <li key={thread.id}>
                        <ThreadListItem model={thread} />
                    </li>
                );
            }, this);
        var unread = null;
        if (this.state.unreadCount.isVisible) {
            unread = <span>Unread threads: {this.state.unreadCount.value}</span>;
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
}
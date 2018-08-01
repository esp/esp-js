import React from 'react';
import {ThreadListItem} from './threadListItem';

export class ThreadSection extends React.Component {
    constructor() {
        super();
        this._subscription = null;
    }
    componentWillMount() {
        this._subscription = this.props.router
            .getModelObservable()
            .where(model => model.threadSection.hasChanges)
            .subscribe(model => {
                this.setState(model.threadSection);
            });
    }
    componentWillUnmount() {
        this._subscription.dispose();
    }
    render() {
        if (this.state === null) {
            return null;
        }
        const router = this.props.router;
        const threadListItems = this.state.sortedThreads.map(thread => {
                return (
                    <li key={thread.id}>
                        <ThreadListItem model={thread} router={router} />
                    </li>
                );
            }, this);
        let unread = null;
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
import * as React from 'react';

export interface ItemItemViewProps  {
    className?: string;
    style?: any;
}

export default class ItemItemView extends React.Component<ItemItemViewProps, any> {
    render() {
        let className = this.props.className ? this.props.className : 'item-item-container'; 

        return (
            <div style={this.props.style} className={className}>
                {this.props.children}
            </div>
        );
    }
}

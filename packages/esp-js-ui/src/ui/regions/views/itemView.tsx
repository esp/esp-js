import * as React from 'react';

export interface ItemViewProps  {
    className?: string;
    style?: any;
}

export class ItemView extends React.Component<ItemViewProps, any> {
    render() {
        let className = this.props.className ? this.props.className : 'item-item-container'; 

        return (
            <div style={this.props.style} className={className}>
                {this.props.children}
            </div>
        );
    }
}

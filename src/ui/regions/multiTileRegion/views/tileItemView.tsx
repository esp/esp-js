import * as React from 'react';
import TileItemViewProps from './tileItemViewProps';

export default class TileItemView extends React.Component<TileItemViewProps, any> {
    render() {
        let className = this.props.className ? this.props.className : 'tile-item-container'; 

        return (
            <div style={this.props.style} className={className}>
                {this.props.children}
            </div>
        );
    }
}

import * as React from 'react';
import ITileItemViewProps from './ITileItemViewProps';

export default class TileItemView extends React.Component<ITileItemViewProps, any> {
    render() {
        let className = this.props.className ? this.props.className : 'tile-item-container'; 

        return (
            <div style={this.props.style} className={className}>
                {this.props.children}
            </div>
        );
    }
}

import * as esp from 'esp-js';
import React from 'react';
import EventConsts from '../eventConsts';
import classnames from 'classnames';
import EpicLabel from './epicLabel';
import Epic from '../models/epic';

export default class EpicListItemView extends React.Component {
    static propTypes = {
        epic: React.PropTypes.instanceOf(Epic).isRequired,
        router: React.PropTypes.instanceOf(esp.Router).isRequired
    };

    render() {
        let epic = this.props.epic;
        let router = this.props.router;
        let className = classnames('epicListItem', {'selectedItem':epic.isSelected});
        return (
            <div className={className}
                 onClick={() => {router.publishEvent(epic.modelId, EventConsts.EPIC_SELECTED, {epic});}}>
                <div>
                    <label>Epic:</label>
                    <input
                        type='text'
                        value={epic.name}
                        onChange={e => router.publishEvent(epic.modelId, EventConsts.EPIC_NAME_CHANGED, {name:e.target.value, epic})} />
                </div>
                <input
                    type="button"
                    onClick={() => {this.props.router.publishEvent(epic.modelId, EventConsts.ADD_STORY, {epic})}}
                    value="Add story"/>
                <EpicLabel epic={epic} showEpicId={true} />
            </div>
        );
    }
}
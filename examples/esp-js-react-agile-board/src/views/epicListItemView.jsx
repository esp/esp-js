import React from 'react';
import EventConsts from '../eventConsts';
import classnames from 'classnames';
import EpicLabel from './epicLabel';

export default class EpicListItemView extends React.Component {
    render() {
        let model = this.props.model;
        let router = this.props.router;
        let className = classnames('epicListItem', {'selectedItem':model.isSelected});
        return (
            <div className={className}
                 onClick={() => {router.publishEvent(model.modelId, EventConsts.EPIC_SELECTED, {epic:model});}}>
                <div>
                    <label>Epic:</label>
                    <input
                        type='text'
                        value={model.name}
                        onChange={e => router.publishEvent(model.modelId, EventConsts.EPIC_NAME_CHANGED, {name:e.target.value, epicId:model.epicId})} />
                </div>
                <input
                    type="button"
                    onClick={() => {this.props.router.publishEvent(model.modelId, EventConsts.ADD_STORY, {epicId:model.epicId})}}
                    value="Add story"/>
                <EpicLabel epic={model} showEpicId={true} />
            </div>
        );
    }
}
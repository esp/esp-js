import * as React from 'react';
import classnames from 'classnames';

const EpicLabel = (props) => {
    let epicClassnames = classnames(`epic_${props.epic.colour}`, 'epic_label');
    return (
        <label className={epicClassnames}>{props.showEpicId ? props.epic.epicId : props.epic.name}</label>
    );
};

export default EpicLabel;

import * as React from 'react';
import classnames from 'classnames';

const EpicLabel = (props) => {
    let epicClassnames = classnames(`epic_${props.colour}`, 'epic_label');
    return (
        <label className={epicClassnames}>{props.displayText}</label>
    );
};

export default EpicLabel;

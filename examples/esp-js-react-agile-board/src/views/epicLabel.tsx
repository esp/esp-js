import * as React from 'react';
import * as classnames from 'classnames';

export const EpicLabel = (props) => {
    let epicClassnames = classnames(`epic_${props.colour}`, 'epic_label');
    return (
        <label className={epicClassnames}>{props.displayText}</label>
    );
};
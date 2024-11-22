import * as React from 'react';

export interface EntityKeyViewProps {
    entityKey: string;
}

export const EntityKeyView = ({entityKey}: EntityKeyViewProps) => {
    return (
        <div>ID: {entityKey.substring(0, entityKey.indexOf('-'))}</div>
    );
};
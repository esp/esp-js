import * as React from 'react';

export interface CutsViewProps {
    cuts: string[];
}

export const CutsView = ({cuts}: CutsViewProps) => {
    if (!cuts || cuts.length === 0) {
        return null;
    }
    return (
        <>
            <div>Cuts</div>
            <div>
                {cuts.map(c => (<div key={c}>{c} </div>))}
            </div>
        </>

    );
};
import React from 'react';
import { RegionView } from 'esp-js-react';

export const AppShell = () => (
    <div style={{ display: 'flex', minHeight: '100vh', gap: '24px', padding: '24px', boxSizing: 'border-box' }}>
        <div style={{ flex: 1 }}>
            <RegionView regionName='main' />
        </div>
        <div style={{ width: '360px', flexShrink: 0 }}>
            <RegionView regionName='weather' />
        </div>
    </div>
);

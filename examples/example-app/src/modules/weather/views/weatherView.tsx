import React from 'react';
import { usePublishStoreEvent } from 'esp-js-react';
import { WeatherModel } from '../stores/weatherModel';
import { WeatherEvents } from '../stores/weatherEvents';

interface WeatherViewProps {
    model: WeatherModel;
}

const containerStyle: React.CSSProperties = {
    maxWidth: '100%',
    padding: '24px',
    background: 'linear-gradient(135deg, #1e3c72, #2a5298)',
    borderRadius: '16px',
    color: '#fff',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
    textAlign: 'center' as const,
};

const buttonStyle: React.CSSProperties = {
    padding: '8px 20px',
    background: 'rgba(255,255,255,0.2)',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.4)',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '13px',
};

export const WeatherView = ({ model }: WeatherViewProps) => {
    const publishStoreEvent = usePublishStoreEvent();
    const refresh = () => publishStoreEvent(WeatherEvents.FetchWeather, {});

    if (model.isLoading && !model.data) {
        return (
            <div style={containerStyle}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>⏳</div>
                <p style={{ margin: 0, opacity: 0.8 }}>Loading weather...</p>
            </div>
        );
    }

    if (model.error) {
        return (
            <div style={containerStyle}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>⚠️</div>
                <p style={{ margin: '0 0 16px', opacity: 0.9 }}>{model.error}</p>
                <button onClick={refresh} style={buttonStyle}>
                    Retry
                </button>
            </div>
        );
    }

    if (!model.data) return null;

    return (
        <div style={containerStyle}>
            <h2 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 400, opacity: 0.8 }}>
                {model.locationName}
            </h2>
            <div style={{ fontSize: '64px', fontWeight: 200, lineHeight: 1, margin: '8px 0' }}>
                {Math.round(model.data.temperatureCelsius)}°C
            </div>
            <p style={{ margin: '0 0 4px', fontSize: '16px' }}>
                {model.data.conditionDescription}
            </p>
            <p style={{ margin: '0 0 16px', fontSize: '13px', opacity: 0.7 }}>
                Wind: {model.data.windSpeedKph} km/h
            </p>
            {model.lastUpdated && (
                <p style={{ margin: '0 0 16px', fontSize: '11px', opacity: 0.5 }}>
                    Updated: {model.lastUpdated}
                </p>
            )}
            <button
                onClick={refresh}
                disabled={model.isLoading}
                style={{ ...buttonStyle, opacity: model.isLoading ? 0.5 : 1, cursor: model.isLoading ? 'default' : 'pointer' }}
            >
                {model.isLoading ? 'Refreshing...' : '↺ Refresh'}
            </button>
        </div>
    );
};

import { App } from 'esp-js-ui';
import { Container } from 'esp-js-di';
import { WeatherEvents } from './weatherEvents';
import { WeatherData, WeatherModel } from './weatherModel';
import { WeatherService } from '../services/weatherService';

export const registerWeatherStore = (app: App, storeId: string): void => {
    const service = app.container.resolve<WeatherService>('weatherService');

    app.eventBus.storeBuilder<WeatherModel>(storeId, new WeatherModel())
        .withEventHandler(WeatherEvents.SetLocation, (draft, event: { lat: number; lon: number; name: string }) => {
            draft.latitude = event.lat;
            draft.longitude = event.lon;
            draft.locationName = event.name;
        })
        // Cancel if a fetch is already in flight
        .withPreviewHandler(WeatherEvents.FetchWeather, (model, _event, ctx) => {
            if (model.isLoading) ctx.cancel();
        })
        .withEventHandler(WeatherEvents.FetchWeather, (draft) => {
            draft.isLoading = true;
            draft.error = null;
        })
        .withEffect(WeatherEvents.FetchWeather, (model, _event, _ctx, publish) => {
            service.fetchWeather(model.latitude, model.longitude)
                .then(data => publish(WeatherEvents.FetchWeatherSuccess, data))
                .catch(() => publish(WeatherEvents.FetchWeatherError, { message: 'Failed to load weather data. Please try again.' }));
        })
        .withEventHandler(WeatherEvents.FetchWeatherSuccess, (draft, event: WeatherData) => {
            draft.isLoading = false;
            draft.error = null;
            draft.data = event;
            draft.lastUpdated = new Date().toLocaleTimeString();
        })
        .withEventHandler(WeatherEvents.FetchWeatherError, (draft, event: { message: string }) => {
            draft.isLoading = false;
            draft.error = event.message;
        })
        // Auto-refresh every 60 seconds; preview handler cancels if already loading
        .withEventSubscription((publish) => {
            const intervalId = setInterval(() => {
                publish(WeatherEvents.FetchWeather, {});
            }, 60_000);
            return { dispose: () => clearInterval(intervalId) };
        })
        .build();
};

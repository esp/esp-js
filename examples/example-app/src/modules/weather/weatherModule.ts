import { Container } from 'esp-js-di';
import { App, ModuleBuilder } from 'esp-js-ui';
import { registerWeatherStore } from './stores/weatherStore';
import { WeatherEvents } from './stores/weatherEvents';
import { WeatherService } from './services/weatherService';
import { WeatherView } from './views/weatherView';

export const WEATHER_STORE_ID = 'weather-store-id';

export const weatherModule = ModuleBuilder
    .create('weather')
    .withContainerConfiguration((container: Container) => {
        container.register('weatherService', WeatherService).singleton();
    })
    .withView(WEATHER_STORE_ID, WeatherView, 'weather')
    .withInitialisation(async (app: App) => {
        registerWeatherStore(app, WEATHER_STORE_ID);
        const service = app.container.resolve<WeatherService>('weatherService');
        const location = await service.resolveLocation();
        app.eventBus.publishEvent(WEATHER_STORE_ID, WeatherEvents.SetLocation, location);
        app.eventBus.publishEvent(WEATHER_STORE_ID, WeatherEvents.FetchWeather, {});
    })
    .build();

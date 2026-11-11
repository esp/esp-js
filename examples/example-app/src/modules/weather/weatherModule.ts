import { Container } from 'esp-js-di';
import { ModuleBuilder, ModuleContext } from 'esp-js-ui';
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
    .withInitialisation(async ({ moduleContainer, eventBus }: ModuleContext) => {
        // weatherService was registered in this module's own child container (see withContainerConfiguration above)
        const service = moduleContainer.resolve<WeatherService>('weatherService');
        registerWeatherStore(eventBus, service, WEATHER_STORE_ID);
        const location = await service.resolveLocation();
        eventBus.publishEvent(WEATHER_STORE_ID, WeatherEvents.SetLocation, location);
        eventBus.publishEvent(WEATHER_STORE_ID, WeatherEvents.FetchWeather, {});
    })
    .build();

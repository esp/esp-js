export const WeatherEvents = {
    SetLocation:         'Weather/SetLocation',
    FetchWeather:        'Weather/FetchWeather',
    FetchWeatherSuccess: 'Weather/FetchWeatherSuccess',
    FetchWeatherError:   'Weather/FetchWeatherError',
} as const;

export type WeatherEventType = typeof WeatherEvents[keyof typeof WeatherEvents];

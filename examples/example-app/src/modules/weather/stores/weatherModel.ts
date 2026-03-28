import { immerable } from 'immer';

export interface WeatherData {
    temperatureCelsius: number;
    conditionDescription: string;
    windSpeedKph: number;
}

export class WeatherModel {
    [immerable] = true;

    isLoading: boolean = false;
    error: string | null = null;
    locationName: string = 'Perth, WA';
    latitude: number = -31.9505;
    longitude: number = 115.8605;
    data: WeatherData | null = null;
    lastUpdated: string | null = null;
}

export function weatherCodeToDescription(code: number): string {
    if (code === 0)            return 'Clear sky';
    if (code === 1)            return 'Mainly clear';
    if (code === 2)            return 'Partly cloudy';
    if (code === 3)            return 'Overcast';
    if (code === 45)           return 'Foggy';
    if (code === 48)           return 'Icy fog';
    if (code === 51)           return 'Light drizzle';
    if (code === 53)           return 'Moderate drizzle';
    if (code === 55)           return 'Dense drizzle';
    if (code === 56)           return 'Light freezing drizzle';
    if (code === 57)           return 'Heavy freezing drizzle';
    if (code === 61)           return 'Slight rain';
    if (code === 63)           return 'Moderate rain';
    if (code === 65)           return 'Heavy rain';
    if (code === 66)           return 'Light freezing rain';
    if (code === 67)           return 'Heavy freezing rain';
    if (code === 71)           return 'Slight snow';
    if (code === 73)           return 'Moderate snow';
    if (code === 75)           return 'Heavy snow';
    if (code === 77)           return 'Snow grains';
    if (code === 80)           return 'Slight showers';
    if (code === 81)           return 'Moderate showers';
    if (code === 82)           return 'Violent showers';
    if (code === 85)           return 'Slight snow showers';
    if (code === 86)           return 'Heavy snow showers';
    if (code === 95)           return 'Thunderstorm';
    if (code === 96)           return 'Thunderstorm with slight hail';
    if (code === 99)           return 'Thunderstorm with heavy hail';
    return 'Unknown';
}

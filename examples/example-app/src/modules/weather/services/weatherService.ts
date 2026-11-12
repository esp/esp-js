import { WeatherData, weatherCodeToDescription } from '../stores/weatherModel';

const PERTH_LAT = -31.9505;
const PERTH_LON = 115.8605;
const PERTH_NAME = 'Perth, WA';

export interface Location {
    lat: number;
    lon: number;
    name: string;
}

export class WeatherService {
    resolveLocation(): Promise<Location> {
        return new Promise((resolve) => {
            if (!navigator.geolocation) {
                resolve({ lat: PERTH_LAT, lon: PERTH_LON, name: PERTH_NAME });
                return;
            }
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const lat = pos.coords.latitude;
                    const lon = pos.coords.longitude;
                    fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`)
                        .then(r => r.json())
                        .then(data => {
                            const name =
                                data.address?.city ||
                                data.address?.town ||
                                data.address?.suburb ||
                                'Your Location';
                            resolve({ lat, lon, name });
                        })
                        .catch(() => resolve({ lat, lon, name: 'Your Location' }));
                },
                () => resolve({ lat: PERTH_LAT, lon: PERTH_LON, name: PERTH_NAME }),
                { timeout: 5000 }
            );
        });
    }

    fetchWeather(lat: number, lon: number): Promise<WeatherData> {
        return fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
        )
            .then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then(json => ({
                temperatureCelsius: json.current_weather.temperature,
                conditionDescription: weatherCodeToDescription(json.current_weather.weathercode),
                windSpeedKph: json.current_weather.windspeed,
            }));
    }
}

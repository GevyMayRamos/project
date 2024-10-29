const weatherApiKey = 'b694999a2979415d9da171932242710'; // Replace with your actual WeatherAPI key
const unsplashApiKey = 'HOlI9KRLPz-G9v9UNFWnnePHDCrLLffLHsCiVPJSC2Q'; // Replace with your Unsplash API key

document.getElementById('getWeather').addEventListener('click', () => {
    const city = encodeURIComponent(document.getElementById('city').value);

    // Today's date
    const today = new Date();
    const todayFormatted = today.toISOString().split('T')[0]; // Format YYYY-MM-DD
    // Two days ago
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(today.getDate() - 2);
    const twoDaysAgoFormatted = twoDaysAgo.toISOString().split('T')[0];
    // Two days in the future
    const twoDaysFromNow = new Date();
    twoDaysFromNow.setDate(today.getDate() + 2);
    const twoDaysFromNowFormatted = twoDaysFromNow.toISOString().split('T')[0];

    // URLs
    const historicalUrl = `https://api.weatherapi.com/v1/history.json?key=${weatherApiKey}&q=${city}&dt=${twoDaysAgoFormatted}`;
    const forecastUrl = `https://api.weatherapi.com/v1/forecast.json?key=${weatherApiKey}&q=${city}&days=5&hour=1`; // Fetch hourly data

    const imageUrl = `https://api.unsplash.com/search/photos?page=1&query=${city}&client_id=${unsplashApiKey}`;

    // Fetch historical weather (two days ago)
    fetch(historicalUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('City not found or historical data not available');
            }
            return response.json();
        })
        .then(histData => {
            // Fetch forecast data (next 5 days)
            return fetch(forecastUrl).then(forecastResponse => {
                if (!forecastResponse.ok) {
                    throw new Error('Forecast data not found');
                }
                return forecastResponse.json();
            }).then(forecastData => {
                // Fetch city image from Unsplash
                return fetch(imageUrl).then(imageResponse => {
                    if (!imageResponse.ok) {
                        throw new Error('Image not found');
                    }
                    return imageResponse.json();
                }).then(imageData => {
                    // Prepare result HTML
                    let resultHTML = `<h2>Weather in ${histData.location.name}, ${histData.location.country}</h2>`;

                    const weatherElement = document.getElementById('weatherResult');
                    weatherElement.style.display = 'block';
                    
                    // In the part where you set the background image:
                    if (imageData.results.length > 0) {
                        const cityImage = imageData.results[0].urls.full; // Use the full image URL
                        const style = document.createElement('style'); // Create a <style> element
                        style.innerHTML = `
                            body::before {
                                content: '';
                                background-image: url('${cityImage}');
                            },
                        `;
                        document.head.appendChild(style); // Append the style to the head
                    } else {
                        // Optional: remove the style if no image
                        const existingStyle = document.querySelector('style');
                        if (existingStyle) {
                            existingStyle.remove();
                        }
                    }

                    // Yesterday's weather (two days ago)
                    const yesterdayWeather = histData.forecast.forecastday[0];
                    resultHTML += `
                        <h3>${twoDaysAgoFormatted} Weather:</h3>
                        <p>Avg Temp: ${yesterdayWeather.day.avgtemp_c}°C, Condition: ${yesterdayWeather.day.condition.text}, Humidity: ${yesterdayWeather.day.avghumidity}%</p>
                    `;

                    // Today's weather
                    const todayWeather = forecastData.forecast.forecastday[2]; // Today is at index 2 in a 5-day forecast
                    resultHTML += `
                        <h3>Today (${todayFormatted}):</h3>
                        <p>Avg Temp: ${todayWeather.day.avgtemp_c}°C, Condition: ${todayWeather.day.condition.text}, Humidity: ${todayWeather.day.avghumidity}%</p>
                    `;

                    // Hourly weather for today
                    resultHTML += `<h3>Hourly Weather:</h3><ul>`;
                    todayWeather.hour.forEach(hour => {
                        const hourFormatted = new Date(hour.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        resultHTML += `
                            <li>${hourFormatted} - Temp: ${hour.temp_c}°C, Condition: ${hour.condition.text}</li>
                        `;
                    });
                    resultHTML += `</ul>`;

                    // Incoming weather (two days from now)
                    for (let i = 0; i < 2; i++) {
                        const upcomingWeather = forecastData.forecast.forecastday[i + 3]; // Next two days
                        resultHTML += `
                            <h3>${upcomingWeather.date} Weather:</h3>
                            <p>Avg Temp: ${upcomingWeather.day.avgtemp_c}°C, Condition: ${upcomingWeather.day.condition.text}, Humidity: ${upcomingWeather.day.avghumidity}%</p>
                        `;
                    }

                    document.getElementById('weatherResult').innerHTML = resultHTML;
                });
            });
        })
        .catch(error => {
            document.getElementById('weatherResult').innerHTML = `<p>${error.message}</p>`;
        });
});

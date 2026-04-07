const form = document.getElementById("searchForm");
const cityInput = document.getElementById("cityInput");
const message = document.getElementById("message");
const weatherResult = document.getElementById("weatherResult");
const emptyState = document.getElementById("emptyState");

const cityNameEl = document.getElementById("cityName");
const weatherDescEl = document.getElementById("weatherDesc");
const temperatureEl = document.getElementById("temperature");
const windEl = document.getElementById("wind");
const humidityEl = document.getElementById("humidity");
const feelsLikeEl = document.getElementById("feelsLike");
const forecastEl = document.getElementById("forecast");
const weatherIconBigEl = document.getElementById("weatherIconBig");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const city = cityInput.value.trim();
  if (!city) {
    showMessage("Please enter a city name.");
    return;
  }

  showMessage("Fetching weather…", true);
  weatherResult.classList.add("hidden");
  emptyState.classList.add("hidden");

  try {
    const location = await getCoordinates(city);

    if (!location) {
      showMessage("City not found. Try a different name.");
      emptyState.classList.remove("hidden");
      return;
    }

    const weatherData = await getWeather(location.latitude, location.longitude);
    renderWeather(location, weatherData);
    showMessage("");
    weatherResult.classList.remove("hidden");
  } catch (error) {
    showMessage("Something went wrong. Please try again.");
    emptyState.classList.remove("hidden");
    console.error(error);
  }
});

async function getCoordinates(city) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
  const response = await fetch(url);
  const data = await response.json();
  if (!data.results || data.results.length === 0) return null;
  return data.results[0];
}

async function getWeather(latitude, longitude) {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
    `&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,relative_humidity_2m` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min` +
    `&timezone=auto&forecast_days=5`;
  const response = await fetch(url);
  return await response.json();
}

function renderWeather(location, data) {
  const current = data.current;
  const daily = data.daily;

  cityNameEl.textContent = `${location.name}, ${location.country}`;
  weatherDescEl.textContent = getWeatherDescription(current.weather_code);
  weatherIconBigEl.textContent = getWeatherEmoji(current.weather_code);

  temperatureEl.textContent = `${Math.round(current.temperature_2m)}`;
  windEl.textContent = `${Math.round(current.wind_speed_10m)} km/h`;
  humidityEl.textContent = `${current.relative_humidity_2m}%`;
  feelsLikeEl.textContent = `${Math.round(current.apparent_temperature)}°C`;

  forecastEl.innerHTML = "";

  daily.time.forEach((date, index) => {
    const card = document.createElement("div");
    card.className = "forecast-card";
    card.innerHTML = `
      <div class="fc-day">${formatDay(date)}</div>
      <span class="fc-icon">${getWeatherEmoji(daily.weather_code[index])}</span>
      <div class="fc-max">${Math.round(daily.temperature_2m_max[index])}°</div>
      <div class="fc-min">${Math.round(daily.temperature_2m_min[index])}°</div>
    `;
    forecastEl.appendChild(card);
  });
}

function showMessage(text, isLoading = false) {
  message.textContent = text;
  message.className = "message" + (isLoading ? " loading" : "");
}

function formatDay(dateStr) {
  const date = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (date.getTime() === today.getTime()) return "Today";
  return date.toLocaleDateString("en-US", { weekday: "short" });
}

function getWeatherEmoji(code) {
  if (code === 0) return "☀️";
  if (code <= 2) return "🌤️";
  if (code === 3) return "☁️";
  if (code <= 49) return "🌫️";
  if (code <= 57) return "🌧️";
  if (code <= 67) return "🌧️";
  if (code <= 77) return "❄️";
  if (code <= 82) return "🌦️";
  if (code <= 86) return "🌨️";
  if (code <= 99) return "⛈️";
  return "🌈";
}

function getWeatherDescription(code) {
  if (code === 0) return "Clear sky";
  if (code === 1) return "Mainly clear";
  if (code === 2) return "Partly cloudy";
  if (code === 3) return "Overcast";
  if (code <= 49) return "Foggy";
  if (code <= 57) return "Drizzling";
  if (code <= 67) return "Rainy";
  if (code <= 77) return "Snowing";
  if (code <= 82) return "Rain showers";
  if (code <= 86) return "Snow showers";
  if (code <= 99) return "Thunderstorm";
  return "Unknown";
}

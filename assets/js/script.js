// Constants
const API_KEY = "X4695C5A687RL98MS69FG4S2V";
const GEO_API_KEY = "5bbb4532b9a040a6a4bd5228f0a1e365";
const API_BASE_URL =
  "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/";
const ICON_BASE_URL =
  "https://raw.githubusercontent.com/visualcrossing/WeatherIcons/main/PNG/2nd%20Set%20-%20Color/";
const DATE_OPTIONS = {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
};

// DOM Elements
const cityNameElement = document.querySelector(".city_name");
const weatherStatusElement = document.querySelector(".w_status");
const currentDateTimeElement = document.querySelector(".current_DateTime");
const tempElement = document.querySelector(".w_temp");
const minTempElement = document.querySelector(".min");
const maxTempElement = document.querySelector(".max");
const weatherIconElement = document.querySelector(".weather_icon");
const realFeelElement = document.querySelector(".realFeel");
const humidityElement = document.querySelector(".humidity");
const windSpeedElement = document.querySelector(".w_Speed");
const airPressureElement = document.querySelector(".pressure");
const inputForm = document.querySelector(".weather_search");
const cityInputElement = document.querySelector(".weather_search input");
const loaderElement = document.querySelector(".loader");

// Show and hide loader
function toggleLoader(visible) {
  loaderElement.style.display = visible ? "block" : "none";
}

// Format date based on timestamp
function formatDate(timestamp) {
  const date = new Date(timestamp * 1000);
  const formatter = new Intl.DateTimeFormat("en-GB", DATE_OPTIONS);
  return formatter.format(date);
}

// Fetch weather data for a specified city
async function fetchWeatherData(city) {
  toggleLoader(true);

  const url = `${API_BASE_URL}${city}?unitGroup=metric&key=${API_KEY}&contentType=json&include=current`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch weather data. Status code: ${response.status}`
      );
    }

    const weatherData = await response.json();
    await updateDOMElements(weatherData); // Wait for DOM update to complete
  } catch (error) {
    console.error("Failed to fetch weather data:", error);
    // Optionally, provide user feedback
  } finally {
    toggleLoader(false); // Hide loader only after DOM update is complete
  }
}

// Update DOM with weather data
async function updateDOMElements(weatherData) {
  const { currentConditions, days, latitude, longitude } = weatherData;

  // Get location information
  const location = await getLocationInfo(latitude, longitude); // Await the location info

  if (location) {
    const { city, country } = location;
    cityNameElement.textContent = `${city}, ${country}`;
  }

  // Update weather elements
  weatherStatusElement.textContent = currentConditions.conditions;
  tempElement.innerHTML = `${Math.round(currentConditions.temp)}°C`;
  minTempElement.innerHTML = `Min: ${Math.round(days[0].tempmin)}°C`;
  maxTempElement.innerHTML = `Max: ${Math.round(days[0].tempmax)}°C`;
  realFeelElement.innerHTML = `${Math.round(currentConditions.feelslike)}°C`;
  windSpeedElement.textContent = `${currentConditions.windspeed} km/h`;
  airPressureElement.textContent = `${currentConditions.pressure} hPa`;
  humidityElement.textContent = `${currentConditions.humidity}%`;
  currentDateTimeElement.textContent = formatDate(days[0].datetimeEpoch);

  // Set weather icon
  const weatherIconCode = currentConditions.icon;
  weatherIconElement.src = `${ICON_BASE_URL}${weatherIconCode}.png`;
}

// Handle form submission
function handleFormSubmit(event) {
  event.preventDefault();
  const city = cityInputElement.value.trim();
  if (city) {
    fetchWeatherData(city);
    cityInputElement.value = "";
  }
}

// Get current location of the user
function getCurrentLocation(callback) {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        callback({ latitude, longitude });
      },
      (error) => console.error(`Error obtaining location: ${error.message}`),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  } else {
    console.error("Geolocation not supported.");
  }
}

// Get location information based on coordinates
async function getLocationInfo(lat, lng) {
  toggleLoader(true);
  try {
    const geocodingUrl = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${GEO_API_KEY}`;

    const response = await fetch(geocodingUrl);
    if (!response.ok) {
      throw new Error(`Geocoding error: ${response.status}`);
    }

    const data = await response.json();
    const result = data.results?.[0];
    if (result) {
      const { city, town, village, country } = result.components;
      return { city: city || town || village, country };
    }
  } catch (error) {
    console.error("Error fetching geocoding data:", error);
    return null;
  } finally {
    toggleLoader(false);
  }
}

// Initialize the application
async function init() {
  inputForm.addEventListener("submit", handleFormSubmit);

  // Determine and fetch weather for the user's current city
  getCurrentLocation(async ({ latitude, longitude }) => {
    const locationInfo = await getLocationInfo(latitude, longitude);
    if (locationInfo?.city) {
      fetchWeatherData(locationInfo.city);
    }
  });
}

// Start the application
init();

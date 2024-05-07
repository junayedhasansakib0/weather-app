// Constant elements
const API_KEY = "X4695C5A687RL98MS69FG4S2V";
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

// Helper function to capitalize text
function capitalizeText(text) {
  return text
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Helper functions to show and hide the loader
function showLoader() {
  loaderElement.style.display = "block";
}

function hideLoader() {
  loaderElement.style.display = "none";
}

// Helper function to format the date
function formatDate(timestamp) {
  const date = new Date(timestamp * 1000);
  const dateTimeFormatter = new Intl.DateTimeFormat("en-GB", DATE_OPTIONS);
  return dateTimeFormatter.format(date);
}

// Function to update DOM elements with weather data
function updateDOMElements(weatherData) {
  cityNameElement.textContent = weatherData.address;
  weatherStatusElement.textContent = weatherData.currentConditions.conditions;
  tempElement.innerHTML = `${parseInt(
    weatherData.currentConditions.temp
  )}&deg;C`;
  minTempElement.innerHTML = `Min: ${parseInt(
    weatherData.days[0].tempmin
  )}&deg;C`;
  maxTempElement.innerHTML = `Max: ${parseInt(
    weatherData.days[0].tempmax
  )}&deg;C`;
  realFeelElement.innerHTML = `${parseInt(
    weatherData.currentConditions.feelslike
  )}&deg;C`;
  windSpeedElement.textContent = `${weatherData.currentConditions.windspeed} km/h`;
  airPressureElement.textContent = `${weatherData.currentConditions.pressure} hPa`;
  humidityElement.textContent = `${weatherData.currentConditions.humidity}%`;
  currentDateTimeElement.textContent = formatDate(
    weatherData.days[0].datetimeEpoch
  );

  // Set weather icon
  const weatherIconCode = weatherData.currentConditions.icon;
  const weatherIconUrl = `${ICON_BASE_URL}${weatherIconCode}.png`;
  weatherIconElement.src = weatherIconUrl;
}

// Function to fetch weather data
async function fetchWeatherData(city) {
  showLoader();

  const url = `${API_BASE_URL}${city}?unitGroup=metric&key=${API_KEY}&contentType=json&include=current`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `Error: Unable to fetch weather data. Status code: ${response.status}`
      );
    }

    const weatherData = await response.json();
    updateDOMElements(weatherData);
    hideLoader();
  } catch (error) {
    console.error("Failed to fetch weather data:", error);
    hideLoader();
    // Additional error handling can be added here (e.g. showing a user-friendly message).
  }
}

// Event handler for form submission
function handleFormSubmit(e) {
  e.preventDefault();
  const city = capitalizeText(cityInputElement.value);
  fetchWeatherData(city);
  cityInputElement.value = ""; // Clear the input after submission
}

// Initial setup and event listener binding
function init() {
  document.addEventListener("DOMContentLoaded", () => {
    // Default city on page load
    fetchWeatherData("Dhaka");
  });

  inputForm.addEventListener("submit", handleFormSubmit);
}

// Initialize the script
init();

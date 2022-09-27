// api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={API key}  5 days / 3 hours

// https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API key} current day weather

//http://api.openweathermap.org/geo/1.0/direct?q={city name},{state code},{country code}&limit={limit}&appid={API key}
// convert city names to geo coordinates

// 1ff8e1adf1658293d1d256155fe06eec  My API key

// http://openweathermap.org/img/wn/10d@2x.png  weather icon URL

const apiKey = "1ff8e1adf1658293d1d256155fe06eec";

const userInput = document.querySelector("#userInput");
const searchButton = document.querySelector("#search-button");
const clearHistoryButton = document.querySelector(".clear-button");
const todaysWeather = document.querySelector(".today");
const futureWeather = document.querySelector(".future");
const searchHistoryList = document.querySelector(".history-list");

let searchHistory = [];

function init() {
  // if local storage isnt empty, load data into searchHistory array
  if (localStorage.getItem("searchHistory") !== null) {
    searchHistory = JSON.parse(localStorage.getItem("searchHistory"));
  } else {
    searchHistory = [];
  }

  // add event listener to the search button
  searchButton.addEventListener("click", function (event) {
    event.preventDefault();
    let str = userInput.value.trim(""); // takes away unwanted space
    let cityName = str.charAt(0).toUpperCase() + str.slice(1); // capitalize the 1st letter
    let convertNameToCoordinatesURL =
      "http://api.openweathermap.org/geo/1.0/direct?q=" +
      cityName +
      "&appid=1ff8e1adf1658293d1d256155fe06eec"; // calling the geocoding API to convert city names in to global coordinates

    let latitude;
    let longitude;

    removeDisplay(); // remove all rendered HTML elements

    // This will return the latitude & longitude of the target city
    fetch(convertNameToCoordinatesURL)
      .then(function (response) {
        if (response.ok) {
          response.json().then(function (data) {
            if (data.length != 0) {
              latitude = data[0].lat.toFixed(2).toString();
              longitude = data[0].lon.toFixed(2).toString();

              addSearchToHistory(cityName); // add to search history
              fetchWeatherCurrent(latitude, longitude, cityName); // fetch weather info for today
            } else {
              alert("Invalid location");
            }
          });
        } else {
          alert("Error: " + response.statusText);
        }
      })
      .catch(function (error) {
        alert("Unable to fetch coordinates");
      });

    userInput.value = "";
  });

  // add event listener to the clear history button
  clearHistoryButton.addEventListener("click", function (event) {
    event.preventDefault();
    searchHistory = [];
    localStorage.setItem("searchHistory", JSON.stringify(searchHistory));

    renderHistory(); // clear history list
    removeDisplay(); // remove rendered HTML elements
  });

  renderHistory(); // render search history when page loads
}

function fetchWeatherCurrent(latitude, longitude, cityName) {
  // getting data for just today
  fetch(
    "https://api.openweathermap.org/data/2.5/weather?units=metric&lat=" +
      latitude +
      "&lon=" +
      longitude +
      "&appid=" +
      apiKey
  )
    .then(function (response) {
      if (response.ok) {
        response.json().then(function (data) {
          removeDisplay(); // remove old display before re-rendering
          renderDisplayCurrent(data); // render UI elements with data
          fetchWeather5Days(latitude, longitude, cityName); // proceeds to get 5 day weather info
          console.log(data);
        });
      } else {
        alert("Error: " + response.statusText);
      }
    })
    .catch(function (error) {
      alert("Invalid Geo Location!");
    });
}

function fetchWeather5Days(latitude, longitude, cityName) {
  fetch(
    "http://api.openweathermap.org/data/2.5/forecast?units=metric&lat=" +
      latitude +
      "&lon=" +
      longitude +
      "&appid=" +
      apiKey
  )
    .then(function (response) {
      if (response.ok) {
        response.json().then(function (data) {
          renderDisplay5Days(data); // renders weather info for next 5 days
          console.log(data);
        });
      } else {
        alert("Error: " + response.statusText);
      }
    })
    .catch(function (error) {
      alert("Invalid Geo Location!");
    });
}

function renderDisplayCurrent(weatherInfo) {
  let city = document.createElement("h2");
  let icon = document.createElement("img");
  let temp = document.createElement("p");
  let wind = document.createElement("p");
  let humidity = document.createElement("p");
  let iconURL =
    "http://openweathermap.org/img/wn/" +
    weatherInfo.weather[0].icon +
    "@2x.png";
  city.setAttribute("class", "city");
  temp.setAttribute("class", "temp");
  wind.setAttribute("class", "wind");
  humidity.setAttribute("class", "humidity");
  icon.setAttribute("class", "icon");
  icon.setAttribute("alt", "weather icon");
  icon.setAttribute("src", iconURL);

  city.textContent =
    weatherInfo.name + ", " + moment().format("ddd, YYYY-MM-DD"); // use moment.js to format the date
  temp.textContent = "Temperature: " + weatherInfo.main.temp.toFixed(0) + "°C";
  wind.textContent =
    "Wind speed: " + weatherInfo.wind.speed.toFixed(0) + " MPH";
  humidity.textContent =
    "Humidity: " + weatherInfo.main.humidity.toFixed(0) + " %";

  todaysWeather.style.border = "1px var(--color-button) solid";
  todaysWeather.appendChild(city);
  todaysWeather.appendChild(icon);
  todaysWeather.appendChild(temp);
  todaysWeather.appendChild(wind);
  todaysWeather.appendChild(humidity);
}

function renderDisplay5Days(weatherInfo) {
  let tempSum = 0;
  let windSum = 0;
  let humiditySum = 0;
  let iconCode;
  let tempAverage = [];
  let windAverage = [];
  let humidityAverage = [];
  let dateArray = [];
  let iconCodeArray = [];

  // use a for loop to get the average data for each of the 5 days
  // the data we get back from the API has an interval of 3 hours
  for (let i = 0; i < weatherInfo.list.length; i = i + 8) {
    for (let x = 0; x < 8; x++) {
      tempSum += weatherInfo.list[x + i].main.temp;
      windSum += weatherInfo.list[x + i].wind.speed;
      humiditySum += weatherInfo.list[x + i].main.humidity;
    }

    iconCode = weatherInfo.list[i + 5].weather[0].icon; // use afternoon data for weather icon

    tempAverage.push((tempSum / 8).toFixed(0));
    windAverage.push((windSum / 8).toFixed(0));
    humidityAverage.push((humiditySum / 8).toFixed(0));
    dateArray.push(weatherInfo.list[i].dt_txt);
    iconCodeArray.push(iconCode);

    tempSum = 0;
    windSum = 0;
    humiditySum = 0;
  }

  const futureWeatherList = document.createElement("div");
  futureWeatherList.setAttribute("class", "card");

  for (let index = 0; index < tempAverage.length; index++) {
    let city = document.createElement("h2");
    let icon = document.createElement("img");
    let temp = document.createElement("p");
    let wind = document.createElement("p");
    let humidity = document.createElement("p");
    let iconURL =
      "http://openweathermap.org/img/wn/" + iconCodeArray[index] + ".png";
    city.setAttribute("class", "city");
    temp.setAttribute("class", "temp");
    wind.setAttribute("class", "wind");
    humidity.setAttribute("class", "humidity");
    icon.setAttribute("class", "icon");
    icon.setAttribute("alt", "weather icon");
    icon.setAttribute("src", iconURL);

    city.textContent = moment(dateArray[index], "YYYY-MM-DD HH:mm:ss").format(
      "ddd, YYYY-MM-DD"
    );
    temp.textContent = "Temperature: " + tempAverage[index] + "°C";
    wind.textContent = "Wind speed: " + windAverage[index] + " MPH";
    humidity.textContent = "Humidity: " + humidityAverage[index] + " %";
    const futureWeatherList = document.createElement("div");
    futureWeatherList.setAttribute("class", "card");
    futureWeather.appendChild(futureWeatherList);
    futureWeatherList.appendChild(city);
    futureWeatherList.appendChild(icon);
    futureWeatherList.appendChild(temp);
    futureWeatherList.appendChild(wind);
    futureWeatherList.appendChild(humidity);
  }

  // make sure to clear the arrays before doing the next fetch and render
  tempAverage = [];
  windAverage = [];
  humidityAverage = [];
}

function removeDisplay() {
  const cityDisplay = document.querySelectorAll(".city");
  const tempDisplay = document.querySelectorAll(".temp");
  const windDisplay = document.querySelectorAll(".wind");
  const humidityDisplay = document.querySelectorAll(".humidity");
  const cardDisplay = document.querySelectorAll(".card");
  const iconDisplay = document.querySelectorAll(".icon");

  for (let i = 0; i < cityDisplay.length; i++) {
    cityDisplay[i].remove();
    tempDisplay[i].remove();
    windDisplay[i].remove();
    humidityDisplay[i].remove();
  }

  for (let i = 0; i < cardDisplay.length; i++) {
    cardDisplay[i].remove();
  }

  for (let i = 0; i < iconDisplay.length; i++) {
    iconDisplay[i].remove();
  }

  todaysWeather.style.border = "none";
}

function addSearchToHistory(cityName) {
  searchHistory.push(cityName);
  localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
  renderHistory();
}

// adding history buttons to the list
function renderHistory() {
  const listItemArray = document.querySelectorAll(".history-item");
  const historyButtonArray = document.querySelectorAll(".history-button");

  // before updating the history, first clear the old ones to avoid redundancy
  if ((listItemArray !== null) & (historyButtonArray !== null)) {
    for (let i = 0; i < listItemArray.length; i++) {
      listItemArray[i].remove();
      historyButtonArray[i].remove();
    }
  }

  // rendering
  for (let i = 0; i < searchHistory.length; i++) {
    const listItem = document.createElement("li");
    const historyButton = document.createElement("button");

    listItem.setAttribute("class", "history-item");
    historyButton.setAttribute("class", "history-button");

    historyButton.textContent = searchHistory[i];

    searchHistoryList.appendChild(listItem);
    listItem.appendChild(historyButton);

    // add event listener to each button so when clicked, weather info will be fetched
    historyButton.addEventListener("click", function (event) {
      event.preventDefault();
      let cityName = historyButton.textContent;
      let convertNameToCoordinatesURL =
        "http://api.openweathermap.org/geo/1.0/direct?q=" +
        cityName +
        "&appid=1ff8e1adf1658293d1d256155fe06eec";

      let latitude;
      let longitude;

      fetch(convertNameToCoordinatesURL)
        .then(function (response) {
          return response.json();
        })
        .then(function (data) {
          latitude = data[0].lat.toFixed(2).toString();
          longitude = data[0].lon.toFixed(2).toString();
          fetchWeatherCurrent(latitude, longitude, cityName);
        });
    });
  }
}

init();

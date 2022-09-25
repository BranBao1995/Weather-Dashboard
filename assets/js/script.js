// api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={API key}  5 days / 3 hours

// api.openweathermap.org/data/2.5/forecast/daily?lat={lat}&lon={lon}&cnt={cnt}&appid={API key} 16 days daily

//http://api.openweathermap.org/geo/1.0/direct?q={city name},{state code},{country code}&limit={limit}&appid={API key}
// convert city names to geo coordinates

// 1ff8e1adf1658293d1d256155fe06eec  My API key

const apiKey = "1ff8e1adf1658293d1d256155fe06eec";

const userInput = document.querySelector("#userInput");
const searchButton = document.querySelector("#search-button");
const todaysWeather = document.querySelector(".today");
const futureWeather = document.querySelector(".future");

searchButton.addEventListener("click", function (event) {
  event.preventDefault();
  let cityName = userInput.value.trim("");
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
      fetchWeather(latitude, longitude);
    });

  userInput.value = "";
});

function fetchWeather(latitude, longitude) {
  fetch(
    "http://api.openweathermap.org/data/2.5/forecast?units=metric&lat=" +
      latitude +
      "&lon=" +
      longitude +
      "&appid=" +
      apiKey
  )
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      renderDisplay(data);
      removeDisplay();
      console.log(data);
    });
}

function renderDisplay(weatherInfo) {
  let tempSum = 0;
  let windSum = 0;
  let humiditySum = 0;
  let tempAverage = [];
  let windAverage = [];
  let humidityAverage = [];

  let city = document.createElement("h2");
  let temp = document.createElement("p");
  let wind = document.createElement("p");
  let humidity = document.createElement("p");

  for (let i = 0; i < weatherInfo.list.length; i = i + 8) {
    for (let x = 0; x < 8; x++) {
      tempSum += weatherInfo.list[x + i].main.temp;
      windSum += weatherInfo.list[x + i].wind.speed;
      humiditySum += weatherInfo.list[x + i].main.humidity;
    }

    tempAverage.push((tempSum / 8).toFixed(0));
    windAverage.push((windSum / 8).toFixed(0));
    humidityAverage.push((humiditySum / 8).toFixed(0));

    tempSum = 0;
    windSum = 0;
    humiditySum = 0;
  }

  city.textContent = weatherInfo.city.name + " " + weatherInfo.list[0].dt_txt;
  temp.textContent = "Temperature: " + tempAverage[0];
  wind.textContent = "Wind speed: " + windAverage[0];
  humidity.textContent = "Humidity: " + humidityAverage[0];
  todaysWeather.appendChild(city);
  todaysWeather.appendChild(temp);
  todaysWeather.appendChild(wind);
  todaysWeather.appendChild(humidity);

  const futureWeatherList = document.createElement("div");
  futureWeatherList.setAttribute("class", "card");

  for (let index = 1; index < tempAverage.length; index++) {
    let city = document.createElement("h2");
    let temp = document.createElement("p");
    let wind = document.createElement("p");
    let humidity = document.createElement("p");
    city.textContent = weatherInfo.list[index].dt_txt;
    temp.textContent = "Temperature: " + tempAverage[index];
    wind.textContent = "Wind speed: " + windAverage[index];
    humidity.textContent = "Humidity: " + humidityAverage[index];
    const futureWeatherList = document.createElement("div");
    futureWeatherList.setAttribute("class", "card");
    futureWeather.appendChild(futureWeatherList);
    futureWeatherList.appendChild(city);
    futureWeatherList.appendChild(temp);
    futureWeatherList.appendChild(wind);
    futureWeatherList.appendChild(humidity);
  }

  tempAverage = [];
  windAverage = [];
  humidityAverage = [];

  console.log(tempAverage);
  console.log(tempSum);
}

function removeDisplay() {}

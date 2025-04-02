let apiKey = "1e3e8f230b6064d27976e41163a82b77";
let searchInput = document.querySelector(".searchinput");
let recommendationsContainer = document.createElement("div");
recommendationsContainer.classList.add("recommendations");
document.querySelector(".search").appendChild(recommendationsContainer);

async function getLocationRecommendations(query) {
    if (query.length < 3) {
        recommendationsContainer.style.display = "none";
        return;
    }
    let url = `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${apiKey}`;
    let response = await fetch(url);
    if (response.ok) {
        let data = await response.json();
        displayRecommendations(data);
    }
}

function displayRecommendations(locations) {
    recommendationsContainer.innerHTML = "";
    if (locations.length === 0) {
        recommendationsContainer.style.display = "none";
        return;
    }
    locations.forEach((location) => {
        let div = document.createElement("div");
        div.classList.add("recommendation-item");
        div.innerText = `${location.name}, ${location.state || ""}, ${location.country}`;
        div.addEventListener("click", () => {
            searchInput.value = location.name;
            search(location.name);
            recommendationsContainer.style.display = "none";
        });
        recommendationsContainer.appendChild(div);
    });
    recommendationsContainer.style.display = "block";
}

async function search(city) {
    let url = await fetch(`https://api.openweathermap.org/data/2.5/weather?units=metric&q=${city}&appid=${apiKey}`);
    if (url.ok) {
        let data = await url.json();
        console.log(data);

        const locationData = {
            lat: data.coord.lat,
            lon: data.coord.lon,
            name: data.name,
            timestamp: Date.now(),
            isSearched: true
        };

        localStorage.setItem('weatherLocation', JSON.stringify(locationData));

        let box = document.querySelector(".return");
        box.style.display = "block";

        let message = document.querySelector(".message");
        message.style.display = "none";

        let errormessage = document.querySelector(".error-message");
        errormessage.style.display = "none";

        let weatherImg = document.querySelector(".weather-img");
        document.querySelector(".city-name").innerHTML = data.name;
        document.querySelector(".weather-temp").innerHTML = Math.floor(data.main.temp) + '°';
        document.querySelector(".wind").innerHTML = Math.floor(data.wind.speed) + " m/s";
        document.querySelector(".pressure").innerHTML = Math.floor(data.main.pressure) + " hPa";
        document.querySelector('.humidity').innerHTML = Math.floor(data.main.humidity) + "%";
        document.querySelector(".sunrise").innerHTML = new Date(data.sys.sunrise * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        document.querySelector(".sunset").innerHTML = new Date(data.sys.sunset * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

        if (data.weather[0].main === "Rain") {
            weatherImg.src = "img/rain.png";
        } else if (data.weather[0].main === "Clear") {
            weatherImg.src = "img/sun.png";
        } else if (data.weather[0].main === "Snow") {
            weatherImg.src = "img/snow.png";
        } else if (data.weather[0].main === "Clouds" || data.weather[0].main === "Smoke") {
            weatherImg.src = "img/cloud.png";
        } else if (data.weather[0].main === "Mist" || data.weather[0].main === "Fog") {
            weatherImg.src = "img/mist.png";
        } else if (data.weather[0].main === "Haze") {
            weatherImg.src = "img/haze.png";
        }
    } else {
        let box = document.querySelector(".return");
        box.style.display = "none";

        let message = document.querySelector(".message");
        message.style.display = "none";

        let errormessage = document.querySelector(".error-message");
        errormessage.style.display = "block";
    }
}

searchInput.addEventListener("input", function () {
    getLocationRecommendations(this.value);
});

searchInput.addEventListener("keydown", function (event) {
    if (event.keyCode === 13 || event.which === 13) {
        search(searchInput.value);
        recommendationsContainer.style.display = "none";
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const apiKey = "1e3e8f230b6064d27976e41163a82b77";
    const cityElement = document.getElementById("city");
    const tempElement = document.getElementById("current-temp");
    const conditionElement = document.getElementById("weather-condition");
    const activitiesGrid = document.querySelector(".activities-grid");

    function fetchWeather(lat, lon, cityName = null) {
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                const name = cityName || data.name;
                const temp = Math.round(data.main.temp) + "°C";
                const condition = data.weather[0].main;

                cityElement.innerHTML = `<i class="fa-solid fa-location-dot"></i> <h2>${name}</h2>`;
                tempElement.textContent = temp;
                conditionElement.textContent = condition;

                const sunrise = data.sys.sunrise + data.timezone;
                const sunset = data.sys.sunset + data.timezone;

                updateActivities(condition, temp, sunrise, sunset);
            })
            .catch(error => {
                console.error("Error fetching weather:", error);
            });
    }

    function formatTime(unixTime) {
        const date = new Date(unixTime * 1000); // Convert seconds to ms
        let hours = date.getUTCHours();
        const minutes = date.getUTCMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
    
        hours = hours % 12;
        hours = hours ? hours : 12; // Convert 0 to 12
    
        const minutesStr = minutes.toString().padStart(2, '0');
        return `${hours}:${minutesStr} ${ampm}`;
    }
    

    function updateActivities(condition, temp, sunrise, sunset) {
        let activities = [];

        if (condition.includes("Clear") || condition.includes("Cloud")) {
            activities = [
                { icon: "fa-running", name: "Running", time: formatTime(sunrise + 3600), level: "excellent" }, // 1 hr after sunrise
                { icon: "fa-bicycle", name: "Cycling", time: formatTime(sunrise + 7200), level: "good" }
            ];
        } else if (condition.includes("Rain") || condition.includes("Thunderstorm")) {
            activities = [
                { icon: "fa-book", name: "Reading", time: "Anytime", level: "good" },
                { icon: "fa-video", name: "Watching Movies", time: "Evening", level: "excellent" }
            ];
        } else {
            activities = [
                { icon: "fa-tree", name: "Gardening", time: formatTime(sunset - 7200), level: "fair" }, // 2 hrs before sunset
                { icon: "fa-hiking", name: "Hiking", time: formatTime(sunrise + 5400), level: "good" }   // 1.5 hrs after sunrise
            ];
        }

        activitiesGrid.innerHTML = ""; // Clear previous activities

        activities.forEach(activity => {
            const activityHTML = `
                <div class="activity-item">
                    <i class="fas ${activity.icon}"></i>
                    <span>${activity.name}</span>
                    <div class="recommendation ${activity.level}">
                        Best time: ${activity.time}
                    </div>
                </div>`;
            activitiesGrid.innerHTML += activityHTML;
        });
    }

    function checkStoredLocation() {
        const storedLocation = localStorage.getItem("weatherLocation");
        if (storedLocation) {
            const { lat, lon, name } = JSON.parse(storedLocation);
            fetchWeather(lat, lon, name);
            return true;
        }
        return false;
    }

    if (!checkStoredLocation()) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                position => {
                    const { latitude, longitude } = position.coords;
                    fetchWeather(latitude, longitude);
                },
                () => {
                    alert("Location access denied. Please enter a city manually.");
                }
            );
        } else {
            alert("Geolocation is not supported by your browser.");
        }
    }
});

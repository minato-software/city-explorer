const locationForm = document.getElementById('locationForm');
const resultsElement = document.getElementById('results');
const locationInput = document.getElementById('locationInput');

locationForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Don't use the server to process the form. Continue processing below
    resultsElement.style.display = 'none';
    const locationInputFromUser = locationInput.value.trim();
    // Don't continue if the location search is missing
    if(!locationInputFromUser) {
        resultsElement.innerHTML = '<p class="bg-yellow-500  p-2 text border-2 rounded-lg">Location is required</p>';
        resultsElement.style.display = 'block';
        return;
    }

    try {
        resultsElement.innerHTML = `
            <div class="flex item-center justify-center p-10">
                <i class="fas fa-spinner fa-spin text-4xl mr-4"></i>
                <p class="text-2xl">Loading data...</p>
            </div>
        `;
        resultsElement.style.display = 'block';

        const params = new URLSearchParams({
            search: locationInputFromUser,
        });

        let apiUrl = '';
        // To-do write an if statement to determine if we are on http or https
        apiUrl = 'http://localhost:4000/location'
        apiUrl += `?${params}`;
        const myApiResponse = await fetch(apiUrl);
        if(myApiResponse.status !== 200) {
            throw new Error(myApiResponse.statusText);
        }
        const data = await myApiResponse.json();
        console.log(data);
        resultsElement.innerHTML = `
        <h2 id="locationName" class="text-xl font-medium mb-5"></h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div id="mapCard" class="md:col-span-2">
                 <div id="map"></div>
                </div>
                <div id="weatherCard" class="bg-white rounded-lg shadow p-5">
                    <h3 class="text-lg font-medium mb-4">Current Weather</h3>
                    <div class="space-y-3">
                        <div class="flex">
                            <span class="font-semibold w-28">Condition:</span>
                            <span id="weatherDesc"></span>
                        </div>
                        <div class="flex">
                            <span class="font-semibold w-28">Temperature:</span>
                            <span id="currentTemp"></span>°F
                        </div>
                        <div class="flex">
                            <span class="font-semibold w-28">Feels Like:</span>
                            <span id="feelsLike"></span>°F
                        </div>
                        <div class="flex">
                            <span class="font-semibold w-28">Humidity:</span>
                            <span id="humidity"></span>%
                        </div>
                        <div class="flex">
                            <span class="font-semibold w-28">Wind:</span>
                            <span id="windSpeed"></span> mph
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <h3 class="text-xl font-medium my-4">Nearby Restaurants</h3>
                <div id="restaurantsSection" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"></div>
            </div>
            <div>
                <h3 class="text-xl font-medium my-4">Nearby Theaters</h3>
                <div id="movieTheaterSection" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"></div>
            </div>
        `;

        // Display location data
        const locationNameElement = document.getElementById('locationName');
        const {latitude, longitude, formattedQuery} = data.locationData;
        // TO DO: modify the formatted query to be more readable
        locationNameElement.textContent = formattedQuery;

        // Display map
        const mapEl = document.getElementById('map');
        try {
            const map = L.map(mapEl).setView([latitude,longitude], 13);

            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            }).addTo(map);

            L.marker([latitude,longitude]).addTo(map);
        }
        catch(error) {
            mapEl.innerHTML = `
            <div class="p-4 bg-red-200 text-red-700 rounded">
                    <p>Error loading map: ${error.message}</p>
            </div>
            `;
        }


        //Display weather data
        const weatherDescEl = document.getElementById('weatherDesc');
        const currentTempEl = document.getElementById('currentTemp');
        const feelsLikeEl = document.getElementById('feelsLike');
        const humidityEl = document.getElementById('humidity');
        const windSpeedEl = document.getElementById('windSpeed');
        const {weatherName, weather, current_temp, feels_like, temp_min, temp_max, humidity, wind_speed, wind_direction, cloud_percentage} = data.weatherData;
        weatherDescEl.textContent = weather;
        currentTempEl.textContent = current_temp;
        feelsLikeEl.textContent = feels_like;
        humidityEl.textContent = humidity;
        windSpeedEl.textContent = wind_speed;

        // Display Restaurant Data
        const restaurantsSectionEl = document.getElementById('restaurantsSection');
        const restaurantsArr = data.restaurantData;
        if(restaurantsArr.length > 0) {
            restaurantsArr.forEach(restaurant => {
                //const {name, rating, image_url, price, url, phone, categories, address, city, state, zip} = restaurant;
                const restaurantCard = `
                    <div class='bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition transform hover:-translate-y-1'>
                        <img src="${restaurant.image_url || 'https://placehold.co/600x400?text=No+Image'}" alt="${restaurant.name}" class="w-full h-36 object-cover">
                        <div class="p-4">
                            <h4 class="font-semibold mb-2">${restaurant.name}</h4>
                            <p class="text-sm text-gray-600 mb-1">${restaurant.price || 'Price not available'}</p>
                            <p class="text-sm text-gray-600 mb-1">${restaurant.address || ''}</p>
                            <p class="text-sm text-gray-600 mb-1">${restaurant.city || ''}, ${restaurant.state || ''} ${restaurant.zip || ''}</p>
                            <p class="text-sm text-gray-600 mb-1">${restaurant.phone || 'Phone not available'}</p>
                            ${restaurant.url ? `<a href="${restaurant.url}" target="_blank" class="inline-block mt-2 text-gray-800 font-medium hover:underline">Visit Website</a>` : ''}
                        </div>
                    </div>
                `;
                restaurantsSectionEl.insertAdjacentHTML('beforeend', restaurantCard);
            });
        }

        // Display Movie Theater Data
        const movieTheaterArr = data.movieTheaterData;
        if(movieTheaterArr && movieTheaterArr.length > 0) {
            // Display the movie theaters
        } else {
            //Display "no movie theaters found" or "failed to retrieve movie theaters"
        }

        // const movieTheaterSectionEl = document.getElementById('movieTheaterSection');
        // const theatersArr = data.movieTheaterData;
        // if(theatersArr.length > 0) {
        //     theatersArr.forEach(theater => {
        //         //const {cinema_name, address, address2, city, state, postcode} = theater;
        //         const movieCard = `
        //         <div class='bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition transform hover:-translate-y-1'>
        //                 <div class="p-4">
        //                     <h4 class="font-semibold mb-2">${theater.cinema_name}</h4>
        //                     <p class="text-sm text-gray-600 mb-1">${theater.address || ''}</p>
        //                     <p class="text-sm text-gray-600 mb-1">${theater.address2 || ''}</p>
        //                     <p class="text-sm text-gray-600 mb-1">${theater.city || ''}, ${theater.state || ''} ${theater.zip || ''}</p>
        //                     ${theater.url ? `<a href="${theater.url}" target="_blank" class="inline-block mt-2 text-gray-800 font-medium hover:underline">Visit Website</a>` : ''}
        //                 </div>
        //         </div>
        //         `;
        //         movieTheaterSectionEl.insertAdjacentHTML('beforeend', movieCard);
        //     });
        // }

    } catch(error) {
        // Display a message when something goes wrong
        resultsElement.innerHTML = `
            <div class="bg-red-200 border border-red-400 text-red-800 rounded-lg p-5 mt-5">
                <h3 class="font-semibold mb-2">Error!</h3>
                <p>Failed to fetch data. Please try again later.</p>
                <p class="text-sm mt-2 text-red-700">${error.message}</p>
            </div>
        `;
    }
})
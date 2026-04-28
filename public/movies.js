const movieForm = document.getElementById('movieForm');
const resultsElement = document.getElementById('results');
const movieInput = document.getElementById('movieInput');

movieForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Don't use the server to process the form. Continue processing below
    resultsElement.style.display = 'none';
    const movieInputFromUser = movieInput.value.trim();
    // Don't continue if the location search is missing
    if(!movieInputFromUser) {
        resultsElement.innerHTML = '<p class="bg-yellow-500  p-2 text border-2 rounded-lg">Movie title is required</p>';
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
            search: movieInputFromUser,
        });

        let apiUrl = '';
        // To-do write an if statement to determine if we are on http or https
        if(location.protocol === 'https:') {
            apiUrl = `${location.origin}/movies`;
        } else{
            apiUrl = 'http://localhost:4000/movies'
        }
        apiUrl += `?${params}`;
        const myApiResponse = await fetch(apiUrl);

        if(myApiResponse.status !== 200) {
            throw new Error(myApiResponse.statusText);
        }
        const data = await myApiResponse.json();
        console.log(data);
        resultsElement.innerHTML = `
        <h2 id="locationName" class="text-xl font-medium mb-5"></h2>
            <div>
                <div id="movieSection" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"></div>
            </div>
        `;

        // Display Restaurant Data
        // const restaurantsSectionEl = document.getElementById('restaurantsSection');
        // const restaurantsArr = data.restaurantData;
        // if(restaurantsArr && restaurantsArr.length > 0) {
        //     restaurantsArr.forEach(restaurant => {
        //         const restaurantCard = `
        //             <div class='bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition transform hover:-translate-y-1'>
        //                 <img src="${restaurant.image_url || 'https://placehold.co/600x400?text=No+Image'}" alt="${restaurant.name}" class="w-full h-36 object-cover">
        //                 <div class="p-4">
        //                     <h4 class="font-semibold mb-2">${restaurant.name}</h4>
        //                     <p class="text-sm text-gray-600 mb-1">${restaurant.price || 'Price not available'}</p>
        //                     <p class="text-sm text-gray-600 mb-1">${restaurant.address || ''}</p>
        //                     <p class="text-sm text-gray-600 mb-1">${restaurant.city || ''}, ${restaurant.state || ''} ${restaurant.zip || ''}</p>
        //                     <p class="text-sm text-gray-600 mb-1">${restaurant.phone || 'Phone not available'}</p>
        //                     ${restaurant.url ? `<a href="${restaurant.url}" target="_blank" class="inline-block mt-2 text-gray-800 font-medium hover:underline">Visit Website</a>` : ''}
        //                 </div>
        //             </div>
        //         `;
        //         restaurantsSectionEl.insertAdjacentHTML('beforeend', restaurantCard);
        //     });
        // } else {
        //     restaurantsSectionEl.innerHTML = '<p class="col-span-full text-gray-500">No restaurants found or service unavailable.</p>';
        // }

        // display movie data
        const movieSectionEl = document.getElementById('movieSection');
        const moviesArr = data.movies;
        if(moviesArr && moviesArr.length > 0) {
            moviesArr.forEach(movie => {
                const moviePath = 'https://media.themoviedb.org/t/p/w300_and_h450_face'
                const movieCard = `
                    <div class="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition transform hover:-translate-y-1">
                        <img src=" ${moviePath}/${movie.poster_path} || 'https://placehold.co/300x450?text=No+Image'}" alt="${movie.title}" class="w-full h-72 object-cover">
                        <div class="p-4">
                            <h4 class="font-semibold mb-2">${movie.title}</h4>
                            <p class="text-sm text-gray-600 mb-1">${movie.release_date || 'Release date not available'}</p>
                            <p class="text-sm text-gray-600 mb-1">${movie.overview || 'Overview not available'}</p>
                        </div>
                    </div>
                `;
                movieSectionEl.insertAdjacentHTML('beforeend', movieCard);
            });
        } else {
            movieSectionEl.innerHTML = '<p class="col-span-full text-gray-500">No movies found or service unavailable.</p>';
        }

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

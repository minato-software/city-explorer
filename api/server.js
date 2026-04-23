// Application dependencies
const express = require('express');
require('dotenv').config();
const cors = require('cors');
const superagent = require('superagent');
const {connectAll} = require('../config/db');
connectAll(); // Initialize the database


// Setup Application
const app = express();
const port = process.env.PORT || 4000;
const env = process.env.APP_ENV || 'development';
let origin = '';
if (env === 'development') {
    origin = 'http://localhost:5000';
} else {
    origin = 'https://city-explorer-lovat.vercel.app/'
}

app.use(cors({
    origin: origin,
    methods: ['GET'],
    allowedHeaders: ['Content-Type']
}));

// Body parser middleware = Needed to get JSON data from the frontend
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Route definitions
app.use(express.static('./public'));
const todosRouter = require('../routes/todos');
app.use("/api/todos", todosRouter);


















app.get('/location', locationHandler); //will need a moviehandler with a get request



// COPY THIS FOR MOVIE SEARCH THANG  localhost:4000/movies?search=mario should return movie json objects
//VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV
async function locationHandler(req, res) {
    try {
        const search = req.query.search;

        if (search === null || search === undefined || search === '') {
            res.status(400).send('Please enter a valid search query');
            return;
        }
        const responseObj = {};

        let url = 'https://us1.locationiq.com/v1/search';
        const locationIQResponse = await superagent.get(url).query({
            key: process.env.LOCATIONIQ_KEY,
            q: search,
            format: "json"
        });
        const locationJson = locationIQResponse.body[0];
        const myLocation = new Location(search, locationJson);

        responseObj.locationData = myLocation;
        //TO-do verify location exists, stop if location data is invalid

        url = 'https://api.yelp.com/v3/businesses/search';
        const yelpResponse = await superagent.get(url).query({
            latitude: myLocation.latitude,
            longitude: myLocation.longitude,
            limit: 12,
            sort_by: 'distance',
            term: 'restaurants'
        }).set('Authorization', `Bearer ${process.env.YELP_KEY}`);

        const restaurantArr = yelpResponse.body.businesses.map(restaurant => new Restaurant(restaurant));
        responseObj.restaurantData = restaurantArr;

        url = 'https://api.openweathermap.org/data/2.5/weather';
        const openWeatherResponse = await superagent.get(url)
            .query({
                lat: myLocation.latitude,
                lon: myLocation.longitude,
                appid: process.env.OPENWEATHER_KEY,
                units: 'imperial', // Will return fahrenheit
            });

        const weatherJson = openWeatherResponse.body;
        const myWeather = new Weather(weatherJson);
        responseObj.weatherData = myWeather;


        url = 'https://api-gate2.movieglu.com/cinemasNearby/?n=5';
        let movieTheaterArr = [];
        try {
            const movieGluResponse = await superagent.get(url)
                .set('api-version', 'v200')
                .set('Authorization', `Basic ${process.env.MOVIE_AUTH_KEY}`)
                .set('x-api-key', process.env.MOVIE_API_KEY)
                .set('territory', 'US')
                .set('client', 'EDUC_55')
                .set('device-datetime', new Date().toISOString())
                .set('geolocation', `${myLocation.latitude};${myLocation.longitude}`);

            movieTheaterArr = movieGluResponse.body.cinemas.map(cinema => new MovieTheater(cinema));

        } catch(error) {

        }
        responseObj.movieTheaterData = movieTheaterArr;


        res.status(200).send(responseObj);

    } catch (error) {
        console.log(error);
        res.status(500).send('Something went wrong!');
    }

}

// Constructors
function Location(searchQuery, location) {
    this.searchQuery = searchQuery; // This is what the user searched for
    this.formattedQuery = location.display_name; // This is from LocationIQ
    this.latitude = location.lat;
    this.longitude = location.lon;
}

const Restaurant = function (json) {
    this.name = json.name;
    this.rating = json.rating;
    this.image_url = json.image_url;
    this.price = json.price;
    this.url = json.url;
    this.phone = json.display_phone;
    this.categories = json.categories.map(category => category.title);
    this.address = json.location.address1 + (json.location.address2 ? `\n${json.location.address2}` : '');
    this.city = json.location.city;
    this.state = json.location.state;
    this.zip = json.location.zip_code;
}

const Weather = function (json) {
    this.weatherName = json.weather[0].main; // weather description (i.e. Mist)
    this.weather = json.weather[0].description;
    this.current_temp = json.main.temp;
    this.feels_like = json.main.feels_like;
    this.temp_min = json.main.temp_min;
    this.temp_max = json.main.temp_max;
    this.humidity = json.main.humidity;
    this.wind_speed = json.wind.speed;
    this.wind_direction = getWindDirection(json.wind.deg);
    this.cloud_percentage = json.clouds.all;
}

function getWindDirection(degrees) {
    if (degrees >= 337.5 || degrees < 22.5) return "N";
    else if (degrees >= 22.5 && degrees < 67.5) return "NE";
    else if (degrees >= 67.5 && degrees < 112.5) return "E";
    else if (degrees >= 112.5 && degrees < 157.5) return "SE";
    else if (degrees >= 157.5 && degrees < 202.5) return "S";
    else if (degrees >= 202.5 && degrees < 247.5) return "SW";
    else if (degrees >= 247.5 && degrees < 292.5) return "W";
    else return "NW";
}

const MovieTheater = function (json) {
    this.cinema_name = json.cinema_name;
    this.address = json.address;
    this.address2 = json.address2;
    this.city = json.city;
    this.state = json.state;
    this.postcode = json.postcode;
}

// const Movie = function (json) {
//     title
//     posterpath
//     releasedate
//     describe
// }

// App listener
app.listen(port, () => console.log(`Listening on port ${port}`));
module.exports = app;
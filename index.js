const express = require('express'),
 morgan = require('morgan');

const app = express();

app.use(morgan('common'));

// Express GET route with the endpoint "/movies" that returns a JSON object.
app.get('/movies', (req, res) => {
    res.json(topMovies);
});

// Express GET route with the endpoint "/" that returns a default textual response. 
// (* I don't know how to run the project from the terminal and navigate to different URL endpoints..)
app.get('/', (req, res) => {
    let responseText = 'Here we are!';
    res.send(responseText)
});

// Uses express.static to serve "documentation.html" file from the public folder.
app.arguments(express.static('public/documentation.html'));

// Use the Morgan middleware library to log all requests (instead of using the fs module to write to a text file).
// Try navigating to a few pages in your browser and test that the correct information is logged to the terminal.
// Create an error-handling middleware function that will log all application-level errors to the terminal.
// Log all requests with Morgan middleware library.
app.user((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(8080, () => {
    console.log('Your app is listening on port 8080.')
});
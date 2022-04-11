const express = require('express'),
 morgan = require('morgan');

const app = express();

app.use(morgan('common'));

// defining empty URL endpoints

let movies = [{
    title: 'Apocalypse Now',
    director: 'Francis Ford Coppola',
    genre: ['War', 'Drama', 'Adventure']
},
{
    title: 'The Nothing Factory',
    director: 'Pedro Pinho',
    genre: ['Fantasy', 'Drama']
},
{
    title: 'Winter Sleep',
    director: 'Nuri Bilge Ceylan',
    genre: 'Drama'
},
{
    title: 'The Wailing',
    director: 'Na Hong-jin',
    genre: ['Drama', 'Horror', 'Thriller']
},
{
    title: 'First Cow',
    director: 'Kelly Reichardt',
    genre: ['Drama', 'Western']
}
];

let genres = ['War', 'Drama', 'Aventure', 'Fantasy', 'Horror', 'Thriller', 'Drama', 'Western'];

// Return a list of all movies to the user
app.get('/movies', (req, res) => {
    res.json(movies);
});

// Return data about a single movie by title
app.get('/movies/:title', (req, res) => {
    res.json(movies.find((movies) =>
    { return movies.title === req.params.title}));
});

// Return description (data) about a genre by name
app.get('/genres/:genre', (req, res) => {
    res.json(genres.find((genres) =>
    { return genres.genre === req.params.genre}));
});

// Return data about a director by name
app.get('/directors/:director', (req, res) => {
    res.json(directors.find((directors) =>
    { return directors.director === req.params.director}));
});

// Allow new users to register
app.post('/users', (req, res) => {
    let newUser = req.body;

    if (!newUser.userName) {
        const message = 'Please create your username';
        res.status(400).send(message);
    }   else {
        newUser.id = uuid.v4();
        users.push(newUser);
        res.status(201).send(newUser);
    }
});

// Allow users to update their user info (username)
app.put('/users/:usernanme', (req, res) => {
    let username = users.find((username) => { return username.username === req.params.name });

    if (username) {
        username.username[req.params.username] = parseInt(req.params.username);
        res.status(201).send('User' + ' successfully updated their username to ' + req.params.username + '.');
    }   else {
        res.status(404).send('User with the username ' + req.params,username + ' was not found.');
    }
});

// Allow users to add a movie to their list of favourites


// Allow users to delete a movie from their list of favourites
app.delete('/users/:username/favourites/:title', (req, res) => {
    let title = users.find((title) => { return users.username === req.params.username });

    if (title) {
        users = users.filter((obj) => { return obj.username !== req.params.username });
        res.status(201).send('User ' + req.params.username + ' has been deleted.');
    }
});

// Allow existing users to deregister
app.delete('/users/:username', (req, res) => {
    let user = users.find((user) => { return user.username === req.params.username });

    if (user) {
        users = users.filter((obj) => { return obj.username !== req.params.username });
        res.status(201).send('User: ' + req.params.username + ' was deleted.');
    }
});

// Express GET route with the endpoint "/" that returns a default textual response. 
// (* I don't know how to run the project from the terminal and navigate to different URL endpoints..)
app.get('/', (req, res) => {
    let responseText = 'Here we are!';
    res.send(responseText)
});

// Uses express.static to serve "documentation.html" file from the public folder.
app.get('documentation', (req, res) => {
    res.sendFile('public/documentation.html', { root: __dirname });
});

// Use the Morgan middleware library to log all requests (instead of using the fs module to write to a text file).
// Try navigating to a few pages in your browser and test that the correct information is logged to the terminal.
// Create an error-handling middleware function that will log all application-level errors to the terminal.
// Log all requests with Morgan middleware library.
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(8080, () => {
    console.log('Your app is listening on port 8080.')
});
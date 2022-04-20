const express = require('express'),
  bodyparser = require('body-parser'),
  uuid = require('uuid');
const  morgan =require('morgan');
const app = express();
const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;
const Genres = Models.Genre;

mongoose.connect('mongodb://localhost:27017/[myFlixDB]', { 
  useNewUrlParser: true,
  useUnifiedTopology: true,
 });

app.use(bodyparser.json());
//log requests to server
app.use(morgan('common'));
app.get('/', (req, res) => {
  res.send('Welcome to my myFlix website');
});

// READ. Get all movies - okay.
app.get('/movies', (req, res) => {
  Movies.find()
    .then((movie) => {
      res.status(201).json(movie);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// READ. Get all genres - okay.
app.get('/genres', function (req, res) {
    Genres.find()
      .then(function (genres) {
        res.status(201).json(genres);
      })
      .catch(function(err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  });

// READ. Get all users - okay.
app.get('/users', function (req, res) {
  Users.find()
    .then(function (users) {
      res.status(201).json(users);
    })
    .catch(function(err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// READ. Get a user by username - okay.
app.get('/users/:Username', (req, res) => {
  Users.findOne({ Username: req.params.Username })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// READ. Get a movie by title. - okay.
app.get('/movies/:Title', (req, res) => {
  Movies.findOne({ Title: req.params.Title})
  .then((movie) => {
    res.json(movie);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

// READ. Get a movie by director
app.get('/movies/director/:Name', (req, res) => {
    Director.findOne({ Name: req.params.Name })
    .then((name) => {
      res.json(name);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
  });

// CREATE. Adds a movie to a users list of favorite movies. - okay.
app.post('/users/:Username/movies/:_ID', (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, 
      { $push: { FavouriteMovies: req.params.MovieID }
  },
  { new: true }, // this line makes sure that the updated document is returned
  (err, updatedUser) => {
      if (err) {
          console.error(err);
          res.status(500).send('Error: ' + err);
      } else {
          res.json(updatedUser);
      }
  });
});

// READ. Gets information about a director. - okay.
// app.get('/director/:Name', (req, res) => {
//   Movies.findOne({ 'Director.Name': req.params.Name })
//       .then((movie) => {
//           res.json(movie.Director);
//       })
//       .catch((err) => {
//           console.error(err);
//           res.status(500).send('Error: ' + err);
//       });
// });


// CREATE. Add a user and register. - okay.
app.post('/users', (req, res) => {
  Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + 'already exists');
      } else {
        Users
          .create({
            Username: req.body.Username,
            Password: req.body.Password,
            Email: req.body.Email,
            Birthday: req.body.Birthday
          })
          .then((user) =>{res.status(201).json(user) })
        .catch((error) => {
          console.error(error);
          res.status(500).send('Error: ' + error);
        })
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

// UPDATE. Update user details. - okay.
app.put('/users/:Username', (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, { $set:
    {
      Username: req.body.Username,
      Password: req.body.Password,
      Email: req.body.Email,
      Birthday: req.body.Birthday
    }
  },
  { new: true }, // This line makes sure that the updated document is returned
  (err, updatedUser) => {
    if(err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});

// DELETE. Deletes a user by username. - okay.
app.delete('/users/:Username', (req, res) => {
  Users.findOneAndRemove({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + ' was not found');
      } else {
        res.status(200).send(req.params.Username + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// DELETE. Deletes a movie from a users list of favorite movies. - okay.
app.delete('/users/:Username/movies/:MovieID', (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, 
      { $pull: { FavouriteMovies: req.params.MovieID }
  },
  { new: true }, // this line makes sure that the updated document is returned
  (err, updatedUser) => {
      if (err) {
          console.error(err);
          res.status(500).send('Error: ' + err);
      } else {
          res.json(updatedUser);
      }
  });
});

// READ. Reads documentation. - okay.
app.get('/documentation', (req, res) => {
  res.sendFile('public/documentation.html', { root: __dirname });
});

// Serving Static Files
app.use(express.static('public')); //static file given access via express static

// Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Listen for requests
app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});
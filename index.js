const express = require('express');
const app = express();

const  morgan =require('morgan');
const  bodyParser = require('body-parser');

const mongoose = require('mongoose');
const Models = require('./models.js');

const { check, validationResult, check } =
require('express-validator');

const Movies = Models.Movie;
const Users = Models.User;
const Genres = Models.Genre;

/*
mongoose.connect('mongodb://localhost:27017/newFlixDB', { 
  useNewUrlParser: true,
  useUnifiedTopology: true,
 });
*/

mongoose.connect('process.env.CONNECTION_URI', { 
  useNewUrlParser: true,
  useUnifiedTopology: true,
 });

//log requests to server
app.use(morgan('common'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Cross-Origin Resource Sharing
let allowedOrigins = ['http://localhost:8080', 'http://testsite.com'];
app.use(cors({
  origin: (origin, callback) => {
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){ // If a specific origin isn't found on the list of allowed origins
      let message = "The CORS policy for this application doesn't allow access from origin " + origin;
      return callback(new Error(message ), false);
    }
    return callback(null, true);
  }
}));

let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');

app.get('/', (req, res) => {
  res.send('Welcome to my myFlix website');
});

// READ. Get all movies - okay.
app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
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
app.get('/genres', passport.authenticate('jwt', { session: false }), function (req, res) {
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
app.get('/users', passport.authenticate('jwt', { session: false }), function (req, res) {
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
app.get('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
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
app.get('/movies/:Title', passport.authenticate('jwt', { session: false }), (req, res) => {
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
app.get('/movies/director/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ 'Director.Name': req.params.Name })
    .then((movie) => {
      res.json(movie);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// CREATE. Adds a movie to a users list of favorite movies. - okay.
app.post('/users/:Username/movies/:_ID', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, 
      { $push: { FavouriteMovies: req.params._ID }
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
app.post('/users', [
  check('Username', 'Username is required').isLength({min: 5}),
  check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
  check('Password', 'Password is required').not().isEmpty(),
  check('Email', 'Email does not appear to be valid').isEmail()], (req, res) => {

  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  let hashedPassword = Users.hashPassword(req.body.Password);
  Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + 'already exists');
      } else {
        Users
          .create({
            Username: req.body.Username,
            Password: hashedPassword,
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
app.put('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
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
app.delete('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
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
app.delete('/users/:Username/movies/:_ID', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, 
      { $pull: { FavouriteMovies: req.params._ID }
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
app.get('/documentation', passport.authenticate('jwt', { session: false }), (req, res) => {
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
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log('Listening on Port ' + port);
});
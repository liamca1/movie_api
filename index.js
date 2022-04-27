const express = require('express');
const app = express();

const mongoose = require('mongoose');
const Models = require('./models.js');
const cors = require('cors');

const Movies = Models.Movie;
const Users = Models.User;
// const Genres = Models.Genre;
const port = process.env.PORT || 8080;

const { check, validationResult, param } = require('express-validator');

/*
mongoose.connect('mongodb://localhost:27017/newFlixDB', { 
  useNewUrlParser: true,
  useUnifiedTopology: true,
 });
*/

mongoose.connect(process.env.CONNECTION_URI || "mongodb://localhost:27017/newFlixDB", { useNewUrlParser: true, useUnifiedTopology: true, });

const  morgan =require('morgan'),
  bodyParser = require('body-parser'),
  uuid = require('uuid');

//log requests to server
app.use(morgan('common'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// Cross-Origin Resource Sharing - commented out.
// let allowedOrigins = ['http://localhost:8080', 'http://testsite.com'];
// app.use(cors({
//   origin: (origin, callback) => {
//     if(!origin) return callback(null, true);
//     if(allowedOrigins.indexOf(origin) === -1){ // If a specific origin isn't found on the list of allowed origins
//       let message = "The CORS policy for this application doesn't allow access from origin " + origin;
//       return callback(new Error(message ), false);
//     }
//     return callback(null, true);
//   }
// }));

let auth = require('./auth')(app);
const passport = require('passport');
  require('./passport');

// Serving Static Files
app.use(express.static('public')); //static file given access via express static

//CREATE
app.post('/users',
[
  check('Username', 'Username is required').isLength({ min: 5 }),
  check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
  check('Password', 'Password is required').not().isEmpty(),
  check('Email', 'Email does not appear to be valid').isEmail()
],
(req, res) =>{
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({errors: errors.array() });
  }

    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOne({ Username: req.body.Username })
      .then((users) => {
        if(users){
            return res.status(400).send(req.body.Username + "  Already Exists! ");
        } else {
          Users.create({
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthday: req.body.Birthday,
          })
            .then((users) => {
            res.status(201).json(users);
            })
            .catch((err) => {
                console.error(err);
                res.status(500).send('Error: ' + err);
            });
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error ' + err);
      });
});

// Update User Details
app.put ('/users/:Username', [
  check('Username', 'Username is required').isLength({min: 5}),
  check('Username', 'Username contains non aphanumeric characters - not allowed.').isAlphanumeric(),
  check('Password', 'Password is required').not().isEmpty(),
  check('Email', 'Email does not appear to be valid').isEmail()
],
passport.authenticate('jwt', { session: false}), (req, res) => {
  //check the validation object for errors
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({errors: errors.array() });
  }

  let hashedPassword = Users.hashPassword(req.body.Password);
  Users.findOneAndUpdate({ User: req.params.Username }, {
    $set:
    {
      Username: req.body.Username,
      Password: hashedPassword,
      Email: req.body.Email,
      Birthday: req.body.Birthday,
    }
  },
  { new:true })
  .then((updatedUser) => {
    res.json(updatedUser);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error ' + err);
  });
});

//Create Movie
app.path('/users/:Username/:movies/:MovieID', passport.authenticate('jwt', { session: false}), (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, {
    $push: { FavouriteMovies: req.params.MovieID }
  },
  { new: true }, // This line makes sure that the updated document is returned
  (err, updatedusers) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedusers);
    }
  });
});

//Delete Favourite Movie
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false}), (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username },
    { $pull: { FavouriteMovies: req.params.MovieID }
  },
  { new: true },
  (err, updatedusers) => {
    if (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
    } else {
        res.json(updatedusers);
    }
  });
});

//Delete User
app.delete('/users/:Username', passport.authenticate('jwt', { session: false}), (req, res) => {
  Users.findOneAndRemove({ Username: req.params.Username })
  .then((users) => {
    if (!users) {
      res.status(400).send(req.params.Username + ' was not found.');
    } else {
      res.status(200).send(req.params.Username + ' was deleted.');
    }
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

//Read - Welcome message
app.get('/', (req, res) => {
  res.send('Welcome to my myFlix website - test 123');
});

//Return a list of All movies to the user
app.get('/movies', passport.authenticate('jwt', { session: false}), (req, res) => {
  Movies.find()
  .then((movies) => {
    res.status(201).json(movies);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send("Error: " + err);
  });
});

//Return data about a movie by title
app.get('/movies/:Title', passport.authenticate('jwt', { session: false}), (req, res) => {
  Movies.findOne({ Title: req.params.Title })
  .then((movies) => {
    res.json(movies);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send("Error: " + err);
  });
});

//Return data about a genre (via 'movies' endpoint - not through the 'genres' enpoint)
app.get('/movies/genre/:Name', passport.authenticate('jwt', { session: false}), (req, res) => {
  Movies.findOne({ 'Genre.Name': req.params.Name}) 
  .then((movies) => {
      if(movies){ 
          res.status(200).json(movies.Genre);
      } else {
          res.status(400).send('Genre not found');
      };
  })
  .catch((err) => {
    res.status(500).send('Error: '+ err);
  });
});

//Return data about a director
app.get('/movies/director/:Name', passport.authenticate('jwt', { session: false}), (req, res) => {
  Movies.findOne({ 'Director.Name': req.params.Name}) 
  .then((movies) => {
      if(movies) { 
          res.status(200).json(movies.Director);
      }else {
          res.status(400).send('Director not found');
      };
  })
  .catch((err) => {
    res.status(500).send('Error: '+ err);
  });
});

//Static File  
app.use(express.static('public')); 

//Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack); 
  res.status(500).send('Something broke!');
});

//Listen for request
app.listen(port, '0.0.0.0', () =>{
    console.log('Listening on Port ' + port);
});
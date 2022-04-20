const mongoose = require('mongoose');

let movieSchema = mongoose.Schema({
    _id: {type: String, required: true},
    Title: {type: String, required: true},
    Description: {type: String, required: true},
    Genre: {
        Name: String,
        Description: String
    },
    Director: {
        Name: {type: String},
        Bio: String
    },
    Actors:[String],
    ImagePath: String,
    Featured: Boolean
});

let userSchema = mongoose.Schema({
    Username: {type: String, required: true},
    Password: {type: String, required: true},
    Email: {type: String, required: true},
    Birthday: Date,
    FavouriteMovies: [{ type: mongoose.Schema.Types.ObjectId,ref: 'Movie'}]
});

let genreSchema = mongoose.Schema({
    Name: {type: String, required: true},
    Description: {type: String, required: true},
});

let Movie = mongoose.model('Movie', movieSchema);
let User = mongoose.model('User', userSchema);
let Genre = mongoose.model('Genre', genreSchema);


module.exports.Movie = Movie;
module.exports.User = User;
module.exports.Genre = Genre;
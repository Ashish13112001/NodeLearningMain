const mongoose = require('mongoose');
const validator = require('validator'); //It is 3rd party library user for validation

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please tell us your name"]
    },
    email: {
        type: String,
        required: [true, "Please provide your email"],
        unique: true,
        lowercase: true, //It transform the email in lowercase
        validator: [validator.isEmail, 'Please provide a valid email'] //It is 3rd party library user for validation
    },
    photo: String,
    password: {
        type: String,
        required: [true, "Please provide a password"],
        minlength: 8
    },
    passwordConfirm: {
        type: String,
        required: [true, "Please provide a Confirm password"],
    },
})


const User = mongoose.model('User', userSchema);
module.exports = User;
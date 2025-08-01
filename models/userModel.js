const mongoose = require('mongoose');
const validator = require('validator'); //It is 3rd party library user for validation
const bcrypt = require('bcryptjs');

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
        validate: [validator.isEmail, 'Please provide a valid email'] //It is 3rd party library user for validation
    },
    photo: String,
    password: {
        type: String,
        required: [true, "Please provide a password"],
        minlength: 8,
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, "Please provide a Confirm password"],
        validate: {
            //This only work on Create and SAVE!!!
            validator: function(el) {
                return el === this.password;
            },
            message: 'password are not same!'
        }
    },
    passwordChangedAt: Date     
})


userSchema.pre('save', async function(next){
    //Only run this function if password was actually modified
    if(!this.isModified('password')) return next();

    //Hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);
    //Delete passwordConfirm field
    this.passwordConfirm = undefined;
    next();
});

userSchema.methods.correctPassword = async function(
    candidatepassword,
    userPassword
) {
    return await bcrypt.compare(candidatepassword, userPassword);
}

userSchema.methods.changePasswordAfter = async function(JWTTimestamp){
    if(this.passwordChangedAt){
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime()/1000, 10);
        console.log(changedTimestamp, JWTTimestamp);
        return JWTTimestamp < changedTimestamp;
    }

    //false means NOT changed
    return false;
}

const User = mongoose.model('User', userSchema);
module.exports = User;
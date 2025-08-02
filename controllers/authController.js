const { promisify } = require('node:util')
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('./../utils/appError');
// const { decode } = require('node:punycode');
const sendEmail = require('./../utils/email');


const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    })
}



exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        passwordChangedAt: req.body.passwordChangedAt,
        role: req.body.role
    });

    const token = signToken(newUser._id);

    res.status(201).json({
        status: 'success',
        token,
        data: {
            user: newUser
        }
    });
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    // 1) Check if email and password exit
    if(!email || !password){
        return next(new AppError('please provide email and password', 400));
    }

    // 2) Check if user exists and password is correct
    const user =  await User.findOne({email}).select('+password'); 
    
    if(!user || !(await user.correctPassword(password, user.password))){
        return next(new AppError('Incorrect email or password', 401));
    }
    console.log(user); 
    
    // 3) If everything ok, send token to client

    const token = signToken(user._id);
    res.status(200).json({
        status: 'success',
        token
    });

});


exports.protect = catchAsync(async (req, res, next) => {
    //Only step-1 is from Video-131
    // 1) Getting token and check if it's there
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
    }
    // console.log(token);
    if(!token){
        return next(new AppError('You are not logged in! Please log in to get access',401));
    }
    // 2) Varification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    // 3) Check if user still exist
    const freshUser = await User.findById(decoded.id);
    if(!freshUser){
        return next(new AppError('The user belong to this token does no longer exist.',401));
    }

    // 4) Check if user change password after the token was issued 
    if(await freshUser.changePasswordAfter(decoded.iat)){
        return next(new AppError('User recently changed password! Please log in again',401));
    }

    //GRANT access to protected route
    req.user = freshUser;
    next();
})

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        // roles is array = ['admin', 'lead-guide']
        if(!roles.includes(req.user.role)){
            return next(new AppError('You do not have permission to perform this action', 403))
        }

        next(); 
    }
}


exports.forgetPassword = catchAsync(async(req, res, next) => {
    //Get user based on Posted email
    const user = await User.findOne({email: req.body.email});
    if(!user){
        return next(new AppError('There is no user with email address',404));
    }
    //Genrate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });
    //Send it to user email
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

    const message = `forgot your password? submit the PATCH request with your new password and passwordConfirm to ${resetURL}.\n If you did not forgot your password Please ignore this email`;

    try{
        await sendEmail({
        email: user.email,
        subject: `your password reset token (valid for 10 minutes)`,
        message
    });

    res.status(200).json({
        status: 'success',
        message: 'Token send to mail!'  
    })
    } catch(err) {
        user.createPasswordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false }); 

        return next(new AppError('There was an error sending the email. Try again later!'),500);
    }
    
});
exports.resetPassword = (req, res, next) => {}
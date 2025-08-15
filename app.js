const express = require('express');
const fs = require('fs');
const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const app = express();

console.log(process.env.NODE_ENV);

// Global middleware

// Set security HTTP headers
app.use(helmet());

// Development logging
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev')); 
}

// Limit request from same API
const limiter = rateLimit({
    max: 3,
    windowMs: 60*60*1000,
    message: 'To many requests from this IP, Please try again in an hour'
});
app.use('/api', limiter); 

// Body parser, reading data from body into req.body
app.use(express.json( { limit: '10kb'})); // eski vajah s req.body console m show hora h(need to R&D)

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against xss
app.use(xss());

// Prevent parameter polution (like param -- ?sort=duration&sort=price -- yaha p sort 2 baar alag-2 likha h to problem hogi -- kiyuki mene sort ko , k basis p split kiya h(jo ki string m hota kar sakte h) but ye ek array aaega ab)
app.use(hpp({ whitelist: ['duration', 'ratingsQuantity', 'ratingAverage', 'maxGroupSize', 'difficulty', 'price'] }));

// Serving static files
app.use(express.static(`${__dirname}/public`));


// Random test middleware
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
});
//Routes
// uper wale middleware saare routes k liye chalenge but ye wale only unn routes k liye jo define h
app.use('/api/v1/tours', tourRouter); //mount them into the main application.
app.use('/api/v1/users', userRouter); //mount them into the main application.

app.all('*', (req, res, next) => {
    //MONGODB SECTION
    // res.status(400).json({
    //     status: 'fail',
    //     message : `can't find ${req.originalUrl} on this server!`
    // });

    //PREVIOUS ERROR SECTION
    // const err = new Error(`can't find ${req.originalUrl} on this server!`);
    // err.status = 'fail';
    // err.statusCode = 404;

    next(new AppError(`can't find ${req.originalUrl} on this server!`, 404));
});


app.use(globalErrorHandler);

module.exports = app;
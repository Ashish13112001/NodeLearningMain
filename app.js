const express = require('express');
const fs = require('fs');
const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

const app = express();

console.log(process.env.NODE_ENV);

// Global middleware
app.use(helmet());


if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev')); 
}

const limiter = rateLimit({
    max: 3,
    windowMs: 60*60*1000,
    message: 'To many requests from this IP, Please try again in an hour'
});
app.use('/api', limiter); 

app.use(express.json()); // eski vajah s req.body console m show hora h(need to R&D)
app.use(express.static(`${__dirname}/public`));



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
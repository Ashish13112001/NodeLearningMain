const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name'],
    unique: true,
    trim: true,
    maxlength: [40, 'A tour name mush have less or equall then 40 charactors'],
    minlength: [10, 'A tour name mush have more or equall then 10 charactors'],
    // validate: [validator.isAlpha, 'Tour name must only contains charactors'] //using third party library for checkin validators
  },
  slug: String,
  duration: {
    type: Number,
    required: [true, 'A tour must have a durations']
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'A tour must have a maxGroupSize']
  },
  difficulty: {
    type: String,
    required: [true, 'A tour must have a difficulty'],
    enum: {
      values: ['easy', 'medium', 'difficult'],
      message: 'Difficulty is either: easy, medium, difficult'
  }},
  ratingAverage: {
    type: Number,
    default: 4.5,
    min: [1, 'Rating must be above 1.0'],
    max: [5, 'Rating must be less below 5.0']
  },
  ratingQuantity: {
    type: Number,
    default: 0
  },
  price: {
    type: Number,
    required: [true, 'A tour must have a price']
  },
  priceDiscount: {
    type: Number,
    validate:{
      validator: function(val){
        // this only point to current doc on NEW document creation
      return val < this.price
    },
      message: 'Discount price ({VALUE}) should be below the regular price'
    }
    
    
  },
  summary: {
    type: String,
    trim: true,  //It remove all the whitespaces in beginning and in ending of the string
    required: [true, 'A tour must have a summary']
  },
  description: {
    type: String,
    trim: true
  },
  imageCover: {
    type: String,
    required: [true, 'A tour must have a image']
  },
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false // with this -- In responser we are not sending the createdAt property
  },
  startDates: [Date],
  secretTour: {
    type: Boolean,
    default: false
  }
},{
  toJSON: { virtuals: true},
  toObject: { virtuals: true}
});

//DOCUMENT MIDDLEWARE: run before .save() and .create()
tourSchema.pre('save', function(next) {
  // console.log(this);
  this.slug = slugify(this.name, { lower: true});
  next();
});

// tourSchema.pre('save', function(next) {
//   console.log("will save document...");
//   next();
// })


// tourSchema.post('save', function(doc, next) {
//   console.log(doc);
//   next(); 
// })

tourSchema.virtual('durationWeeks').get(function() {
  return this.duration/7;
});

//QUERY MIDDLEWARE
tourSchema.pre(/^find/, function(next) {
// tourSchema.pre('find', function(next) {
  this.find({ secretTour: {$ne: true}});
  this.start = Date.now();
  next();
});
tourSchema.post(/^find/, function(doc, next) {
  console.log(`Query took -- ${Date.now() - this.start} milliseconds`);
  // console.log(doc);
  next();
});

//AGGREGATION MIDDLEWARE
tourSchema.pre('aggregate', function(next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true} }});
  console.log(' ------------------ ',this.pipeline());
  next();
});

const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
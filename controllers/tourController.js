
const Tour = require('../models/tour.model');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');


//Callback functions || Route Handlers
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingAverage,price';
  req.query.fields = 'name,price,ratingAverge,difficulty'
  next();
}

exports.getAllTours = catchAsync(async (req, res, next) => {
    //Execute the Query
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const tours = await features.query; // At this time query look like query.sort().select().skip().limit()

    res.status(200).json({
      status: 'success',
      result: tours.length,
      data: {
        tours,
      },
    });
});

exports.getTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findById(req.params.id);  // same as Tour.findOne({ _id: req.params.id }) findById() function is short hand of this

    if(!tour){
     return next( new AppError('No tour found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });

});


// const catchAsync = fn => {
//   return (req, res, next) => {
//     fn(req, res, next).catch(next);
//   };
// };

exports.createTour = catchAsync(async(req, res, next) => {

  const newTour = await Tour.create(req.body);
    res.status(200).json({
            status: 'success',
            data: {
                tour: newTour
            }
        });
});

exports.updateTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if(!tour){
     return next( new AppError('No tour found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        tour: tour,
      },
    });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
        const tour = await Tour.findByIdAndDelete(req.params.id);

        if (!tour) {
          return next(new AppError('No tour found with that ID', 404));
        }

        res.status(204).json({
        status: 'success',
        data: null
    });
});

exports.getTourStats = catchAsync(async (req, res, next) => {
    const stats = await Tour.aggregate([
      {
        $match: { ratingAverage: { $lte: 4.5 } }
      },
      {
        $group: {
          _id: { $toUpper: '$difficulty'},
          numTours: { $sum: 1},
          numRating: { $sum: '$ratingsQuantity'},
          avgRating: { $avg: '$ratingAverage'},
          avgPrice: { $avg: '$price'},
          minPrice: { $min: '$price'},
          maxPrice: { $max: '$price'}
        },
      },
      {
        $sort: { avgPrice: 1}
      },
      // {
      //   $match: { _id: { $ne: 'EASY'} }
      // }
    ]);
    res.status(200).json({
      status: 'success',
      data: {
        stats
      },
    });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
    const year = req.params.year * 1; //2021
    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates'
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: { $month: '$startDates'},
          numTourStarts: { $sum: 1 },
          tours: {  $push: '$name'}
        }
      },
      {
        $addFields: { month: '$_id'}
      },
      {
        $project: {
          _id: 0
        }
      },
      {
        $sort: { numTourStarts: -1}
      },
      {
        $limit: 12
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        plan
      },
    });
});
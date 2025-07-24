
const Tour = require('../models/tour.model');
const APIFeatures = require('./../utils/apiFeatures');

//Callback functions || Route Handlers
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingAverage,price';
  req.query.fields = 'name,price,ratingAverge,difficulty'
  next();
}

exports.getAllTours = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);  // same as Tour.findOne({ _id: req.params.id }) findById() function is short hand of this
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};


const catchAsync = fn => {
  fn(req, res, next).catch(err => next(err))
}

exports.createTour = catchAsync(async(req, res, next) => {

  const newTour = await Tour.create(req.body);
    res.status(200).json({
            status: 'success',
            data: {
                tour: newTour
            }
        });
    // try{
    // // const newTour = new Tour({});
    // // newTour.save();

    
    // } catch(err) {
    //     res.status(400).json({
    //         status: 'fail',
    //         message: err
    //     });
    // }
});

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: 'success',
      data: {
        tour: tour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.deleteTour = async (req, res) => {
    try{
        await Tour.findByIdAndDelete(req.params.id);
        res.status(204).json({
        status: 'success',
        data: null
    });
    } catch(err) {
        res.status(400).json({
            status: 'fail',
            message: err
        });
    }
    res.status(204).json({
        status: 'success',
        data: null
    });
}

exports.getTourStats = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(204).json({
        status: 'success',
        data: null
    });
  }
}

exports.getMonthlyPlan = async (req, res) => {
  try {
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
  } catch(err) {
    res.status(204).json({
        status: 'success',
        data: null
    });
  }
}
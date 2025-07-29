
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');

exports.getAllUsers = catchAsync(async (req, res, next) => {
    const users = await User.find(); // At this time query look like query.sort().select().skip().limit()
    
    res.status(200).json({
      status: 'success',
      result: users.length,
      data: {
        users,
      },
    });
});
exports.getUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not define yet'
    });
};
exports.createUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not define yet'
    });
};
exports.updateUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not define yet'
    });
};
exports.deleteUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not define yet'
    });
};
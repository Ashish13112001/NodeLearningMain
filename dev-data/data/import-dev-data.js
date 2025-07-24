const dotenv = require('dotenv');
const mongoose = require('mongoose');
const fs = require('node:fs');
const Tour = require('../../models/tour.model');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE_LOCAL;
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('DB connection successfully!'));


// Read Json file
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8')
);

//Import data into DB
const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('all data successfully loaded...');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

//Delete all data from the collection
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log(' all data deleted successfullly...');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};


//------------------------------------------------
console.log("process argv",process.argv);
console.log("process -- ",process);

if(process.argv[2] === '--import'){
    importData();    
}else if(process.argv[2] === '--delete'){
    deleteData();
}

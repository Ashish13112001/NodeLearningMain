const dotenv = require('dotenv');
const mongoose = require('mongoose');


dotenv.config({ path: './config.env'});
const app = require('./app'); //Ye line dotenv.config({ path: './config.env'}) niche hi likhni h -- because we have to set environment variable first before using app
const DB = process.env.DATABASE_LOCAL;

//When you use localhost, Windows may resolve it to the IPv6 address ::1, but MongoDB usually listens on IPv4 127.0.0.1. Since your MongoDB isn't listening on IPv6, the connection is refused (ECONNREFUSED). Using 127.0.0.1 ensures it connects over IPv4, which works correctly.
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log("DB connection successfully!"));



// console.log(app.get('env'));
// console.log(process.env);


//Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`app running on port: ${port}`);
});


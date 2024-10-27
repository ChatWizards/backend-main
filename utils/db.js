// app.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then((conn) => console.log(conn.connection.host))
  .catch((err) => console.error("Database connection error:", err));

module.exports = mongoose.connection;

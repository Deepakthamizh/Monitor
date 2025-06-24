const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/monitor', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('open', () => {
  console.log("MongoDB connected");
});

db.on('error', () => {
  console.log("Connection Error");
});

module.exports = mongoose;

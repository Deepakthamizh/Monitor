const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://Monitor:mongodb1018@cluster0.vh39a90.mongodb.net/Monitor?retryWrites=true&w=majority', {
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

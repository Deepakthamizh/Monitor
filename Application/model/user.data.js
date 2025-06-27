const mongoose = require('../config/db'); // Import the full mongoose object

const { Schema } = mongoose;

const userSchema = new Schema({
  newTask: {
    type: String,
  },
  description: {
    type: String,
  },
  status: {
    type: String,
    default: "pending",
  },
  userId: {
    type: String,
    required: true
  },
  imagePath: {
    type: String,
    required: false
  },
  zohoId: {
    type: String,
    unique: true,
    sparse: true
  },
  source: {
    type: String,
    enum: ['local', 'zohoCRM'],
    default: 'local'
  },
  premium: {
    type: Boolean, 
    default: false
  }
});

const LoginSchema = new mongoose.Schema({
  name:{
    type: String, 
    required: true
  },
  password:{
    type:String, 
    required:false
  },
  googleId: {
    type: String, 
    required: false
  },
  premium: {
    type: Boolean,
    default: false
  },
  zohoUserId: {
    type: String,
  },
  refreshToken: {
    type: String,
    required: false
}
})

const collection = mongoose.model("Collection1", LoginSchema);

const userModel = mongoose.model('user', userSchema);  // Use mongoose.model

module.exports = {userModel, collection};

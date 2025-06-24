require('dotenv').config();

const express = require('express');
const app = express(); //creating an app instance using express framework

const session = require('express-session');
const passport = require('passport');
require('./auth/passport-config'); // create this file in next step


const {userModel, collection} =require('./model/user.data');
const isAuthenticated = require('./config/authMiddleware.js');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const path = require('path'); //importing path module

//oauth login process

app.use(express.static(__dirname)); //project files are being served
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(cookieParser());

app.use(session({
  secret: process.env.SESSION_SECRET || 'supersecret',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

const authRoutes = require('./routes/authRoutes');
app.use(authRoutes);


const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/'); // make sure uploads folder exists
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.get('/', (req, res) => {
  res.redirect('/login');
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});
 
app.post('/add-task', isAuthenticated, upload.single('image'), async (req, res)=>{
  try {

    const taskName = req.body.newTask;
    const taskDetails = req.body.description;
    const userId = req.cookies.userId; //getting the userId from the stored cookie

    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    const newTask = new userModel({
      newTask: taskName,
      description: taskDetails, 
      userId: userId,
      status: "pending", 
      imagePath: imagePath
    });
    
    const saved = await newTask.save();

    res.status(201).json({
      message: "Task saved to DB", 
      taskId: saved._id,
      imagePath: saved.imagePath
    });
  }catch (error){
    res.status(500).json({error: "Failed to save the task"});
  }
});


app.get('/get-tasks', isAuthenticated, async (req, res)=>{
  try {
    const userId = req.cookies.userId;
    
    const tasks = await userModel.find({ userId });

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({error: "Failed to fetch tasks"});
  }
});

app.delete('/delete-task/:id', isAuthenticated, async(req, res) => {
  try {
    const taskId = req.params.id;
    const userId = req.cookies.userId;

    const task = await userModel.findOne({_id: taskId, userId: userId});
    if (!task) {
      return res.status(403).json({ message: "Invalid Attempt" });
    }

    await userModel.findByIdAndDelete(taskId);
    res.status(200).json({message: "Task deleted from DB"});
  }catch (error) {
    res.status(500).json({error: "Failed to delete task"});
  }
});

app.put('/mark-complete/:id', isAuthenticated, async(req, res) => {
  try {
    const taskId = req.params.id;
    await userModel.findByIdAndUpdate(taskId, {status: "completed"});
    res.status(200).json({message: "Task marked as completed"});
  }catch (error) {
    res.status(500).json({error: "Failed to mark task as completed"});
  }
});

app.put('/mark-dropped/:id', isAuthenticated, async(req, res) => {
  try {
    const taskId = req.params.id;
    const userId = req.cookies.userId;

    const user = await collection. findById(userId)
    if (!user.premium){
      return res.status(403).json ({message: "Invalid access, not a premium user"})
    }

    await userModel.findByIdAndUpdate(taskId, {status: "dropped"});
    res.status(200).json({message: "Task has been dropped :("});
  }catch (error) {
    res.status(500).json({error: "Failed to drop task"});
  }
});

app.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, 'signup.html'));
});

app.get("/home", (req, res) => {
  res.sendFile(path.join(__dirname, '/public/index.html'));
});

app.post("/signup", async (req,res)=>{

  const data={
    name:req.body.name,
    password:req.body.password,
  }

  await new collection(data).save();

  res.redirect('/login');
  
});

app.post("/login", async(req,res) => {
  const { name, password } = req.body;

  const user = await collection.findOne({name});

  if (user && user.password === password){
    res.cookie("userId", user._id.toString(), { httpOnly: true, sameSite: "Strict", secure: true });
    res.cookie("premium", user.premium); //session cookie

    res.json({ success: true, name: user.name, premium: user.premium });
  } else {
    res.json({success: false, message: "Invalid Credentials"});
  }
});

app.put('/mark-pending/:id', isAuthenticated, async (req, res) => {
  try {
    const taskId = req.params.id;

    await userModel.findByIdAndUpdate(taskId, { status: "pending" });
    res.status(200).json({ message: "Task marked as pending again" });
  } catch (error) {
    res.status(500).json({ error: "Failed to undrop task" });
  }
});

// Redirect user to Google
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Callback URL after login
app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login.html' }),
  (req, res) => {
    // Set cookies like your local login
    res.cookie("userId", req.user._id.toString(), { httpOnly: true, sameSite: "Strict", secure: true });
    res.cookie("premium", req.user.premium);
    res.redirect('/home'); // or your dashboard
  }
);

// Optional logout
app.get('/logout', (req, res) => {
  req.logout(err => {
    res.clearCookie("userId");
    res.clearCookie("premium");
    res.redirect('/login');
  });
});


module.exports=app; //exporting the file which creates access for using this file in other files

require('dotenv').config();

const express = require('express');
const app = express(); //creating an app instance using express framework
const cors = require('cors');
const cookieParser = require('cookie-parser'); 
const MongoStore = require("connect-mongo");

const session = require('express-session');
const axios = require('axios');
const passport = require('passport');
require('./auth/passport-config.js'); // create this file in next step


const {userModel, collection} =require('./model/user.data.js');
const isAuthenticated = require('./config/authMiddleware.js');
const multer = require('multer');
const path = require('path'); //importing path module

//oauth login process

app.use(cors({
  origin: 'https://monitor---a-todo-app.web.app',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.use(cookieParser());
app.use(session({
  secret: 'monitorapp@1234', // keep this secret safe
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: 'mongodb+srv://Monitor:mongodb1018@cluster0.vh39a90.mongodb.net/Monitor',
    ttl: 24 * 60 * 60 // = 1 day
  }),
  cookie: {
    httpOnly: true,
    secure: true,           // Required for cross-site cookies (HTTPS)
    sameSite: 'none',       // Required for cross-site cookies
    maxAge: 24 * 60 * 60 * 1000 // 1 day in ms
  }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, 'public'))); //project files are being served


const authRoutes = require('./routes/authRoutes.js');
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

app.get("/check-session", (req, res) => {
  console.log("Session:", req.session);
  res.send("Session check done.");
});


app.get('/', (req, res) => {
  res.send("API Server is running");
});

app.get("/login", (req, res) => {
   res.sendFile(path.join(__dirname, 'login.html'));
});
 
app.post('/add-task', isAuthenticated, upload.single('image'), async (req, res)=>{
  try {

    const taskName = req.body.newTask;
    const taskDetails = req.body.description;
    const userId = req.user?._id || req.session.userId; //getting the userId from the stored cookie

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
    console.log("Session:", req.session);
    console.log("User:", req.user);
  try {
    const userId = req.user?._id || req.session.userId;
    
    const tasks = await userModel.find({ userId });

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({error: "Failed to fetch tasks"});
  }
});

app.delete('/delete-task/:id', isAuthenticated, async(req, res) => {
  try {
    const taskId = req.params.id;
    const userId = req.user?._id || req.session.userId;

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
    await userModel.findByIdAndUpdate(taskId, {status: "Completed"});
    res.status(200).json({message: "Task marked as completed"});
  }catch (error) {
    res.status(500).json({error: "Failed to mark task as completed"});
  }
});

app.put('/mark-dropped/:id', isAuthenticated, async(req, res) => {
  try {
    const taskId = req.params.id;
    const userId = req.user?._id || req.session.userId;

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

  res.redirect('https://monitor---a-todo-app.web.app/login.html');
  
});

app.post("/login", async(req,res) => {
  const { name, password } = req.body;

  const user = await collection.findOne({name});

  if (user && user.password === password) {
    // Store in session
    req.session.userId = user._id.toString();
    req.session.premium = user.premium;

    res.cookie("userId", user._id.toString(), { httpOnly: true, sameSite: "None", secure: true });
    res.cookie("premium", user.premium);

    res.json({ success: true, name: user.name, premium: user.premium });
  } else {
    res.status(401).json({ success: false, message: "Invalid credentials" });
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
  passport.authenticate('google', { failureRedirect: 'https://monitor---a-todo-app.web.app/login.html' }),
  (req, res) => {
    // Set cookies like your local login
    res.cookie("userId", req.user._id.toString(), { httpOnly: true, sameSite: "Strict", secure: true });
    res.cookie("premium", req.user.premium);
    res.redirect('https://monitor---a-todo-app.web.app/index.html'); 
  }
);

//redirecting to zoho login
app.get('/auth/zoho', (req, res) => {
  const clientId = process.env.ZOHO_CLIENT_ID;
  const redirectUri = process.env.ZOHO_REDIRECT_URI;
  const clientSecret = process.env.ZOHO_CLIENT_SECRET;
  const scope = 'ZohoCRM.users.ALL,ZohoCRM.modules.ALL,ZohoCRM.settings.ALL';

  const oauthUrl = `https://accounts.zoho.in/oauth/v2/auth?scope=${scope}&client_id=${clientId}&client_secret=${clientSecret}&response_type=code&access_type=offline&redirect_uri=${redirectUri}`;

  res.redirect(oauthUrl);
});

app.get('/oauth/callback', async (req, res) => {
  console.log("Inside /oauth/callback");
  const code = req.query.code;
  console.log(code);

  try {
    const tokenResponse = await axios.post('https://accounts.zoho.in/oauth/v2/token', null, {
      params: {
        code: code,
        grant_type: 'authorization_code',
        client_id: process.env.ZOHO_CLIENT_ID,
        client_secret: process.env.ZOHO_CLIENT_SECRET,
        redirect_uri: process.env.ZOHO_REDIRECT_URI,
      },
    });

    console.log('Full Zoho Token Response Data:', tokenResponse.data)

    const { access_token, refresh_token, api_domain: apiDomain } = tokenResponse.data;
    req.session.zohoAccessToken = access_token;
    console.log('API Domain received from Zoho:', apiDomain);


    const userResponse = await axios.get(`${apiDomain}/crm/v2/users?type=CurrentUser`, {
      headers: {
        Authorization: `Zoho-oauthtoken ${access_token}`
      }
    });
    console.log('Zoho user response:', userResponse.data);

    const zohoUser = userResponse.data.users[0];
    const email = zohoUser.email;
    const name = zohoUser.first_name;
    const zohoUserId = zohoUser.id;

    let user = await collection.findOne({ name: email });

    if (!user) {
      user = await new collection({ name: email, password: '', premium: false }).save();
    }
    
    user.refreshToken = refresh_token;
    user.zohoUserId = zohoUserId;
    await user.save();
    
    const refreshResponse = await axios.post('https://accounts.zoho.in/oauth/v2/token', null, {
      params: {
        refresh_token: user.refreshToken,
        client_id: process.env.ZOHO_CLIENT_ID,
        client_secret: process.env.ZOHO_CLIENT_SECRET,
        grant_type: 'refresh_token',
      }
    });

    res.cookie("userId", user._id.toString(), { httpOnly: true, sameSite: "Strict" });
    res.cookie("premium", user.premium);

    res.cookie("username", user.name);

    res.redirect('/home');
  } catch (err) {
    console.error('OAuth error:', err.response?.data || err.message);
    res.redirect('/login');
  }
});


//middleware function that ensures the access token is avaliable or not. 

async function ensureZohoAccessToken(req, res, next) {
  try {
    if (!req.session.zohoAccessToken) {
      const userId = req.user?._id || req.session.userId;
      const user = await collection.findById(userId);

      if (!user || !user.refreshToken) {
        return res.status(403).json({ message: "No Zoho refresh token found" });
      }

      const refreshResponse = await axios.post('https://accounts.zoho.in/oauth/v2/token', null, {
        params: {
          refresh_token: user.refreshToken,
          client_id: process.env.ZOHO_CLIENT_ID,
          client_secret: process.env.ZOHO_CLIENT_SECRET,
          grant_type: 'refresh_token',
        }
      });

      const newAccessToken = refreshResponse.data.access_token;
      req.session.zohoAccessToken = newAccessToken;
    }

    next();
  } catch (error) {
    console.error("Error refreshing Zoho token:", error.response?.data || error.message);
    res.status(401).json({ message: "Failed to refresh Zoho access token" });
  }
}


//fetch the tasks from ZOHO CRM and sends that to the frontend as json 

app.get('/fetch-zoho-tasks', ensureZohoAccessToken, async (req, res) => {
  const access_token = req.session.zohoAccessToken;
  const user = await collection.findById(req.session.userId);
  const zohoUserId = user.zohoUserId;
  const userId = req.user?._id || req.session.userId;

  try {
    const response = await axios.get('https://www.zohoapis.in/crm/v2/Tasks', {
      headers: {
        Authorization: `Zoho-oauthtoken ${access_token}`
      },
      params: {
        criteria: `(Owner.id:equals:${zohoUserId})`
      }
    });

    const crmTasks = response.data.data;
    const tasksToSend = [];

    for (const task of crmTasks) {
      const zohoId = task.id;

      const existing = await userModel.findOne({ zohoId });
      if(!existing) {
        const newZohoTask = new userModel({
          newTask: task.Subject || "Untitled",
          description: task.Description || "",
          status: (task.Status?.toLowerCase() === "completed")? "completed" : "pending",
          userId: userId,
          zohoId: zohoId,
          source: "zohoCRM"
        });
        const saved = await newZohoTask.save();

        tasksToSend.push({
          id: saved.zohoId,
          task: saved.newTask,
          description: saved.description,
          category: saved.status
        });
      } else {
        tasksToSend.push({
          id: existing.zohoId,
          task: existing.newTask,
          description: existing.description,
          category: existing.status
        });
      }
    }
    res.json(tasksToSend);
  } catch (error) {
    console.error("Error fetching Zoho tasks:", error.response?.data || error.message);
    res.status(500).json({ message: "Failed to fetch Zoho tasks" });
  }
});

app.post('/mark-complete', isAuthenticated, async (req,res) => {
  const {taskId} = req.body;
  const userId = req.user?._id || req.session.userId;

  try{
    const user = await collection.findById(userId);
    if(!user || !user.refreshToken) {
      return res.status(401).json({success: false, message: 'Unauthorized'});
    }

    const tokenResponse = await axios.post ('https://accounts.zoho.in/oauth/v2/token', null, {
      params: {
        refresh_token: user.refreshToken, 
        client_id: process.env.ZOHO_CLIENT_ID,
        client_secret: process.env.ZOHO_CLIENT_SECRET,
        grant_type: 'refresh_token'
      }
    });

    const accessToken = tokenResponse.data.access_token;

    const updateResponse = await axios.patch (
      'https://www.zohoapis.in/crm/v2/Tasks',
      {
        data: [{id: taskId, Status: "Completed"}]
      },
      {
        headers: {
          Authorization: `Zoho-oauthtoken ${accessToken}`
        }
      }
    );

    await userModel.findOneAndUpdate(
      { zohoId: taskId, userId: userId },
      { $set: {status: "Completed"}}
    );

    res.json({ success: true, data: updateResponse.data});
  } catch (err) {
    console.error("Error updating task in Zoho", err.response?.data || err.message);
    res.status(500).json({success: false, message: 'Zoho failed to update'});
  }
});


app.post('/zoho-webhook', express.json(), async (req, res) => {
  try {
    console.log("Webhook received update:", req.body);

    const taskData = req.body.data[0];
    const zohoTaskId = taskData.id;
    const newStatus = taskData.Status;

    await userModel.findOneAndUpdate(
      { zohoId: zohoTaskId}, 
      {
        status: newStatus?.toLowerCase() === "completed"? "completed" : "pending"
      }
    );
    res.status(200).send("Task Updated.");
  } catch (error) {
    console.error("Error occured during webhook handling:", error);
    res.status(500).send("Error while processing webhook");
  }
});

// Optional logout
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("userId");
    res.clearCookie("premium");
    res.clearCookie("username");
    res.redirect('https://monitor---a-todo-app.web.app/login.html');
  });
});

module.exports=app; //exporting the file which creates access for using this file in other files

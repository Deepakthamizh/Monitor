const app = require('./app'); //importing the app.js file

const db = require('./config/db'); //importing the db.js

const port = process.env.PORT || 5001;

app.listen(port,()=>{
  console.log(`Server listening on port http://localhost:${port}`);
});

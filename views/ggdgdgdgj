const express = require('express');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const connectDB = require('./server/config/db');

const app = express();
const PORT = 5500 || process.env.PORT;

// Connect to Database  
connectDB();
// 665c1b2f8ba49812b4ab8549

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

//middlewares
app.use(express.static('public'));

// set view engine
app.set('view engine', 'ejs');



// Express Session
app.use(
    session({
      secret: 'secret',
      resave: false,
      saveUninitialized: true,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
      }
    })
  );
  
  // Flash Messages
  app.use(flash({ sessionKeyName: 'flashMessage' }));

// app.get('*', checkUser);
app.use('/', require('./server/Route/indexRoute'));
app.use('/', require('./server/Route/adminRoute'));

app.listen(PORT, console.log(`Server running on  ${PORT}`));

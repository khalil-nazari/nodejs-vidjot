const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const session = require('express-session');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('passport');
// const { ensureAuthenticated } = require('/helpers/auth');
const app = express();

/** ***************************** Include/Load External routes ***************************************** */
// Load Ideas Routes
const ideas = require('./routes/ideas');
const users = require('./routes/users');


/** ***************************** Settings and midlebars ***************************************** */
// Passport Config
require('./config/passport')(passport);

// Map global promise - get rid of warning //Connect to Mongoose
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/vidjot-dev', {
        //useMongoClient: true, its depricated
        useNewUrlParser: true
    })
    .then(() => console.log('MongoDB Connected...'))
    .catch(err => console.log(err));

// Set && Add handlebar 
app.engine('handlebars', exphbs({
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

// Body Parser middleware 
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

// Override method midleware 
app.use(methodOverride('_method'));

// Express Session midlewarew 
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

// Passport midleware
app.use(passport.initialize());
app.use(passport.session());

// Flash Connect midleware 
app.use(flash());

// Global variables 
app.use(function(req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
});

// Static folder 
app.use(express.static(path.join(__dirname, 'public')));

/** ***************************** Root Routing ***************************************** */
// Index Route
app.get('/', (req, res) => {
    res.render('index');
});

// About Rout
app.get('/about', (req, res) => {
    res.render('about');
});


/** *****************************  Use External Routes ***************************************** */
// Ideas routes, exported
app.use('/ideas', ideas);
app.use('/users', users);



/** ***************************** Connecting Ports ***************************************** */
// Connection port
const port = 5000;
app.listen(port, () => {
    console.log(`Server is stared on part ${port}`);
});
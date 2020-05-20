var config = require('./config');
var mongoose = require('mongoose');
const emoji = require('node-emoji');
const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const cors = require('cors')

var app = express();

// Server Configurations
app.use(cookieParser());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(cors({
    origin: "http://localhost:8080"
}));
app.use(session({
    secret: 'kanbantReallySecretKey',
    resave: false,
    saveUninitialized: true
}))

// Passport Setup
app.use(passport.initialize());
app.use(passport.session());

// Passport Strategies
const strategies = require('./strategies')(passport);

app.get('/', (req, res, next) => {
    res.send({ status: 'OK', msg: 'Node.js engine is working.' });
    next();
})

// Routes
const router = new express.Router();
router.use("/auth", require("./routes/auth"));
router.use("/user", require('./routes/user'));
app.use(router);


// Database Configurations
mongoose.connect(config.MONGO_DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .catch(err => {
        console.log(`${emoji.get(':x:')} Error connecting to MongoDB.\n${emoji.get(':envelope:')}  Error Message: ${err.message}`);
    })

mongoose.connection.on('connected', res => {
    console.log(`${emoji.get(':heavy_check_mark:')}  MongoDB connection is successfully established.`);
    app.listen(config.PORT, () => {
        console.log(`${emoji.get(':heavy_check_mark:')}  Kanbant listening at ${config.URL}`);
    })
})

mongoose.connection.on('disconnected', res => {
    console.log(`${emoji.get(':warning:')}  MongoDB default connection has been disconnected`)
})

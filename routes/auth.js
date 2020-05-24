const Router = require('express').Router;
const router = new Router();
const { User } = require('../models/User');
const bcrypt = require('bcryptjs');
const passport = require('passport');

// Local Login
router.post('/local', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) { return next(err); } //error exception

        // user will be set to false, if not authenticated
        if (!user) {
            res.status(401).json(info); //info contains the error message
        } else {
            // if user authenticated maintain the session
            req.logIn(user, function () {
                // do whatever here on successful login
                res.status(200).json({ status: true, message: "User login successful" });
            })
        }
    })(req, res, next);
});

router.post('/register', async (req, res, next) => {
    try {
        let { email, password } = req.body;
        let user = new User({ email, password });
        let isExists = await User.findOne({ email });
        if (isExists !== null) {
            res.status(409).json({ status: false, message: "User already exists" });
        } else {
            await user.joiValidate({ email, password }); // Validator
            var salt = await bcrypt.genSaltSync(10);
            var hashedPassword = await bcrypt.hashSync(password, salt);
            user = new User({ email: email, password: hashedPassword });
            var createdUser = await user.save();
            res.status(200).json({ status: true, message: 'User created successfully' });
        }

    } catch (err) {
        res.status(400).json({ status: false, message: err.details[0].message });
    }
})

router.get('/status', async (req, res, next) => {
    if (req.user) {
        res.status(200).json({ status: true, user: req.user.email });
    } else {
        res.status(200).json({ status: false });
        // req.redirect('/login');
    }
})

router.get('/logout', async (req, res) => {
    if (req.user) {
        req.logout();
        res.status(200).json({ status: true, message: 'Unauthorized' })
    } else {
        res.status(500).json({ status: false, message: 'Internal Server Error' })
    }
})

module.exports = router;
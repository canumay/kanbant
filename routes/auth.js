const Router = require('express').Router;
const router = new Router();
const passport = require('passport');
const {isLoggedIn} = require('../middlewares');

// Local Login
router.post('/local', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/auth/secret',
        // failureRedirect: '/auth',
    })(req, res, next);
});
module.exports = router;
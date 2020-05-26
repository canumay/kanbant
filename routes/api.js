const Router = require('express').Router;
const router = new Router();

router.get('/ping', (req, res, next) => {
    res.send('pong');
})
router.use('/auth', require('./auth'));
router.use('/user', require('./user'));

module.exports = router;
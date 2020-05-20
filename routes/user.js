const Router = require('express').Router;
const { User } = require('../models/User');
const bcrypt = require('bcryptjs');
const router = new Router();

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
        res.status(400).json({ status: false, message: err });
    }
})

module.exports = router;
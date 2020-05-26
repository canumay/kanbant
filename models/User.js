const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp');
const Joi = require('joi');

var UserSchema = new mongoose.Schema({
    email: { type: String, required: true },
    password: { type: String, required: true },
    projects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }]
});

// Auto Timestamp for createdAt, updatedAt
UserSchema.plugin(timestamps);

UserSchema.methods.verifyPassword = password => {
    if (this.password === password) {
        return true;
    }
    return false;
}

UserSchema.methods.joiValidate = (obj) => {
    const userSchema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(8).max(30).regex(/[a-zA-Z0-9]{3,30}/).required(),
    })
    return Joi.validate(obj, userSchema);
}

var User = mongoose.model('User', UserSchema);

exports.User = User;

const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp');
const Joi = require('joi');

var TaskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    expireAt: { type: Date, required: false },
    label: { type: String, required: false },
    labelType: { type: String, enum: ['danger', 'warning', 'primary', 'info', 'dark', 'success'], required: false }
});

// Auto Timestamp for createdAt, updatedAt
TaskSchema.plugin(timestamps);

TaskSchema.methods.joiValidate = (obj) => {
    const taskSchema = Joi.object({
        title: Joi.string().min(3).max(60).required(),
        column_id: Joi.string(),
        expireAt: Joi.date(),
        label: Joi.string().min(3).max(15),
        labelType: Joi.string().valid("danger", "warning", "primary", "success", "info", "dark")
    })
    return Joi.validate(obj, taskSchema);
}

var Task = mongoose.model('Task', TaskSchema);

exports.Task = Task;

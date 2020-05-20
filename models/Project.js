const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp');
const Joi = require('joi');

var ProjectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: false },
    columns: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Column' }],
    label: { type: String, required: false },
    labelType: { type: String, enum: ['danger', 'warning', 'primary', 'info', 'dark', 'success'], required: false }
});

// Auto Timestamp for createdAt, updatedAt
ProjectSchema.plugin(timestamps);

ProjectSchema.methods.joiValidate = (obj) => {
    const projectSchema = Joi.object({
        title: Joi.string().min(3).max(60).required(),
        description: Joi.string().min(3).max(280),
        label: Joi.string().min(3).max(15),
        labelType: Joi.string().valid("danger", "warning", "primary", "success", "info", "dark")
    })
    return Joi.validate(obj, projectSchema);
}

var Project = mongoose.model('Project', ProjectSchema);

exports.Project = Project;

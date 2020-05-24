const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp');
const Joi = require('joi');

var ProjectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    columns: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Column' }]
});

// Auto Timestamp for createdAt, updatedAt
ProjectSchema.plugin(timestamps);

ProjectSchema.methods.joiValidate = (obj) => {
    const projectSchema = Joi.object({
        title: Joi.string().min(3).max(60).required()
    })
    return Joi.validate(obj, projectSchema);
}

var Project = mongoose.model('Project', ProjectSchema);

exports.Project = Project;

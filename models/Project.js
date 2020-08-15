const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi)

let ProjectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    accessibleBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

// Auto Timestamp for createdAt, updatedAt
ProjectSchema.plugin(timestamps);

ProjectSchema.methods.joiValidate = (obj) => {
    const projectSchema = Joi.object({
        title: Joi.string().min(3).max(60).required(),
        createdBy: Joi.objectId().required(),
        accessibleBy: Joi.objectId().required()
    })
    return Joi.validate(obj, projectSchema);
}

let Project = mongoose.model('Project', ProjectSchema);

exports.Project = Project;

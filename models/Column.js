const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp');
const Joi = require('joi');

var ColumnSchema = new mongoose.Schema({
    title: { type: String, required: true },
    tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }]
});

// Auto Timestamp for createdAt, updatedAt
ColumnSchema.plugin(timestamps);

ColumnSchema.methods.joiValidate = (obj) => {
    const columnSchema = Joi.object({
        title: Joi.string().min(3).max(60).required(),
        project_id: Joi.string()
    })
    return Joi.validate(obj, columnSchema);
}

var Column = mongoose.model('Column', ColumnSchema);

exports.Column = Column;

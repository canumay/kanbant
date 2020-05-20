const Router = require('express').Router;
const router = new Router();
const { isLoggedIn } = require('../middlewares');
const { User } = require('../models/User');
const { Project } = require('../models/Project');
const { Column } = require('../models/Column');
const { Task } = require('../models/Task');
const mongoose = require('mongoose');

router.post('/createProject', isLoggedIn, async (req, res, next) => {
    try {
        let project = new Project(req.body);
        await project.joiValidate(req.body);
        project = await project.save(req.body);
        await User.findByIdAndUpdate(req.user._id, { "$push": { "projects": project._id } }, { "new": true, "upsert": true });
        res.status(200).send({ status: true, message: 'Project successfully created.' });

    } catch (err) {
        res.status(500).json({ status: false, message: err });
    }
});

router.post('/createColumn', isLoggedIn, async (req, res, next) => {
    try {
        if (req.body.project_id && mongoose.Types.ObjectId.isValid(req.body.project_id)) {
            let column = new Column(req.body);
            column = await column.save(req.body);
            await column.joiValidate(req.body);
            await Project.findByIdAndUpdate(req.body.project_id, { "$push": { "columns": column._id } }, { "new": true, "upsert": true });
            res.status(200).send({ status: true, message: 'Column successfully created.' });
        } else {
            res.status(400).json({ status: false, message: "project_id is undefined or malformed." });
        }
    } catch (err) {
        res.status(500).json({ status: false, message: err });
    }
});


router.post('/createTask', isLoggedIn, async (req, res, next) => {
    try {
        if (req.body.column_id && mongoose.Types.ObjectId.isValid(req.body.column_id)) {
            let task = new Task(req.body);
            await task.joiValidate(req.body);
            task = await task.save(req.body);
            await Column.findByIdAndUpdate(req.body.column_id, { "$push": { "tasks": task._id } }, { "new": true, "upsert": true });
            res.status(200).send({ status: true, message: 'Task successfully created.' });

        } else {
            res.status(400).json({ status: false, message: "column_id is undefined or malformed." });

        }


    } catch (err) {
        res.status(500).json({ status: false, message: err });
    }
});


module.exports = router;
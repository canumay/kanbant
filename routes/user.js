const Router = require('express').Router;
const router = new Router();
const { isLoggedIn } = require('../middlewares');
const { User } = require('../models/User');
const { Project } = require('../models/Project');
const { Column } = require('../models/Column');
const { Task } = require('../models/Task');
const mongoose = require('mongoose');

// Create Projects
router.post('/projects', isLoggedIn, async (req, res, next) => {
    try {
        let project = new Project(req.body); // Create project instance
        await project.joiValidate(req.body);  // Wait for validation
        let user = User.findById(req.user._id); // Check user exists (not necessary because middleware already checked but its more safer.)
        if (user === null) { // If user not exists
            req.logout(); // Terminates session for security.
        } else { // If user exists
            project = await project.save(req.body); // Save project to database
            await User.findByIdAndUpdate(req.user._id, { "$push": { "projects": project._id } }, { "new": true, "upsert": true }); // Save project to user on database
            // TODO: After project is created, automatically create "To-Do", "In-Progress", "Done" columns.
            let todo = await new Column({ "title": "To-Do", "icon": "todo", "project_id": project._id }).save();
            let inprogress = await new Column({ "title": "In Progress", "icon": "inprogress", "project_id": project._id }).save();
            let done = await new Column({ "title": "Done", "icon": "todo", "project_id": project._id }).save();

            await Project.findByIdAndUpdate(project._id, { "$push": { "columns": [todo._id, inprogress._id, done._id] } }, { "upsert": true }); // Add column to project on database
            res.status(200).send({ status: true, message: 'Project successfully created.' });
        }

    } catch (err) {
        res.status(500).json({ status: false, message: err });
    }
});

// Get Projects
router.get('/projects', isLoggedIn, async (req, res, next) => {
    try {
        if (req.query.project_id) { // If user specified project id
            if (mongoose.Types.ObjectId.isValid(req.query.project_id)) { // Check project id is valid
                let project = await Project.findById(req.query.project_id, { __v: 0 }).populate({path: 'columns', populate: {path: 'tasks', model: 'Task'}}).exec(); // Get project and populate columns
                if (project === null) { // If project not found, throw error
                    res.status(404).json({ status: false, message: "Project is not exists." });
                } else { // If project found, send it
                    res.status(200).json({ status: true, result: project });
                }
            } else { // If project is malformed
                res.status(400).json({ status: false, message: "project_id is malformed." });
            }
        } else { // If user didn't specified any project id
            let projects = await Project.find({}, { __v: 0 }); // Get all projects
            res.status(200).send({ status: true, results: projects });
        }
    } catch (err) {
        res.status(500).json({ status: false, message: err }); // If any error occurs
    }
});

// Delete Project
router.delete('/projects', isLoggedIn, async (req, res, next) => {
    try {
        if (req.query.project_id) { // Check user specified project id
            if (mongoose.Types.ObjectId.isValid(req.query.project_id)) { // Check project id is valid
                let deletedProject = await Project.deleteOne({ _id: req.query.project_id });
                if (deletedProject.deletedCount && deletedProject.deletedCount > 0) {
                    res.status(200).json({ status: true, result: deletedProject });
                } else {
                    res.status(500).json({ status: true, result: "Error occurred during delete operation" });
                }
            } else { // If project is malformed
                res.status(400).json({ status: false, message: "project_id is malformed." });
            }
        } else { // If user didn't specified any project id
            res.status(400).send({ status: false, message: "project_id is required." });
        }
    } catch (err) {
        res.status(500).json({ status: false, message: err }); // If any error occurs
    }
});

// Update Project
router.put('/projects', isLoggedIn, async (req, res, next) => {
    try {
        if (req.body.project_id) { // Check user specified project id
            if (mongoose.Types.ObjectId.isValid(req.body.project_id)) { // Check project id is valid
                let project = new Project(req.body);
                await project.joiValidate();
                let user = User.findById(req.user._id); // Check user exists (not necessary because middleware already checked but its more safer.)
                if (user === null) { // If user not exists
                    req.logout(); // Terminates session for security.
                } else { // If user exists
                    let project = await Project.findById(req.body.project_id); // Check project exists or not
                    if (project === null) { // If project is not exists.
                        res.status(404).json({ status: false, message: "Project is not exists." });
                    } else { // If project exists
                        project = await Project.findByIdAndUpdate(req.body.project_id, { $set: req.body }, { new: true });
                        res.status(200).send({ status: true, message: 'Project successfully updated.' });
                    }
                }

            } else { // If project is malformed
                res.status(400).json({ status: false, message: "project_id is malformed." });
            }
        } else { // If user didn't specified any project id
            res.status(400).send({ status: false, message: "project_id is required." });
        }
    } catch (err) {
        res.status(500).json({ status: false, message: err }); // If any error occurs
    }
});


// Create Columns
router.post('/columns', isLoggedIn, async (req, res, next) => {
    try {
        if (req.body.project_id && mongoose.Types.ObjectId.isValid(req.body.project_id)) {
            let column = new Column(req.body); // Create column instance
            await column.joiValidate(req.body); // Wait for validation
            let project = await Project.findById(req.body.project_id); // Check project exists or not
            if (project === null) { // If project is not exists.
                res.status(404).json({ status: false, message: "Project is not exists." });
            } else { // If project exists
                column = await column.save(req.body); // Save column to database
                await Project.findByIdAndUpdate(req.body.project_id, { "$push": { "columns": column._id } }, { "upsert": true }); // Add column to project on database
                res.status(200).send({ status: true, message: 'Column successfully created.' });
            }
        } else {
            res.status(400).json({ status: false, message: "project_id is undefined or malformed." }); // Project id is undefined or malformed
        }
    } catch (err) {
        res.status(500).json({ status: false, message: err }); // If any error occurs
    }
});

// Get Columns
router.get('/columns', isLoggedIn, async (req, res, next) => {
    try {
        if (req.query.column_id) {
            if (mongoose.Types.ObjectId.isValid(req.query.column_id)) {
                let column = await Column.findById(req.query.column_id, { __v: 0 }).populate('tasks').exec();
                if (column === null) {
                    res.status(404).json({ status: false, message: "Column is not exists." });
                } else {
                    res.status(200).json({ status: true, result: column });
                }
            } else {
                res.status(400).json({ status: false, message: "column_id is malformed." });
            }
        } else {
            let columns = await Column.find({}, { __v: 0 });
            res.status(200).send({ status: true, results: columns });
        }
    } catch (err) {
        res.status(500).json({ status: false, message: err }); // If any error occurs
    }
});

// Create Tasks
router.post('/tasks', isLoggedIn, async (req, res, next) => {
    try {
        if (req.body.column_id && mongoose.Types.ObjectId.isValid(req.body.column_id)) {
            let task = new Task(req.body);
            await task.joiValidate(req.body);
            let column = await Column.findById(req.body.column_id);
            if (column === null) {
                res.status(404).json({ status: false, message: "Column is not exists." });
            } else {
                task = await task.save(req.body);
                await Column.findByIdAndUpdate(req.body.column_id, { "$push": { "tasks": task._id } }, { "new": true, "upsert": true });
                res.status(200).send({ status: true, message: 'Task successfully created.' });
            }

        } else {
            res.status(400).json({ status: false, message: "column_id is undefined or malformed." });
        }
    } catch (err) {
        res.status(500).json({ status: false, message: err }); // If any error occurs
    }
});


module.exports = router;
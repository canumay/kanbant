const Router = require('express').Router;
const router = new Router();
const { isLoggedIn } = require('../middlewares');
const { User } = require('../models/User');
const { Project } = require('../models/Project');
const { Column } = require('../models/Column');
const { Task } = require('../models/Task');
const mongoose = require('mongoose');
const limitations = require('../limitations');

// Create Projects
router.post('/projects', isLoggedIn, async (req, res, next) => {
    try {
        let project = new Project(req.body); // Create project instance
        await project.joiValidate(req.body);  // Wait for validation
        if (req.user.projects.length >= limitations.PROJECT_COUNT_PER_USER) {
            res.status(429).json({ status: false, message: `Due to limitations users cannot create more than ${limitations.PROJECT_COUNT_PER_USER} projects.` })
        } else {
            project = await project.save(req.body); // Save project to database
            await User.findByIdAndUpdate(req.user._id, { "$push": { "projects": project._id } }, { "new": true, "upsert": true }); // Save project to user on database
            // TODO: After project is created, automatically create "To-Do", "In-Progress", "Done" columns.
            let todo = await new Column({ "title": "To-Do", "icon": "todo", "project_id": project._id }).save();
            let inprogress = await new Column({ "title": "In Progress", "icon": "inprogress", "project_id": project._id }).save();
            let done = await new Column({ "title": "Done", "icon": "done", "project_id": project._id }).save();
            await Project.findByIdAndUpdate(project._id, { "$push": { "columns": [todo._id, inprogress._id, done._id] } }, { "upsert": true }); // Add column to project on database
            let example_task = await new Task({
                "title": "Example Task",
                "label": "feature",
                "labelType": "info",
                "expireAt": new Date()
            }).save();
            await Column.findByIdAndUpdate(todo._id, { "$push": { "tasks": [example_task._id] } }, { "upsert": true });
            res.status(200).json({ status: true, message: 'Project successfully created.' });
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
                let isProjectAccessibleByUser = req.user.projects.some(project => { return project.equals(req.query.project_id) });
                if (isProjectAccessibleByUser === true) {
                    let project = await Project.findById(req.query.project_id, { __v: 0 }).populate({ path: 'columns', populate: { path: 'tasks', model: 'Task' } }).exec(); // Get project and populate columns
                    if (project === null) { // If project not found, throw error
                        res.status(404).json({ status: false, message: "Project is not exists." });
                    } else { // If project found, send it
                        res.status(200).json({ status: true, result: project });
                    }
                } else {
                    res.status(403).json({ status: false, message: "Can't access that project." });
                }
            } else { // If project is malformed
                res.status(400).json({ status: false, message: "project_id is malformed." });
            }
        } else { // If user didn't specified any project id
            let projects = await User.findById(req.user._id, { projects: 1, _id: 0 }).populate({ path: 'projects', populate: { path: 'columns', populate: { path: 'tasks', model: 'Task' } } }).exec();
            res.status(200).json({ status: true, results: projects['projects'] });
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
                let isProjectAccessibleByUser = req.user.projects.some(project => { return project.equals(req.query.project_id) });
                if (isProjectAccessibleByUser === true) {
                    // Delete project's columns
                    let columns = await Project.findById(req.query.project_id, { columns: 1, _id: 0 });
                    columns['columns'].forEach(async column_id => {
                        // Delete column's tasks.
                        let tasks = await Column.findById(column_id, { tasks: 1, _id: 0 });
                        tasks['tasks'].forEach(async task_id => {
                            await Task.findByIdAndDelete(task_id);
                        });
                        await Column.findByIdAndDelete(column_id);
                    });
                    let deletedProject = await Project.deleteOne({ _id: req.query.project_id });
                    if (deletedProject.deletedCount && deletedProject.deletedCount > 0) {
                        await User.findByIdAndUpdate(req.user._id, { "$pull": { "projects": req.query.project_id } }, { "new": true, "upsert": true });
                        res.status(200).json({ status: true, result: deletedProject });
                    } else {
                        res.status(500).json({ status: true, result: "Error occurred during delete operation" });
                    }
                } else {
                    res.status(403).json({ status: false, message: "Can't access that project." });
                }
            } else { // If project is malformed
                res.status(400).json({ status: false, message: "project_id is malformed." });
            }
        } else { // If user didn't specified any project id
            res.status(400).json({ status: false, message: "project_id is required." });
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
                let isProjectAccessibleByUser = req.user.projects.some(project => { return project.equals(req.body.project_id) });
                if (isProjectAccessibleByUser === true) {
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
                            res.status(200).json({ status: true, message: 'Project successfully updated.' });
                        }
                    }
                } else {
                    res.status(403).json({ status: false, message: "Can't access that project." });
                }

            } else { // If project is malformed
                res.status(400).json({ status: false, message: "project_id is malformed." });
            }
        } else { // If user didn't specified any project id
            res.status(400).json({ status: false, message: "project_id is required." });
        }
    } catch (err) {
        res.status(500).json({ status: false, message: err }); // If any error occurs
    }
});

// Create Columns
router.post('/columns', isLoggedIn, async (req, res, next) => {
    try {
        if (req.body.project_id && mongoose.Types.ObjectId.isValid(req.body.project_id)) {
            let isProjectAccessibleByUser = req.user.projects.some(project => { return project.equals(req.body.project_id) });
            if (isProjectAccessibleByUser === true) {
                let column = new Column(req.body); // Create column instance
                await column.joiValidate(req.body); // Wait for validation
                let project = await Project.findById(req.body.project_id); // Check project exists or not
                if (project === null) { // If project is not exists.
                    res.status(404).json({ status: false, message: "Project is not exists." });
                } else { // If project exists
                    if (project.columns.length >= limitations.COLUMN_COUNT_PER_PROJECT) {
                        res.status(429).json({ status: false, message: `Due to limitations projects cannot contains more than ${limitations.COLUMN_COUNT_PER_PROJECT} columns.` })
                    } else {
                        column = await column.save(req.body); // Save column to database
                        await Project.findByIdAndUpdate(req.body.project_id, { "$push": { "columns": column._id } }, { "upsert": true }); // Add column to project on database
                        res.status(200).json({ status: true, message: 'Column successfully created.' });
                    }
                }
            } else {
                res.status(403).json({ status: false, message: "Can't mutate that project." });
            }
        } else {
            res.status(400).json({ status: false, message: "project_id is undefined or malformed." }); // Project id is undefined or malformed
        }
    } catch (err) {
        res.status(500).json({ status: false, message: err }); // If any error occurs
    }
});

// Update Column
router.put('/columns', isLoggedIn, async (req, res, next) => {
    try {
        if (req.body.column_id) { // Check user specified column id
            if (mongoose.Types.ObjectId.isValid(req.body.column_id)) { // Check column id is valid
                let column = new Column(req.body);
                await column.joiValidate();
                let projects = await User.findById(req.user._id, { projects: 1, _id: 0 }).populate({ path: 'projects', populate: { path: 'columns' } }).exec();
                let isColumnAccessibleByUser = false;
                projects['projects'].forEach(project => {
                    isColumnAccessibleByUser = project['columns'].some(column => { return column.equals(req.body.column_id) });
                })
                if (isColumnAccessibleByUser === true) {
                    column = await Column.findByIdAndUpdate(req.body.column_id, { $set: req.body }, { new: true });
                    res.status(200).json({ status: true, message: 'Column successfully updated.' });
                } else {
                    res.status(403).json({ status: false, message: "Column not exists or cannot be mutated" });
                }

            } else { // If column id is malformed
                res.status(400).json({ status: false, message: "column_id is malformed." });
            }
        } else { // If user didn't specified any column id
            res.status(400).json({ status: false, message: "column_id is required." });
        }
    } catch (err) {
        res.status(500).json({ status: false, message: err }); // If any error occurs
    }
});

// Delete Column
router.delete('/columns', isLoggedIn, async (req, res, next) => {
    try {
        if (req.query.column_id) { // Check user specified task id
            if (req.query.project_id) {
                if (mongoose.Types.ObjectId.isValid(req.query.column_id)) { // Check task id is valid
                    if (mongoose.Types.ObjectId.isValid(req.query.project_id)) {
                        let isProjectAccessibleByUser = req.user.projects.some(project => { return project.equals(req.query.project_id) });
                        if (isProjectAccessibleByUser === true) {
                            let projects = await User.findById(req.user._id, { projects: 1, _id: 0 }).populate({ path: 'projects', populate: { path: 'columns' } }).exec();
                            let isColumnAccessibleByUser = false;
                            projects['projects'].forEach(project => {
                                isColumnAccessibleByUser = project['columns'].some(column => { return column.equals(req.query.column_id) });
                            })
                            if (isColumnAccessibleByUser === true) {
                                // Delete column's tasks.
                                let tasks = await Column.findById(req.query.column_id, { tasks: 1, _id: 0 });
                                tasks['tasks'].forEach(async task_id => {
                                    await Task.findByIdAndDelete(task_id);
                                });
                                let deletedColumn = await Column.deleteOne({ _id: req.query.column_id });
                                if (deletedColumn.deletedCount && deletedColumn.deletedCount > 0) {
                                    await Project.findByIdAndUpdate(req.query.project_id, { "$pull": { "columns": req.query.column_id } }, { "new": true, "upsert": true });
                                    res.status(200).json({ status: true, result: deletedColumn });
                                } else {
                                    res.status(500).json({ status: true, result: "Error occurred during delete operation" });
                                }
                            } else {
                                res.status(403).json({ status: false, message: "Can't mutate that column and its objects." });
                            }
                        }
                        else {
                            res.status(403).json({ status: false, message: "Can't mutate that project and its objects." });
                        }
                    } else {
                        res.status(400).json({ status: false, message: "project_id is malformed." });
                    }
                } else { // If task is malformed
                    res.status(400).json({ status: false, message: "column_id is malformed." });
                }
            } else {
                res.status(400).json({ status: false, message: "project_id is required." });
            }
        } else { // If user didn't specified any task id
            res.status(400).json({ status: false, message: "column_id is required." });
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
                let projects = await User.findById(req.user._id, { projects: 1, _id: 0 }).populate({ path: 'projects', populate: { path: 'columns' } }).exec();
                let isColumnAccessibleByUser = false;
                projects['projects'].forEach(project => {
                    isColumnAccessibleByUser = project['columns'].some(column => { return column.equals(req.query.column_id) });
                })
                if (isColumnAccessibleByUser === true) {
                    let column = await Column.findById(req.query.column_id, { __v: 0 }).populate('tasks').exec();
                    if (column === null) {
                        res.status(404).json({ status: false, message: "Column is not exists." });
                    } else {
                        res.status(200).json({ status: true, result: column });
                    }
                } else {
                    res.status(403).json({ status: false, message: "Can't access that column." });
                }
            } else {
                res.status(400).json({ status: false, message: "column_id is malformed." });
            }
        } else {
            // TODO: Return user's all column, not required yet. Implement later.
            res.status(400).json({ status: false, message: "Please speficify a column_id." });
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
            let projects = await User.findById(req.user._id, { projects: 1, _id: 0 }).populate({ path: 'projects', populate: { path: 'columns' } }).exec();
            let isColumnAccessibleByUser = false;
            projects['projects'].forEach(project => {
                isColumnAccessibleByUser = project['columns'].some(column => { return column.equals(req.body.column_id) });
            })
            if (isColumnAccessibleByUser === true) {
                task = await task.save(req.body);
                await Column.findByIdAndUpdate(req.body.column_id, { "$push": { "tasks": task._id } }, { "new": true, "upsert": true });
                res.status(200).json({ status: true, message: 'Task successfully created.' });
            } else {
                res.status(403).json({ status: false, message: "Column not exists or cannot be mutated" });
            }

        } else {
            res.status(400).json({ status: false, message: "column_id is undefined or malformed." });
        }
    } catch (err) {
        res.status(500).json({ status: false, message: err }); // If any error occurs
    }
});

// Delete Task
router.delete('/tasks', isLoggedIn, async (req, res, next) => {
    try {
        if (req.query.task_id) { // Check user specified task id
            if (req.query.column_id) {
                if (mongoose.Types.ObjectId.isValid(req.query.task_id)) { // Check task id is valid
                    if (mongoose.Types.ObjectId.isValid(req.query.column_id)) {
                        let projects = await User.findById(req.user._id, { projects: 1, _id: 0 }).populate({ path: 'projects', populate: { path: 'columns' } }).exec();
                        let isColumnAccessibleByUser = false;
                        projects['projects'].forEach(project => {
                            isColumnAccessibleByUser = project['columns'].some(column => { return column.equals(req.query.column_id) });
                        })
                        if (isColumnAccessibleByUser === true) {
                            let tasks = await Column.findById(req.query.column_id, { tasks: 1, _id: 0 });
                            let isTaskAccessibleByUser = tasks['tasks'].some(task => { return task.equals(req.query.task_id) });
                            if (isTaskAccessibleByUser === true) {
                                let deletedTask = await Task.deleteOne({ _id: req.query.task_id });
                                if (deletedTask.deletedCount && deletedTask.deletedCount > 0) {
                                    await Column.findByIdAndUpdate(req.query.column_id, { "$pull": { "tasks": req.query.task_id } }, { "new": true, "upsert": true });
                                    res.status(200).json({ status: true, result: deletedTask });
                                } else {
                                    res.status(500).json({ status: true, result: "Error occurred during delete operation" });
                                }
                            } else {
                                res.status(403).json({ status: false, message: "Task not exists or cannot be mutated" });
                            }
                        } else {
                            res.status(403).json({ status: false, message: "Column not exists or cannot be mutated" });
                        }
                    } else {
                        res.status(400).json({ status: false, message: "column_id is malformed." });
                    }
                } else { // If task is malformed
                    res.status(400).json({ status: false, message: "task_id is malformed." });
                }
            } else {
                res.status(400).json({ status: false, message: "column_id is required." });
            }
        } else { // If user didn't specified any task id
            res.status(400).json({ status: false, message: "task_id is required." });
        }
    } catch (err) {
        res.status(500).json({ status: false, message: err }); // If any error occurs
    }
});

// Remove existing task from column
router.post('/removeFromColumn', isLoggedIn, async (req, res, next) => {
    try {
        let { column_id, task_id } = req.body;
        if (column_id && mongoose.Types.ObjectId.isValid(column_id)) {
            if (task_id && mongoose.Types.ObjectId.isValid(task_id)) {
                let projects = await User.findById(req.user._id, { projects: 1, _id: 0 }).populate({ path: 'projects', populate: { path: 'columns' } }).exec();
                let isColumnAccessibleByUser = false;
                projects['projects'].forEach(project => {
                    isColumnAccessibleByUser = project['columns'].some(column => { return column.equals(req.body.column_id) });
                })
                if (isColumnAccessibleByUser === true) {
                    let tasks = await Column.findById(req.body.column_id, { tasks: 1, _id: 0 });
                    let isTaskAccessibleByUser = tasks['tasks'].some(task => { return task.equals(req.body.task_id) });
                    if (isTaskAccessibleByUser === true) {
                        await Column.findByIdAndUpdate(column_id, { "$pull": { "tasks": task_id } }, { "new": true, "upsert": true });
                        res.status(200).json({ status: true, message: 'Task successfully removed from specified column.' })
                    }
                    else {
                        res.status(403).json({ status: false, message: "Task not exists or cannot be mutated" });
                    }
                }
                else {
                    res.status(403).json({ status: false, message: "Column not exists or cannot be mutated" });
                }
            } else {
                res.status(400).json({ status: false, message: 'task_id is not specified or malformed' })
            }
        } else {
            res.status(400).json({ status: false, message: 'column_id is not specified or malformed' })
        }
    } catch (err) {
        res.status(500).json({ status: false, message: err }); // If any error occurs
    }
})

// Add existing task to column
router.post('/addToColumn', isLoggedIn, async (req, res, next) => {
    try {
        let { column_id, task_id } = req.body;
        if (column_id && mongoose.Types.ObjectId.isValid(column_id)) {
            if (task_id && mongoose.Types.ObjectId.isValid(task_id)) {
                let projects = await User.findById(req.user._id, { projects: 1, _id: 0 }).populate({ path: 'projects', populate: { path: 'columns' } }).exec();
                let isColumnAccessibleByUser = false;
                projects['projects'].forEach(project => {
                    isColumnAccessibleByUser = project['columns'].some(column => { return column.equals(req.body.column_id) });
                })
                if (isColumnAccessibleByUser === true) {
                    await Column.findByIdAndUpdate(column_id, { "$push": { "tasks": task_id } }, { "new": true, "upsert": true });
                    res.status(200).json({ status: true, message: 'Task successfully added to specified column.' })
                }
                else {
                    res.status(403).json({ status: false, message: "Column not exists or cannot be mutated" });
                }
            } else {
                res.status(400).json({ status: false, message: 'task_id is not specified or malformed' })
            }
        } else {
            res.status(400).json({ status: false, message: 'column_id is not specified or malformed' })
        }
    } catch (err) {
        res.status(500).json({ status: false, message: err }); // If any error occurs
    }
})


module.exports = router;
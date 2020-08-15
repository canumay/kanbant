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
        let project = new Project({ createdBy: req.user._id, accessibleBy: [req.user._id], ...req.body }); // Create project instance
        await project.joiValidate();  // Wait for validation
        let projectCount = await Project.find({ createdBy: req.user._id }).count();
        if (projectCount >= limitations.PROJECT_COUNT_PER_USER) {
            res.status(429).json({ status: false, message: `Due to limitations users cannot create more than ${limitations.PROJECT_COUNT_PER_USER} projects.` })
        } else {
            createdProject = await project.save(); // Save project to database
            let todo = await new Column({ "title": "To-Do", "icon": "todo", "project": createdProject._id }).save();
            let inprogress = await new Column({ "title": "In Progress", "icon": "inprogress", "project": createdProject._id }).save();
            let done = await new Column({ "title": "Done", "icon": "done", "project": createdProject._id }).save();
            let example_task = await new Task({
                "title": "Example Task",
                "label": "feature",
                "labelType": "info",
                "expireAt": new Date(),
                "column": todo._id
            }).save();
            res.status(200).json({ status: true, message: 'Project successfully created.' });
        }

    } catch (err) {
        if (err.isJoi) {
            res.status(400).json({ status: false, error: err.details[0].message })
        } else {
            res.status(500).json({ status: false, message: err.message });
        }
    }
});

// Get Projects
router.get('/projects', isLoggedIn, async (req, res, next) => {
    try {
        if (req.query.project_id) { // If user specified project id
            if (mongoose.Types.ObjectId.isValid(req.query.project_id)) { // Check project id is valid
                let project = await Project.findOne({ _id: req.query.project_id, accessibleBy: { "$in": req.user._id } });
                if (project !== null) {
                    res.status(200).json({ status: true, result: project });
                } else {
                    res.status(404).json({ status: false, message: "Project is not accessible or not found." });
                }
            } else { // If project is malformed
                res.status(400).json({ status: false, message: "project_id is malformed." });
            }
        } else { // If user didn't specified any project id
            let projects = await Project.find({ accessibleBy: { "$in": req.user._id } });
            res.status(200).json({ status: true, results: projects });
        }
    } catch (err) {
        if (err.isJoi) {
            res.status(400).json({ status: false, error: err.details[0].message })
        } else {
            res.status(500).json({ status: false, message: err.message });
        }
    }
});

// Delete Project
router.delete('/projects', isLoggedIn, async (req, res, next) => {
    try {
        if (req.query.project_id) { // Check user specified project id
            if (mongoose.Types.ObjectId.isValid(req.query.project_id)) { // Check project id is valid
                let isProjectAccessibleByUser = await Project.findOne({ createdBy: req.user._id, _id: req.query.project_id });
                if (isProjectAccessibleByUser !== null) {
                    // Delete tasks
                    let columnsToDelete = await Column.find({ project: req.query.project_id });
                    columnsToDelete.forEach(async column => {
                        deletedTasks = await Task.deleteMany({ column: column._id });
                    })
                    // Delete columns
                    let deletedColumns = await Column.deleteMany({ project: req.query.project_id });

                    // Delete Project
                    let deletedProject = await Project.deleteOne({ _id: req.query.project_id });
                    if (deletedProject.deletedCount && deletedProject.deletedCount > 0) {
                        res.status(200).json({ status: true, message: "Project successfully deleted." });
                    } else {
                        res.status(500).json({ status: true, result: "Error occurred during delete operation" });
                    }
                } else {
                    res.status(403).json({ status: false, message: "You don't have permissions to delete this project." });
                }
            } else { // If project is malformed
                res.status(400).json({ status: false, message: "project_id is malformed." });
            }
        } else { // If user didn't specified any project id
            res.status(400).json({ status: false, message: "project_id is required." });
        }
    } catch (err) {
        if (err.isJoi) {
            res.status(400).json({ status: false, error: err.details[0].message })
        } else {
            res.status(500).json({ status: false, message: err.message });
        }
    }
});

// Update Project
router.put('/projects', isLoggedIn, async (req, res, next) => {
    try {
        if (req.body.project_id) { // Check user specified project id
            if (mongoose.Types.ObjectId.isValid(req.body.project_id)) { // Check project id is valid
                await new Project(req.body).joiValidate();
                let editedProject = await Project.findOneAndUpdate({ createdBy: req.user._id, _id: req.body.project_id }, { $set: req.body }, { new: true });
                if (editedProject !== null) {
                    res.status(200).json({ status: true, message: editedProject });
                } else {
                    res.status(400).json({ status: false, message: "Project not found or you don't have permission to edit the project." })
                }
            } else { // If project is malformed
                res.status(400).json({ status: false, message: "project_id is malformed." });
            }
        } else { // If user didn't specified any project id
            res.status(400).json({ status: false, message: "project_id is required." });
        }
    } catch (err) {
        if (err.isJoi) {
            res.status(400).json({ status: false, error: err.details[0].message })
        } else {
            res.status(500).json({ status: false, message: err.message });
        }
    }
});

// Get Columns
router.get('/columns', isLoggedIn, async (req, res, next) => {
    try {
        if (req.query.project_id) {
            if (mongoose.Types.ObjectId.isValid(req.query.project_id)) {
                let columns = await Column.find({ project: req.query.project_id }).populate('project').exec();
                if (Array.isArray(columns) && columns.length > 0) {
                    let areColumnsAccessibleByUser = false;
                    columns.forEach(column => {
                        areColumnsAccessibleByUser = column['project']['accessibleBy'].some(id => id.equals(req.user._id));
                    })
                    if (areColumnsAccessibleByUser === true) {
                        res.status(200).json({ status: true, result: columns });
                    } else {
                        res.status(500).json({ status: false, message: "Columns cannot accessible by user." })
                    }
                } else {
                    res.status(404).json({ status: false, message: "Columns are not found." });
                }
            } else {
                res.status(400).json({ status: false, message: "project_id is malformed." });
            }
        } else {
            res.status(400).json({ status: false, message: "Please speficify a project_id." });
        }
    } catch (err) {
        if (err.isJoi) {
            res.status(400).json({ status: false, error: err.details[0].message })
        } else {
            res.status(500).json({ status: false, message: err.message });
        }
    }
});

// Create Columns
router.post('/columns', isLoggedIn, async (req, res, next) => {
    try {
        if (req.body.project_id && mongoose.Types.ObjectId.isValid(req.body.project_id)) {
            let isProjectAccessibleByUser = await Project.findOne({ accessibleBy: req.user._id, _id: req.body.project_id });
            if (isProjectAccessibleByUser !== null) {
                let column = new Column({ project: req.body.project_id, ...req.body }); // Create column instance
                await column.joiValidate(); // Wait for validation
                let existColumns = await Column.find({ project: req.body.project_id }).count();
                if (existColumns >= limitations.COLUMN_COUNT_PER_PROJECT) {
                    res.status(429).json({ status: false, message: `Due to limitations projects cannot contains more than ${limitations.COLUMN_COUNT_PER_PROJECT} columns.` })
                } else {
                    column = await column.save(req.body); // Save column to database
                    res.status(200).json({ status: true, message: 'Column successfully created.' });
                }
            } else {
                res.status(403).json({ status: false, message: "Project not found or you don't have permission to create column." });
            }
        } else {
            res.status(400).json({ status: false, message: "project_id is undefined or malformed." }); // Project id is undefined or malformed
        }
    } catch (err) {
        if (err.isJoi) {
            res.status(400).json({ status: false, message: err.details[0].message })
        } else {
            res.status(500).json({ status: false, message: err.message }); // If any error occurs
        }
    }
});

// Update Column
router.put('/columns', isLoggedIn, async (req, res, next) => {
    try {
        if (req.body.column_id) { // Check user specified column id
            if (mongoose.Types.ObjectId.isValid(req.body.column_id)) { // Check column id is valid
                await new Column(req.body).joiValidate();
                let column = await Column.findOne({ _id: req.body.column_id }).populate('project').exec();
                if (column !== null) {
                    let isColumnAccessibleByUser = column['project']['accessibleBy'].some(id => id.equals(req.user._id));
                    if (isColumnAccessibleByUser === true) {
                        let editedColumn = await Column.updateOne({ _id: req.body.column_id }, { $set: req.body })
                        if (editedColumn.nModified > 0) {
                            res.status(200).json({ status: true, message: "Column successfully updated." })
                        } else {
                            res.status(500).json({ status: false, message: "Error occurred updating the column." })
                        }
                    } else {
                        res.status(403).json({ status: false, message: "Column not accessible by user." })
                    }
                } else {
                    res.status(404).json({ status: false, message: "Column not found." })
                }
            } else { // If column id is malformed
                res.status(400).json({ status: false, message: "column_id is malformed." });
            }
        } else { // If user didn't specified any column id
            res.status(400).json({ status: false, message: "column_id is required." });
        }
    } catch (err) {
        if (err.isJoi) {
            res.status(400).json({ status: false, error: err.details[0].message })
        } else {
            res.status(500).json({ status: false, message: err.message });
        }
    }
});

// Delete Column
router.delete('/columns', isLoggedIn, async (req, res, next) => {
    try {
        if (req.query.column_id) { // Check user specified column id
            if (mongoose.Types.ObjectId.isValid(req.query.column_id)) { // Check column id is valid
                let column = await Column.findOne({ _id: req.query.column_id }).populate('project').exec();
                if (column !== null) {
                    let isColumnAccessibleByUser = column['project']['accessibleBy'].some(id => id.equals(req.user._id));
                    if (isColumnAccessibleByUser === true) {
                        let deletedColumn = await Column.deleteOne({ _id: req.query.column_id })
                        if (deletedColumn.deletedCount > 0) {
                            res.status(200).json({ status: true, message: "Column successfully deleted." })
                        } else {
                            res.status(500).json({ status: false, message: "Error occurred deleting the column." })
                        }
                    } else {
                        res.status(403).json({ status: false, message: "Column not accessible by user." })
                    }
                } else {
                    res.status(404).json({ status: false, message: "Column not found." })
                }
            } else { // If column id is malformed
                res.status(400).json({ status: false, message: "column_id is malformed." });
            }
        } else { // If user didn't specified any column id
            res.status(400).json({ status: false, message: "column_id is required." });
        }
    } catch (err) {
        if (err.isJoi) {
            res.status(400).json({ status: false, error: err.details[0].message })
        } else {
            res.status(500).json({ status: false, message: err.message });
        }
    }
});

// Get Tasks
router.get('/tasks', isLoggedIn, async (req, res, next) => {
    try {
        if (req.query.column_id) {
            if (mongoose.Types.ObjectId.isValid(req.query.column_id)) {
                let tasks = await Task.find({ column: req.query.column_id }).populate({ path: 'column', populate: { path: 'project' } }).exec();
                if (Array.isArray(tasks) && tasks.length > 0) {
                    let areTasksAccessibleByUser = false;
                    tasks.forEach(task => {
                        areTasksAccessibleByUser = task['column']['project']['accessibleBy'].some(id => id.equals(req.user._id));
                    })
                    if (areTasksAccessibleByUser === true) {
                        res.status(200).json({ status: true, result: tasks });
                    } else {
                        res.status(500).json({ status: false, message: "Tasks cannot accessible by user." })
                    }
                } else {
                    res.status(404).json({ status: false, message: "Tasks are not found." });
                }
            } else {
                res.status(400).json({ status: false, message: "column_id is malformed." });
            }
        } else {
            res.status(400).json({ status: false, message: "Please speficify a column_id." });
        }
    } catch (err) {
        if (err.isJoi) {
            res.status(400).json({ status: false, error: err.details[0].message })
        } else {
            res.status(500).json({ status: false, message: err.message });
        }
    }
});

// Create Tasks
router.post('/tasks', isLoggedIn, async (req, res, next) => {
    try {
        if (req.body.column_id && mongoose.Types.ObjectId.isValid(req.body.column_id)) {
            let task = new Task({ column: req.body.column_id, ...req.body });
            await task.joiValidate();
            let column = await Column.findOne({ _id: req.body.column_id }).populate('project').exec();
            if (column !== null) {
                isColumnAccessibleByUser = column['project']['accessibleBy'].some(id => id.equals(req.user._id));
                if (isColumnAccessibleByUser === true) {
                    await task.save();
                    res.status(200).json({ status: true, message: "Task successfully created." })
                } else {
                    res.status(403).json({ status: false, message: "Column not accessible by user." })
                }
            } else {
                res.status(404).json({ status: false, message: 'Column not found.' })
            }
        } else {
            res.status(400).json({ status: false, message: "column_id is undefined or malformed." });
        }
    } catch (err) {
        if (err.isJoi) {
            res.status(400).json({ status: false, error: err.details[0].message })
        } else {
            res.status(500).json({ status: false, message: err.message });
        }
    }
});

// Delete Task
router.delete('/tasks', isLoggedIn, async (req, res, next) => {
    try {
        if (req.query.task_id) { // Check user specified task id
            if (mongoose.Types.ObjectId.isValid(req.query.task_id)) { // Check task id is valid
                let task = await Task.findOne({ _id: req.query.task_id }).populate({ path: 'column', populate: { path: 'project' } }).exec();
                if (task !== null) {
                    let isTaskAccessibleByUser = task['column']['project']['accessibleBy'].some(id => id.equals(req.user._id));
                    if (isTaskAccessibleByUser === true) {
                        let deletedTask = await Task.deleteOne({ _id: req.query.task_id })
                        if (deletedTask.deletedCount > 0) {
                            res.status(200).json({ status: true, message: "Task successfully deleted." })
                        } else {
                            res.status(500).json({ status: false, message: "Error occurred deleting the task." })
                        }
                    } else {
                        res.status(403).json({ status: false, message: "Task not accessible by user." })
                    }
                } else {
                    res.status(404).json({ status: false, message: "Task not found." })
                }
            } else { // If task is malformed
                res.status(400).json({ status: false, message: "task_id is malformed." });
            }

        } else { // If user didn't specified any task id
            res.status(400).json({ status: false, message: "task_id is required." });
        }
    } catch (err) {
        if (err.isJoi) {
            res.status(400).json({ status: false, error: err.details[0].message })
        } else {
            res.status(500).json({ status: false, message: err.message });
        }
    }
});

// Update Task
router.put('/tasks', isLoggedIn, async (req, res, next) => {
    try {
        if (req.body.task_id) { // Check user specified task id
            if (mongoose.Types.ObjectId.isValid(req.body.task_id)) { // Check task id is valid
                await new Task(req.body).joiValidate();
                let task = await Task.findOne({ _id: req.body.task_id }).populate({ path: 'column', populate: { path: 'project' } }).exec();
                if (task !== null) {
                    let isTaskAccessibleByUser = task['column']['project']['accessibleBy'].some(id => id.equals(req.user._id));
                    if (isTaskAccessibleByUser === true) {
                        let editedTask = await Task.updateOne({ _id: req.body.task_id }, { $set: req.body })
                        if (editedTask.nModified > 0) {
                            res.status(200).json({ status: true, message: "Task successfully updated." })
                        } else {
                            res.status(500).json({ status: false, message: "Error occurred updating the task." })
                        }
                    } else {
                        res.status(403).json({ status: false, message: "Task not accessible by user." })
                    }
                } else {
                    res.status(404).json({ status: false, message: "Task not found." })
                }
            } else { // If task id is malformed
                res.status(400).json({ status: false, message: "task_id is malformed." });
            }
        } else { // If user didn't specified any task id
            res.status(400).json({ status: false, message: "task_id is required." });
        }
    } catch (err) {
        if (err.isJoi) {
            res.status(400).json({ status: false, error: err.details[0].message })
        } else {
            res.status(500).json({ status: false, message: err.message });
        }
    }
});

module.exports = router;
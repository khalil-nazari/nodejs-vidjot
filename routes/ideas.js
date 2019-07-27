const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { ensureAuthenticated } = require('../helpers/auth');

//Load idea model
require('../models/Idea');
const Idea = mongoose.model('ideas');

// Add Idea Form 
router.get('/add', ensureAuthenticated, (req, res) => {
    res.render('ideas/add');
});

// Edit idea form 
router.get('/edit/:id', ensureAuthenticated, (req, res) => {
    Idea.findOne({
            _id: req.params.id
        })
        .then(idea => {
            if (idea.user != req.user.id) {
                req.flash('error_msg', 'Not Authorized to edit this record.');
                res.redirect('/ideas');
            } else {
                res.render('ideas/edit', {
                    idea: idea
                });
            }

        });
});

// Fetch the data from database and respond to idea/index.handlebars
router.get('/', ensureAuthenticated, (req, res) => { // "/" : means index
    Idea.find({ user: req.user.id })
        .sort({ date: 'desc' })
        .then(ideas => {
            res.render('ideas/index', {
                ideas: ideas
            });
        });
});

// Idea Submit form Process
router.post('/', ensureAuthenticated, (req, res) => {
    let errors = [];
    if (!req.body.title) {
        errors.push({
            text: 'Please add a title.'
        });
    }
    if (!req.body.details) {
        errors.push({
            text: 'Please add some detail.'
        });
    }

    if (errors.length > 0) {
        res.render('ideas/add', {
            errors: errors,
            title: req.body.title,
            details: req.body.details
        });
    } else {
        const newUser = {
            title: req.body.title,
            details: req.body.details,
            user: req.user.id
        }

        //save or insert the data into the database.
        new Idea(newUser)
            .save()
            .then(Idea => {
                req.flash('success_msg', 'Video Idea added successfully');
                res.redirect('/ideas/add'); // TO; indea/index.handlebars
            })
    }
});

// Idea Edit form process
router.put('/:id', ensureAuthenticated, (req, res) => {
    Idea.findOne({
            _id: req.params.id
        })
        .then(idea => {
            //new values 
            idea.title = req.body.title;
            idea.details = req.body.details;
            idea.save()
                .then(idea => {
                    req.flash('success_msg', 'Video idea updated.');
                    res.redirect('/ideas');
                });
        });
});

// Delete idea 
router.delete('/:id', ensureAuthenticated, (req, res) => {
    // Idea.remove() is deprecated.
    Idea.deleteOne({ _id: req.params.id })
        .then(() => {
            req.flash('success_msg', 'Video idea removed.');
            res.redirect('/ideas');
        });
});


// Exports all routers
module.exports = router;
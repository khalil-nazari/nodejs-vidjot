const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { ensureAuthenticated } = require('../helpers/auth');
//for password encryption 
const bcrypt = require('bcryptjs');
const passport = require('passport');

// Load idea model 
require('../models/User');
const User = mongoose.model('users');


/****************************** Page Routing ***************************** */
// User Login Rout 
router.get('/login', (req, res) => {
    res.render('users/login');
});

// User Register Rout 
router.get('/register', (req, res) => {
    res.render('users/register');
});


/****************************** Page Processing ***************************** */
//Login Form process
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/ideas',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

// Register Form process
router.post('/register', (req, res) => {
    let errors = [];

    // Check if feilds are empty 
    if (!req.body.name) {
        errors.push({ text: 'Please add name. ' });
    }
    if (!req.body.email) {
        errors.push({ text: 'Please add email. ' });
    }
    if (!req.body.password) {
        errors.push({ text: 'Please add password. ' });
    }

    // Password validation
    if (req.body.password != req.body.password2) {
        errors.push({ text: 'Passwords doesnt match.' });
    }
    if (req.body.password.length < 5) {
        errors.push({ text: 'Password should be more than 5 characters' });
    }

    // Check errors
    if (errors.length > 0) {
        res.render('users/register', {
            errors: errors,
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            password2: req.body.password2
        });
    } else {
        User.findOne({ email: req.body.email })
            .then(user => {
                if (user) {
                    req.flash('error_msg', 'Email already registered. Please login');
                    res.redirect('/users/login');
                    console.log('Email aready exist.');
                } else {
                    const newUser = new User({
                        name: req.body.name,
                        email: req.body.email,
                        password: req.body.password
                    });

                    //encrypt password using becryptjs
                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(newUser.password, salt, (err, hash) => {
                            if (err) throw err;
                            newUser.password = hash;
                            newUser.save()
                                .then(user => {
                                    req.flash('success_msg', 'You are registered. Please log in.')
                                    res.redirect('/users/login');
                                })
                                .catch(err => {
                                    console.log(err);
                                    return;
                                });
                        })
                    });
                }
            })
    }
});


// Logout User 
router.get('/logout', (req, res) => {
    req.logout();
    req.flash("success_msg", "You are logged out");
    res.redirect('/users/login');
});
// Export Module 
module.exports = router;
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const User = require('../schemas/UserModel');
const {isAlreadyLoggedIn} = require('../configs/auth');

router.get('/login', isAlreadyLoggedIn, (req, res) => {
    res.render ('login');
})

router.get('/register',isAlreadyLoggedIn, (req, res) => {
    console.log(req.body);
    res.render ('register');
})

router.post('/register', (req, res) => {

    const { firstname, lastname, usn, semester,department, email, password, password2 } = req.body;
    let errors = [];
  
    if (!email || !password || !password2 || !firstname || !lastname || !usn || !semester || !department) {
      errors.push({ msg: 'Please enter all fields' });
    }
  
    if (password != password2) {
      errors.push({ msg: 'Passwords do not match' });
    }
  
    if (password.length < 6) {
      errors.push({ msg: 'Password must be at least 6 characters' });
    }
  
    if (errors.length > 0) {
      res.render('register', {
        errors,
        firstname,
            lastname,
            usn,
            semester,
            department,
            password,
            email
      });
    } else {
      User.findOne({ email: email }).then(user => {
        if (user) {
          errors.push({ msg: 'Email already exists' });
          res.render('register', {
            errors,
            firstname,
            lastname,
            usn,
            semester,
            department,
            password,
            email
          });
        } else {
          const newUser = new User({
            firstname,
            lastname,
            usn,
            semester,
            department,
            password,
            email
          });
  
          bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
              if (err) throw err;
              newUser.password = hash;
              newUser
                .save()
                .then(user => {
                  // Flash registerd.
                  req.flash(
                    'success_msg',
                    'You are now registered and can log in'
                  );
                  res.redirect('/users/login');
                })
                .catch(err => console.log(err));
            });
          });
        }
      });
    }
  });



router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'Logged out successfully');
    res.redirect('/users/login');
})

module.exports = router;
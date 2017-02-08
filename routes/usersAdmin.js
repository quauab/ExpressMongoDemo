var express = require('express');
var router = express.Router();
var csrf = require('csurf');
var passport = require('passport');
var Product = require('../models/product');

var csrfProtection = csrf();
router.use(csrfProtection);

router.get('/profile', isLoggedIn, function(req, res, next){    
    var messages = req.flash('error');
    Product.find(function(err, docs){
        var productChunks = [];
        var chunkSize = docs.length;
        for (var i = 0; i < docs.length; i += chunkSize) {
            productChunks.push(docs.slice(i, i + chunkSize));
        }
        res.render('admin/profile', {title: 'Admin', products:productChunks, csrfToken: req.csrfToken(), hasErrors:messages.length > 0,admin:true});
    });
});

router.get('/logout', function(req, res, next){
    req.logout();
    res.redirect('/admin/signin');
});

router.use('/', notLoggedIn, function(req, res, next){
    next();
});

router.get('/signup', function(req, res, next){
    // var messages = req.flash('error');
    // res.render('admin/signup', {title:'Registration', csrfToken: req.csrfToken(),messages:messages, hasErrors: messages.length > 0,admin:true});
    next();
});

router.post('/signup', passport.authenticate('local.signup', {
    successRedirect: '/admin/profile',
    failureRedirect: '/admin/signup',
    failureFlash: true
}));

router.get('/signin', function(req, res, next){
    var messages = req.flash('error');
    res.render('admin/signin', {title:'Sign In', csrfToken: req.csrfToken(),messages:messages, hasErrors: messages.length > 0,admin:true});
});

router.post('/signin', passport.authenticate('local.signin', {
    successRedirect: '/admin/profile',
    failureRedirect: '/admin/signin',
    failureFlash: true
}));

module.exports = router;

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/admin/profile');
}

function notLoggedIn(req, res, next) {
    if (!req.isAuthenticated()) {
        return next();
    }
    res.redirect('/admin/signin');
}
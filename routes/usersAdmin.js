var express = require('express');
var router = express.Router();
var csrf = require('csurf');
var passport = require('passport');
var Product = require('../models/product');

var csrfProtection = csrf();
// router.use(csrfProtection);

router.get('/products', canListProducts, function(req, res){
    var messages = req.flash('error');
    Product.find(function(err, docs){
        var productChunks = [];
        var chunkSize = docs.length;
        for (var i = 0; i < docs.length; i += chunkSize) {
            productChunks.push(docs.slice(i, i + chunkSize));
        }
        res.render('admin/products', {title: 'Admin', products:productChunks, hasErrors:messages.length > 0,admin:true});
    });
});

router.get('/search', canSearch, function(req, res){
    res.render('admin/search',{title:'Search', admin:true, search:false});
});

router.post('/search', function(req, res){    
    var keyword = req.body.keyword;
    var messages = req.flash('error');
    console.log(keyword);
    
    Product.find({ $or: [ { category: { $eq: keyword } }, { title: keyword } ] }, function(err, docs){
        var productChunks = [];
        var chunkSize = docs.length;        
        for (var i = 0; i < docs.length; i += chunkSize) {
            productChunks.push(docs.slice(i, i + chunkSize));
        }        
        switch(docs.length) {
            case 1:
                status = docs.length + ' result';
                break;
                
            default:
                status = docs.length + ' results';
                break;
        }        
        res.render('admin/search', {title:'Search Results', products:productChunks, hasErrors:messages.length > 0, resultStatus:status, admin:true, search:true, hasResults:productChunks.length > 0});
    });
});

router.get('/profile', isLoggedIn, function(req, res, next){    
    res.render('admin/profile', {admin:true});
});

router.get('/logout', function(req, res, next){
    req.logout();
    res.redirect('/admin/signin');
});

router.use('/', notLoggedIn, function(req, res, next){
    next();
});

/*
router.get('/signup', function(req, res, next){
    var messages = req.flash('error');
    res.render('admin/signup', {title:'Registration', csrfToken: req.csrfToken(),messages:messages, hasErrors: messages.length > 0,admin:true});
    next();
});

router.post('/signup', passport.authenticate('local.signup', {
    successRedirect: '/admin/adminprofile',
    failureRedirect: '/admin/adminsignup',
    failureFlash: true
}));*/

router.get('/signin', csrfProtection, function(req, res, next){
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

function canSearch(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/admin/signin');
}

function canListProducts(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/admin/signin');
}

function notLoggedIn(req, res, next) {
    if (!req.isAuthenticated()) {
        return next();
    }
    res.redirect('/admin/signin');
}
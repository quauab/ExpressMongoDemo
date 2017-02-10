var express = require('express');
var router = express.Router();
var csrf = require('csurf');
var Product = require('../models/product');
var passport = require('passport');

var csrfProtection = csrf();
// router.use(csrfProtection);

router.get('/profile', isLoggedIn, function(req, res, next){    
    res.render('admin/profile', {admin:true});
});

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

router.get('/search', canSearch, function(req, res, next){
    res.render('admin/search', {title:'Search', admin:true});
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
        res.render('admin/search', {title:'Search Results', products:productChunks, hasErrors:messages.length > 0, messages:messages, resultStatus:status, admin:true, hasResults:productChunks.length > 0});
    });
});

router.get('/signin', csrfProtection, function(req, res, next){
    var messages = req.flash('error');
    res.render('admin/signin', {title:'Sign In', csrfToken: req.csrfToken(), messages:messages, hasErrors: messages.length > 0, isAdmin:true, admin:true});
});

router.post('/signin', passport.authenticate('local.admin.signin', {
    successRedirect: '/admin/profile',
    failureRedirect: '/admin/signin',
    failureFlash: true
}));

router.get('/logout', function(req, res, next){
    req.logout();
    res.redirect('/admin/signin');
});

module.exports = router;

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated() && req.session.passport.user.toString() == '589dca185e2239186885f637') {
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

function canListProducts(req, res, next) {
    if (req.isAuthenticated() && req.session.passport.user.toString() == '589dca185e2239186885f637') {
        return next();
    }
    res.redirect('/admin/signin');
}

function canSearch(req, res, next) {
    if (req.isAuthenticated() && req.session.passport.user.toString() == '589dca185e2239186885f637') {
        return next();
    }
    res.redirect('/admin/signin');
}
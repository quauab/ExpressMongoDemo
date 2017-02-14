var express = require('express');
var router = express.Router();
var csrf = require('csurf');
var Product = require('../models/product');
var passport = require('passport');

var csrfProtection = csrf();

router.get('/profile', isLoggedIn, csrfProtection, function(req, res, next){    
    const greet = 'Greetings ' + req.user.fname;
    const user = req.user;
    res.render('admin/profile', {admin:true,greeting:greet, user:user});
});

router.get('/products', isLoggedIn, csrfProtection, function(req, res){
    var messages = req.flash('error');
    Product.find(function(err, docs){
        var productChunks = [];
        var chunkSize = docs.length;
        for (var i = 0; i < docs.length; i += chunkSize) {
            productChunks.push(docs.slice(i, i + chunkSize));
        }
        res.render('admin/products', {title: 'Admin', products:productChunks, hasErrors:messages.length > 0,admin:true, csrfToken: req.csrfToken()});
    });
});

router.get('/search', isLoggedIn, csrfProtection, function(req, res, next){
    res.render('admin/search', {title:'Search', admin:true, csrfToken: req.csrfToken()});
});

router.post('/search', csrfProtection, function(req, res){    
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

router.get('/logout', csrfProtection, function(req, res, next){
    req.logout();
    res.redirect('/admin/signin');
});

router.use('/', notLoggedIn, function(req, res, next){
    next();
});

/*
router.get('/signup', csrfProtection, function(req, res, next){		
    var messages = req.flash('error');		
    res.render('admin/signup', {title:'Registration', csrfToken: req.csrfToken(),messages:messages, hasErrors: messages.length > 0, isAdmin:true, admin:true});
});		
		
router.post('/signup', csrfProtection, passport.authenticate('local.admin.signup', {		
    successRedirect: '/admin/profile',		
    failureRedirect: '/admin/signup',		
    failureFlash: true		
}));//*/

router.get('/signin', csrfProtection, function(req, res, next){
    var messages = req.flash('error');
    res.render('admin/signin', {title:'Sign In', csrfToken: req.csrfToken(), messages:messages, hasErrors: messages.length > 0, isAdmin:true, admin:true});
});

router.post('/signin', csrfProtection, passport.authenticate('local.admin.signin', {
    successRedirect: '/admin/profile',
    failureRedirect: '/admin/signin',
    failureFlash: true
}));
 
router.post('/update-product', csrfProtection, function(req, res){
    var photo = req.body.photo,
        title = req.body.title,
        category = req.body.category,
        quantity = req.body.quantity,
        description = req.body.description,
        price = req.body.price,
        id = req.body.productId;
        
    console.log('\n\t\tUpdating product: ' + title);
    console.log('ID: ' + id);
    console.log('Title: ' + title);
    console.log('Category: ' + category);
    console.log('New Quantity: ' + quantity);
    console.log('Description: ' + description);
    console.log('New Price: ' + price);
    console.log('New Image Path: ' + photo);
    res.redirect('/admin/products');
});

router.post('/add-new-product', csrfProtection, function(req, res){
    var photo = req.body.photo,
        title = req.body.title,
        category = req.body.category,
        quantity = req.body.quantity,
        description = req.body.description,
        price = req.body.price;
        
    console.log('\n\t\tAdding product: ' + title);
    console.log('New Title: ' + title);
    console.log('New Category: ' + category);
    console.log('New Quantity: ' + quantity);
    console.log('New Description: ' + description);
    console.log('New Image Path: ' + photo);
    console.log('New Price: ' + price);
    res.redirect('/admin/products');
});

router.delete('/delete-product/:id', csrfProtection, function(req, res){
    var id = req.params.id;
    console.log('Deleting Product Id: ' + id);
    res.redirect('/admin/products');
});

module.exports = router;

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated() && req.user.admin) {
        return next();
    }
    res.redirect('/admin/profile');
}

function notLoggedIn(req, res, next) {
    if (!req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}
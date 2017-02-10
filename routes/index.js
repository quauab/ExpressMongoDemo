var express = require('express');
var router = express.Router();
var Product = require('../models/product');
var Cart = require('../models/cart');

const admins = [
    {name:'quebid@hotmail.com',pwd:'password'}
];

// home page
router.get('/', function(req, res){
	res.render('index',{title:'Home',admin:false});
});

// about page
router.get('/about', function(req, res){
	res.render('about',{title:'About',admin:false});
});

// contact page
router.get('/contact', function(req, res){
	res.render('contact',{title:'Contact',errors:req.validationErrors(),admin:false});
});

// products page
router.get('/products', function(req, res){
    var messages = req.flash('error');
    Product.find(function(err, docs){
        var productChunks = [];
        var chunkSize = docs.length;
        for (var i = 0; i < docs.length; i += chunkSize) {
            productChunks.push(docs.slice(i, i + chunkSize));
        }
        res.render('products', {title: 'Products', products:productChunks, hasErrors:messages.length > 0,admin:false});
    });
});

// categories page
router.get('/products/:category', function(req, res){
    var messages = req.flash('error');
    var category = req.params.category;
    Product.find(function(err, docs){
        var productChunks = [];
        var chunkSize = docs.length;
        for (var i = 0; i < docs.length; i += chunkSize) {
            productChunks.push(docs.slice(i, i + chunkSize));
        }
        res.render('category', {title: 'Categories', products:productChunks, hasErrors:messages.length > 0,category:category,admin:false});
    }).where('category').equals(category);;
});

// contact page form submitted
router.post('/contact', function(req, res){
    req.checkBody('email', 'Enter a valid email address').isEmail();
    req.checkBody('name','Provide your name').isLength({min:1});
    req.checkBody('subject','What\'s the reason for the message?').optional();
    req.checkBody('message','Enter your message').isLength({min:1,max:100});    
    var errors = req.validationErrors();
    if (errors) {
        res.render('contact',{title:'Contact', errors:errors,admin:false});
        return;
    } else {
        res.render('contact',{title:'Contact',errors:undefined,admin:false});
    }
});

router.post('/search-for-item', function(req, res, next){
    var keyword = req.body.keyword;
    var messages = req.flash('error');
    var status = '';
    Product.find({ $or: [ { category: { $eq: keyword } }, { title: keyword } ] },function(err, docs){
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
        res.render('search/search', {title:'Search', products:productChunks, hasErrors:messages.length > 0, resultStatus:status, hasResults:productChunks.length > 0, admin:false});
    });
});

router.get('/add-to-cart/:id', function(req, res, next){
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});    
    Product.findById(productId, function(err, product){
        if (err) {
            return res.redirect('/products');
        }        
        cart.add(product, product.id);
        req.session.cart = cart;
        console.log(req.session.cart);
        res.redirect('/products');
    });
});

// admin login test
router.get('/auth', function(req, res){
     var messages = req.flash('error');
    res.render('admin-login', {title:'Admin Login', hasErrors:messages.length > 0, messages:messages});
});

router.post('/auth', function(req, res){
    var username = req.body.email;
    var pwd = req.body.pwd;
    var index = admins.findIndex(x => (x.name == username));
    
    if (index !== -1) {
        var user = admins[index];
        if (pwd == user.pwd) {
            res.redirect('/admin/signin');
        } else {
            res.redirect('/products');
        }
    } else {
        res.redirect('/');
    }
    
});

module.exports = router;
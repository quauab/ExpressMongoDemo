var express = require('express');
var router = express.Router();
var Product = require('../models/product');
var Cart = require('../models/cart');

// home page
router.get('/', function(req, res){
	res.render('index',{title:'Home'});
});

// about page
router.get('/about', function(req, res){
	res.render('about',{title:'About'});
});

// contact page
router.get('/contact', function(req, res){
	res.render('contact',{title:'Contact',errors:req.validationErrors()});
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
        res.render('products', {title: 'Products', products:productChunks, hasErrors:messages.length > 0});
    });
	// res.render('products',{title:'Products'});
});

// contact page form submitted
router.post('/contact', function(req, res){
    req.checkBody('email', 'Enter a valid email address').isEmail();
    req.checkBody('name','Provide your name').isLength({min:1});
    req.checkBody('subject','What\'s the reason for the message?').optional();
    req.checkBody('message','Enter your message').isLength({min:1,max:100});
    
    var errors = req.validationErrors();
    if (errors) {
        res.render('contact',{title:'Contact', errors:errors});
        return;
    } else {
        res.render('contact',{title:'Contact',errors:undefined});
    }
});

router.post('/search-for-item', function(req, res, next){
    var keyword = req.body.keyword;
    var messages = req.flash('error');
    var status = '';
    Product.find(function(err, docs){
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
        
        res.render('search/search', {title:'Search', products:productChunks,hasErrors:messages.length > 0,resultStatus:status});
    }).where('title').equals(keyword);
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

module.exports = router;
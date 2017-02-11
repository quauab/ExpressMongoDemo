var express = require('express');
var router = express.Router();
var Product = require('../models/product');
var Cart = require('../models/cart');

const admins = [
    {name:'quebid@hotmail.com',pwd:'password'}
];

// home view
router.get('/', function(req, res){
	res.render('index',{title:'Home',admin:false});
});

// about view
router.get('/about', function(req, res){
	res.render('about',{title:'About',admin:false});
});

// contact view
router.get('/contact', function(req, res){
	res.render('contact',{title:'Contact',errors:req.validationErrors(),admin:false});
});

// products view
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

// categories view
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

// contact view form submitted
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

// search view
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

// adds item to shopping cart
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

// shopping cart view
router.get('/shopping-cart', function(req, res, next){
    if (!req.session.cart) {
        return res.render('shop/shopping-cart', {products: null});
    }
    
    var cart = new Cart(req.session.cart);
    res.render('shop/shopping-cart', {products: cart.generateArray(), totalPrice: cart.totalPrice});
});

// checkout view
router.get('/checkout', function(req, res, next){
    if (!req.session.cart) {
        return res.redirect('/shopping-cart');
    }
    
    var cart = new Cart(req.session.cart);
    res.render('shop/checkout', {total:cart.totalPrice});
});

module.exports = router;
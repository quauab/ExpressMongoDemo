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
    Product.findByCategory(category, function(err, docs){
        var productChunks = [];
        var chunkSize = docs.length;
        for (var i = 0; i < docs.length; i += chunkSize) {
            productChunks.push(docs.slice(i, i + chunkSize));
        }
        res.render('category', {title: 'Categories', products:productChunks, hasErrors:messages.length > 0,category:category,admin:false});
    });
});

// price view
router.get('/products/:price', function(req, res){
    var messages = req.flash('error');
    var price = req.params.price;    
    Product.findByPrice(price, function(err, docs){
        var productChunks = [];
        var chunkSize = docs.length;
        for (var i = 0; i < docs.length; i += chunkSize) {
            productChunks.push(docs.slice(i, i + chunkSize));
        }
        res.render('category', {title: 'Prices', products:productChunks, hasErrors:messages.length > 0,price:price,admin:false});
    });
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
    var keyword = req.body.keyword.substring(0,1).toUpperCase() + req.body.keyword.substring(1);
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
    var errMsg = req.flash('error')[0];
    
    res.render('shop/checkout', {total:cart.totalPrice, errMsg: errMsg, noError: !errMsg});
});

router.post('/checkout', function(req, res, next){
    if (!req.session.cart) {
        return res.redirect('/shopping-cart');
    }
    
    var cart = new Cart(req.session.cart);
    
    var stripe = require("stripe")(
      "sk_test_CDlftwDkUdRydMfxSyNnlVkO"
    );

    stripe.charges.create({
      amount: cart.totalPrice * 100,
      currency: "usd",
      source: req.body.stripeToken, // obtained with Stripe.js
      description: "Test charge"
    }, function(err, charge) {
        if (err) {
            req.flash('error', err.message);
            return res.redirect('/checkout');
        }
        req.flash('success', 'Successful charge!');
        req.cart = null;
        res.redirect('/');
    });
});

module.exports = router;
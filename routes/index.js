var express = require('express');
var router = express.Router();
var Product = require('../models/product');

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

module.exports = router;
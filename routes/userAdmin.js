var express = require('express');
var router = express.Router();
var csrf = require('csurf');
var passport = require('passport');

var csrfProtection = csrf();
router.use(csrfProtection);

// Admin page
router.get('/admin', function(req, res){
    res.render('admin/index',{title:'Admin'});
});

module.exports = router;
var express = require('express');
var router = express.Router();

// Admin page
router.get('/admin', function(req, res){
    res.render('admin/admin',{title:'Admin'});
});
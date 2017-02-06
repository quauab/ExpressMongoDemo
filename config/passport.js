var passport = require('passport');
var User = require('../models/user');
var LocalStrategy = require('passport-local').Strategy;

passport.serializeUser(function(user, done){
    done(null, user.id);
});

passport.deserializeUser(function(id, done){
    User.findById(id, function(err, user){
        done(err, user);
    });
});

passport.use('local.signup', new LocalStrategy({
    usernameField: 'username',
    emailField: 'email',
    password: 'password',
    password2: 'password2',
    passReqToCallback: true
}, function(req, email, password, password2, done){
    req.checkBody('email', 'Invalid email').notEmpty().isEmail();
    req.checkBody('password', 'Invalid email').notEmpty().isLength({min:4});
    req.checkBody('password2', 'Passwords don\'t match').notEmpty().equals(password);
    
    var errors = req.validationErrors();
    
    if (errors) {
        var messages = [];
        errors.forEach(function(error){
            messages.push(error.msg);
        });
        return done(null, false, req.flash('error', messages));
    }
    
    User.findOne({'email':email}, function(err, user){
        if (err) {
            return done(err);
        }
        
        if (user) {
            return done(null, false, {message: 'Email is already in use.'});
        }
        
        var newUser = new User();
        newUser.email = email;
        newUser.password = newUser.encryptPassword(password);
        newUser.save(function(err, result){
            if (err) {
                return done(err);
            }
            
            return done(null, newUser);
        });
    });
}));

passport.use('local.signin', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, function(req, username, password, done){
    req.checkBody('username', 'Invalid username').notEmpty();
    req.checkBody('password', 'Invalid email').notEmpty();
    
    var errors = req.validationErrors();
    
    if (errors) {
        var messages = [];
        errors.forEach(function(error){
            messages.push(error.msg);
        });
        return done(null, false, req.flash('error', messages));
    }
    
    User.findOne({'username':username}, function(err, user){
        if (err) {
            return done(err);
        }
        
        if (!user) {
            return done(null, false, {message: 'Invalid email or password.'});
        }
        
        if (!user.validPassword(password)) {
            return done(null, false, {message: 'Invalid email or password.'});
        } 
        
        return done(null, user);
    });
}));
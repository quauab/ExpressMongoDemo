var User = require('../models/user');

var mongoose = require('mongoose');
mongoose.connect('localhost:27017/siteusers');

var users = [
    username: 'rick',
    email: 'ricwalker59@gmail.com',
    password: 'ou812!'
];

var done = 0;
for (var u in users) {
    var user = users[u];
    user.save(function(err, result){
        done++;
        if (done === users.length) {
            exit();
        }
    });
}

function exit() {
    mongoose.disconnect();
}
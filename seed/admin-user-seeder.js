var Admin = require('../models/admin-user');

var mongoose = require('mongoose');
mongoose.connect('localhost:27017/siteadmins');

var admins = [
    username: 'quebid',
    email: 'quebid@hotmail.com',
    password: 'sEver@latt3mpts!'
];

var done = 0;
for (var a in admins) {
    var admin = admins[a];
    admin.save(function(err, result){
        done++;
        if (done === admins.length) {
            exit();
        }
    });
}

function exit() {
    mongoose.disconnect();
}
var Product = require('../models/product');

var mongoose = require('mongoose');
mongoose.connect('localhost:27017/siteshopping');

var products = [
    new Product({
        imagePath:'graphics/products/box.png',
        title: 'Box',
        category: ['container','containers','contain','contains','containing'],
        quantity: 30,
        description: 'Lorem ipsum dolor sit amet tellus nulla pellentesque integer taciti vehicula inceptos. Cras vitae consequat rhoncus.',
        price: 10
    }),
    new Product({
        imagePath:'graphics/products/dragonflies.png',
        title: 'Dragonflies',
        category: ['air freshener','aerosol','air spray','air neutralize','air neutralizer','air neutralizing'],
        quantity: 30,
        description: 'Sit vestibulum adipiscing. Dolor sit a. A duis proin morbi felis per. Egestas platea lorem lacus condimentum proin. Pariatur tortor aenean.',
        price: 12
    }),
    new Product({
        imagePath:'graphics/products/mushrooms.png',
        title: 'Mushrooms',
        category: ['bath','wash','soap','shower','bathroom','bathing room','bathing','washing','showering','bathe'],
        quantity: 30,
        description: 'Per mollis praesent nascetur aliquam. Per mollis praesent nascetur aliquam.',
        price: 15
    })
];

var done = 0;
for (var p in products) {
    var product = products[p];
    product.save(function(err, result){
        done++;
        if (done === products.length) {
            exit();
        }
    });
}

function exit() {
    mongoose.disconnect();
}
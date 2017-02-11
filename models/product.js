var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    imagePath: {type: String, required: true},
    title: {type: String, required: true},
    category: {type: String, required: true},
    quantity: {type: Number, required: true},
    description: {type: String, required: true},
    price: {type: Number, required: true},
});

schema.statics.findByTitle = function(word,cb) {
    return this.find({ title: new RegExp(word, 'i') }, cb);
};

schema.statics.findByCategory = function(word, cb) {
    return this.find({ category: new RegExp(word, 'i') }, cb);
};

schema.statics.findByPrice = function(amount, cb) {
    return this.find({ price: new RegExp(amount, 'i') }, cb);
};

module.exports = mongoose.model('Product', schema);
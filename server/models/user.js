var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var userSchema = mongoose.Schema({
    FirstName: String,
    LastName: String,
    Email: String,
    MobileNumber: String,
    Password: String,
    UserType: String
});

userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.Password);
};

module.exports = mongoose.model('Users', userSchema, 'Users');

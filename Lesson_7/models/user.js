const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bccryptjs = require('bcryptjs');

const userSchema = new Schema({
    email: {type: String},
    fullName: {type: String},
    password: {type: String}
});

//Шифрование пароля
userSchema.pre('save', function(next){
    if(this.isModified('password')){
        const salt = bccryptjs.genSaltSync(15);

        this.password = bccryptjs.hashSync(this.password, salt);
    }
    next();
});

userSchema.methods.validatePassword = function(candidate)
{
    return bccryptjs.compareSync(candidate, this.password);
}


module.exports = mongoose.model('User', userSchema, 'users');
const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')

const UserSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true, 'Please provide name.'],
        minLength: 3,
        maxLength: 50
    },
    email:{
        type: String,
        unique: true,
        required: [true, 'Please provide email.'],
        validate:{
            validator: validator.isEmail,
            message: "Please provide valid email."
        }
    },
    password:{
        type: String,
        required: [true, 'Please provide password.'],
        minLength: 8,
    },
    role:{
        type:String,
        enum: ['admin', 'user'],
        default: 'user',
    }
})

//pre-middleware for every user to salt and hash their password when the user document is created in the db.
UserSchema.pre('save', async function(){
    //If the user is not modifying the password, do not run this pre-middleware. If this pre-middleware runs while updating any other field besides the password, the db will rehash the password and the user's credentials will not work. 
    if(!this.isModified('password')) return
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
})

//Instance method that compares the password the user provided to the password hash in the db. Returns boolean representing if they match or not.
UserSchema.methods.comparePasswords = async function(userSuppliedPass){
    const isMatch = await bcrypt.compare(userSuppliedPass, this.password)
    return isMatch
}

module.exports = mongoose.model('User', UserSchema)
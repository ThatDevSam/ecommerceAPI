const User = require('../models/userModel')
const {StatusCodes} = require('http-status-codes')
const CustomError = require('../errors')
const {attachCookies, userInfoToken} = require('../utils')

const regitser = async(req, res) => {
    const {email, name, password} = req.body
    
    //Check if the email from the user is already being used, if it is return a custom error.
    const emailAlreadyInUse = await User.findOne({email})
    if(emailAlreadyInUse){
        throw new CustomError.BadRequestError('Email is already in use, please choose another.')
    }
    
    //If the email is not already in use, create the user.
    //Only pass these properties to the db, so the user can't manipulate the role property in their request.
    const user = await User.create({name, email, password})

    //Extract user info to be sent back to the client.
    const userInfo = userInfoToken(user)
    //return user info and new token to the client.
    attachCookies({res, user: userInfo})
    res.status(StatusCodes.CREATED).json({user: {userInfo}})
}

const login = async(req, res) => {
    const {email, password} = req.body

    //Check if eamil and password exist, if they are not send back an error.
    if(!email || !password){
        throw new CustomError.BadRequestError('Please provide all necessary fields.')
    }

    //Check if email is found in the db, if it is not send back an error.
    const user = await User.findOne({email})
    if(!user){
        throw new CustomError.UnauthenticatedError('Email or password is incorrect.')
    }

    //Check if user supplied password is correct.
    const correctPass = user.comparePasswords(password)
    if(!correctPass){
        throw new CustomError.UnauthenticatedError('Email or password is incorrect.')
    }

    //Create a cookie, return it and user info to the client.
    const userInfo = userInfoToken(user)
    attachCookies({res, user: userInfo})

    res.status(StatusCodes.OK).json({user: {userInfo}})

}

const logout = async(req, res) => {
    //Set the token value store in the cookie to logout
    res.cookie('token', 'logout',{
        httpOnly: true,
        expires: new Date(Date.now()) //Set the expiration time to the current time so the cookie expires immediately,
    })
    res.status(StatusCodes.OK).json({msg: "User logged out"})
}

module.exports = {
    regitser,
    login, 
    logout,
}
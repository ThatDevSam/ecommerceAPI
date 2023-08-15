const Review = require('../models/reviewModel')
const Product = require('../models/productModel')
const {StatusCodes} = require('http-status-codes')
const CustomError = require('../errors')
const {checkUserPermission} = require('../utils')

const createReview = async(req, res) => {
    const {
        body:{product:productID}, 
        user:{userID}
    } = req

    //Find the product in the db using the product ID.
    const productExists = await Product.findOne({_id:productID})

    //If the product does not exist return an error.
    if(!productExists){
        throw new CustomError.NotFoundError(`No product with id: ${productID}`)
    }

    //This checks if the user has already created a review for the specific product.
    const alreadyCreateReview = await Review.findOne({
        product: productID,
        user: userID
    })

    //If the user has already created a review for the product, return an error.
    if(alreadyCreateReview){
        throw new CustomError.BadRequestError('User has already create a review for this product')
    }

    //Add the user's ID to the body property, so that it can be passed to the Review model.
    req.body.user = req.user.userID
    //Create the review in the db.
    const review = await Review.create(req.body)
    //Return the review to the user. 
    res.status(StatusCodes.CREATED).json({review})
}

//Function that returns all reviews.
const getAllReviews = async(req, res) => {
    const reviews = await Review.find({})
    res.status(StatusCodes.OK).json({reviews, count: reviews.length})
}

//This function takes a productID and finds all reviews associated with that product.
//This method of finding reviews for a single product makes it possible to perform queries on the reviews.
const getAllReviewsForAProduct = async(req, res) => {
    const {id: productID} = req.params
    const reviews = await Review.find({product: productID})
    res.status(StatusCodes.OK).json({reviews, count: reviews.length})
}

//Function that accepts a reviewID and returns the review if it exists.
const getSingleReview = async(req, res) => {
    const{id: reviewID} = req.params

    const review = await Review.findOne({_id: reviewID})

    if(!review){
        throw new CustomError.NotFoundError(`No review with ID: ${reviewID}`)
    }

    res.status(StatusCodes.OK).json({review})
}

//Fucntion that allows the user who created the review to update it.
const updateReview = async(req, res) => {
    const{id: reviewID} = req.params
    const {rating, title, comment} = req.body
    //Find the review in the db.
    const review = await Review.findOne({_id:reviewID})

    //If the review does not exist throw an error.
    if(!review){
        throw new CustomError.NotFoundError(`No review with ID: ${reviewID}`)
    }

    //Check that the user updating the review is the user who created the review.
    checkUserPermission(req.user, review.user)

    //update the review fields with the new content.
    review.rating = rating
    review.title = title
    review.comment = comment

    //If the user has permission, update the review.
    await review.save()

    //return success code to the client.
    res.status(StatusCodes.OK).json({review})
}

//Function that allows the user who created the review, or an admin, to delete it.
const deleteReview = async(req, res) => {
    const{id: reviewID} = req.params

    //Find the review in the db.
    const review = await Review.findOne({_id:reviewID})

    //If the review does not exist throw an error.
    if(!review){
        throw new CustomError.NotFoundError(`No review with ID: ${reviewID}`)
    }

    //Check that the user deleting the review is the user who created the review.
    checkUserPermission(req.user, review.user)

    //If the user has permission, delete the review.
    await review.deleteOne()

    //return success code to the client.
    res.status(StatusCodes.OK).json({msg: 'The review has been deleted.'})
}

module.exports = {
    createReview,
    getAllReviews,
    getSingleReview,
    updateReview,
    deleteReview,
    getAllReviewsForAProduct
}
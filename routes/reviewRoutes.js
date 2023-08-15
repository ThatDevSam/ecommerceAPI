const express = require('express')
const router = express.Router()
const {authenticateUser, authorizeUser} = require('../middleware/authMiddleware.js')
const {
    createReview,
    getAllReviews,
    getSingleReview,
    updateReview,
    deleteReview,
} = require('../controllers/reviewController.js')

router.route('/')
    .get(getAllReviews)
    .post(authenticateUser, createReview)//Only users that have logged in can create a review.

router.route('/:id')
    .get(getSingleReview)
    .patch(authenticateUser, updateReview) //only users that have logged in can change the review.
    .delete(authenticateUser, deleteReview)



module.exports = router
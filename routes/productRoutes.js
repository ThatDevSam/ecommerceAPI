const express = require('express')
const router = express.Router()
const {authenticateUser, authorizeUser} = require('../middleware/authMiddleware.js')
const {
    uploadImage,
    deleteProduct,
    updateProduct,
    getSingleProduct,
    getAllProducts,
    createProduct,
    getFeaturedProducts,
} = require('../controllers/productController.js')
const {getAllReviewsForAProduct} = require('../controllers/reviewController.js')

router.route('/')
    .post([authenticateUser, authorizeUser('admin')], createProduct)
    .get(getAllProducts)

router.route('/featured').get(getFeaturedProducts)

router.route('/uploadImage').post([authenticateUser, authorizeUser('admin')], uploadImage)

router.route('/:id')
    .get(getSingleProduct)
    .patch([authenticateUser, authorizeUser('admin')], updateProduct)
    .delete([authenticateUser, authorizeUser('admin')], deleteProduct)

router.route('/:id/reviews').get(getAllReviewsForAProduct)

module.exports = router

const Product = require('../models/productModel')
const {StatusCodes} = require('http-status-codes')
const CustomError = require('../errors')
const path = require('path')

const createProduct = async(req, res) => {
    req.body.user = req.user.userID
    const product = await Product.create(req.body)
    res.status(StatusCodes.CREATED).json({product})
}

const getAllProducts = async(req, res) => {
    const products = await Product.find({})
    res.status(StatusCodes.OK).json({products, count: products.length})
}

//Function to returned a specified number of featured products.
const getFeaturedProducts = async(req, res) => {
    //This lim parameter is passed from the front end.
    const { lim } = req.query
    
    //Find a limited number of feature products in the db.
    const featuredProducts = await Product.find({featured: true}).limit(lim)

    res.status(StatusCodes.OK).json({featuredProducts})
}

//Function that takes in a product ID and returns the product object if it exists in the db.
const getSingleProduct = async(req, res) => {
    const { id: productID } = req.params
    // Find the product in the db with the matching productID and generate a reviews property on the product model.
    const product = await Product.findOne({_id: productID}).populate('reviews')
    if(!product){
        throw new CustomError.NotFoundError(`No product with id: ${productID}`)
    }
    res.status(StatusCodes.OK).json({ product });
}

const updateProduct = async (req, res) => {
    const { id: productID } = req.params
  
    const product = await Product.findOneAndUpdate(
        { _id:productID},
        req.body,
        {runValidators:true, returnDocument:'after'}
    )
  
    if (!product) {
      throw new CustomError.NotFoundError(`No product with id : ${productID}`)
    }
  
    res.status(StatusCodes.OK).json({ product })
}

const deleteProduct = async(req, res) => {
    const { id: productID } = req.params
    const product = await Product.findOne({ _id: productID })

    if(!product){
        throw new CustomError.NotFoundError(`No product with id: ${productID}`)
    }
    
    //Delete the product from the db.
    await product.deleteOne()

    res.status(StatusCodes.OK).json({msg: `Item with id: ${productID} has been deleted`})
}

const uploadImage = async(req, res) => {
    //req.files holds the files uploaded to the server. If there are none, then throw an error.
    if(!req.files){
        throw new CustomError.BadRequestError('No file uploaded.')
    }

    //Get the image from the files property.
    const productImage = req.files.image

    //Check that the file is an image type.
    if(!productImage.mimetype.startsWith('image')){
        throw new CustomError.BadRequestError('File type not correct.')
    }

    //Image can be a max of one MB.
    const maxSize = 1024 * 1024

    if(productImage.size > maxSize){
        throw new CustomError.BadRequestError('File size can not exceed one megabyte.')
    }

    //Create a path for the new image. Where __dirname is the current directory.
    const imagePath = path.join(__dirname, '../public/uploads/' + `${productImage.name}`)

    //Move the image to the imagepath.
    await productImage.mv(imagePath)
    
    res.status(StatusCodes.OK).json({image: `/uploads/${productImage.name}`})
}

module.exports = {
    uploadImage,
    deleteProduct,
    updateProduct,
    getSingleProduct,
    getAllProducts,
    createProduct,
    getFeaturedProducts,
}
const {Product, Animal, Accessory} = require('../models/productModel')
const {StatusCodes} = require('http-status-codes')
const CustomError = require('../errors')
const path = require('path')

const createProduct = async(req, res) => {
    //get the userID of the user creating the product from the request.user and assign it to the request body.
    req.body.user = req.user.userID

    const {
        itemNumber,
        category,
    } = req.body

    //Check if the product already exists in the db.
    const itemNum = await Product.findOne({itemNumber})

    if(itemNum){
        throw new CustomError.BadRequestError('This item already exists in the database, please update it as necessary.')
    }

    let product

    if(category == "accessory"){
        product = await Accessory.create(req.body)
    } else if (category == 'animal'){
        product = await Animal.create(req.body)
    }

    //Return new product to the user.
    res.status(StatusCodes.CREATED).json({product})
}

const getAllProducts = async(req, res) => {
    const {search, category, freeShipping, onSale, sex, species, sort, price} = req.query
    console.log(category)

    //Initalize the queryObject to an empty object so that if there are no search result an empty object will be submitted to the db. This will return all documents from the db.
    const queryObject = {}

    //Check if these elements are present in the query string, and then add them to the queryObject.
    if (search) {
        queryObject.name = { $regex: search, $options: 'i' };
    }
    if(freeShipping){
        queryObject.freeShipping = true
    }
    //If sale is included in the query string find documents where the salesAmount is greater than 0.
    if(onSale){
        queryObject.salesAmount = {$gt: 0}
    }
    if(category){
        queryObject.category = category
        if(category == 'animal'){
            if(sex){
                queryObject.sex = sex
            }
            if(species){
                queryObject.species = species
            }
        }
    }
    if(price){
        //Create an array of the min and max prices from the dash seperated string.
        priceRange = price.split('-')
        //Find all documents where the price field is greater than or equal to the min and less than or equal to the max.
        queryObject.price = {$gte: priceRange[0], $lte: priceRange[1]}
    }

    //Query the db.
    let result = await Product.find(queryObject)

    //Sort the results of the query.
    if(sort == 'lowest'){
        result = result.sort('price')
    } else if (sort == 'highest'){
        result = result.sort('-price')
    }

    const totalProducts = await Product.countDocuments(queryObject)
    console.log(totalProducts)

    // res.status(StatusCodes.OK).json({products, count: products.length})
    res.status(StatusCodes.OK).json({numOfResults: totalProducts, result})

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

//Function to update a single product and return the new product to the user.
const updateProduct = async (req, res) => {
    const { id: productID } = req.params
  
    const product = await Product.findOneAndUpdate(
        { _id:productID},
        //Update the product with the new values for the field provided in the req.body.
        req.body,
        //Run the input validators for the fields being updated and return the document after the changes have been made.
        {runValidators:true, returnDocument:'after'}
    )
  
    if (!product) {
      throw new CustomError.NotFoundError(`No product with id : ${productID}`)
    }
  
    //Return the updated product to the user.
    res.status(StatusCodes.OK).json({ product })
}

//Function to delete a single product.
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
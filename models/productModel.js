const mongoose = require('mongoose')

const ProductSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true, "Please provide a product name."],
        trim: true,
        maxlength: [100, "Name cannot be more than 100 characters."]
    },
    price:{
        type: Number,
        required: [true, "Please provide a product price."],
        default: 0,
    },
    salesAmount:{
        type: Number, 
        default: 0, 
    },
    description:{
        type: String,
        required: [true, "Please provide a product description."],
        maxlength: [1000, "Description can not be more than 1,000 characters."],
    },
    image:{
        type: String, 
        default: '/uploads/example.jpeg',
    },
    category: {
        type: String, 
        required: [true, 'Please provide product category.'],
        enum: ['animal', 'accessory'],
    },
    featured: {
        type: Boolean, 
        default: false,
    },
    freeShipping: {
        type: Boolean, 
        default: false,
    },
    Inventory: {
        type: Number, 
        required: true,
        default: 15,
    },
    itemNumber: {
        type: Number, 
        required: [true, "Please provide the item number for the product."]
    },
    averageRating: {
        type: Number, 
        default: 0
    },
    numOfReviews: {
        type: Number,
        default: 0
    },
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true, 
    //These objects allow this model to accept mongoose virtuals.
    toJSON:{virtuals:true}, 
    toObject:{virtuals:true}
   }
)

const animalSchema = new mongoose.Schema({
    sex: {
        type: String,
        required: [true, "Please provide the sex of the animal."],
        enum: ['male', 'female'],
    },
    age: {
        type: String,
        required: [true, "Please provide the age of the animal."],
    },
    species: {
        type: String, 
        required: [true, "Please provide the sex of the animal."],
        enum: ['cat', 'dog', 'reptile', 'bird', 'fish']
    },
    classification: {
        type: String,
        required: [true, "Please provide the sex of the animal."],
    }
})

const accessorySchema = new mongoose.Schema({
    weight: {
        type: Number,
        required: [true, "Please provide the weight of the accessory."],
    },
    brand: {
        type: String,
        required: [true, "Please provide the brand of the accessory."]
    }
})

//This virtually, meaning it doesn't live on the db, connects the Products model and Reviews Model. It adds a reviews field to the product model that will be populated with all the reviews associated a single product when the getSingleProduct controller is called.
ProductSchema.virtual('reviews', {
    ref:'Review', //This is the name of the other model that is connecting to this model.
    localField: '_id', //This is the _id field of the Product model
    foreignField: 'product',//This refers to the 'product' field in the Review model. This field is the productID
    justOne:false,
})

//This is a pre-middleware that will run when a product is delete. It will delete all of the reviews for that product. 
ProductSchema.pre('deleteOne', {document: true, query: false}, async function(){
    //Access the ReviewModel and delete every review where the product property is equal to the value in the _id for this document.
    await this.model('Review').deleteMany({ product: this._id });
})

const Product = mongoose.model('Product', ProductSchema)

//These schemas will inherit the fields of the Product schema and define their own.
//These discriminators will enable the server to differentiate between animals and accessories easily.
//In the db they will have either 'Animal' or 'Accessory' in the __t: field.
const Animal = Product.discriminator('Animal', animalSchema)
const Accessory = Product.discriminator('Accessory', accessorySchema)

module.exports = {Product, Animal, Accessory}
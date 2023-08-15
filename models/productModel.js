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
    // company: {
    //     type: String, 
    //     required: [true, 'Please provide product company.'],
    //     enum: {
    //         values:['ikea', 'liddy', 'marcos'],
    //         message: '{VALUE} is not supported.'
    //     },
    // },
    colors: {
        type: [String], 
        default: ['#222'],
        required: true,
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

module.exports = mongoose.model('Product', ProductSchema)
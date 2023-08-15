const { error } = require('console')
const mongoose = require('mongoose')

const ReviewSchema = mongoose.Schema({
    rating:{
        type: Number,
        min: 1,
        max: 5,
        required: [true, 'Please provide a review rating.']
    },
    title:{
        type: String,
        maxLlength: 250,
        trim: true,
        required: [true, 'Please provide a review title.']
    },
    comment:{
        type: String,
        required: [true, 'Please provide a comment.']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    product: {
        type: mongoose.Schema.ObjectId,
        ref: 'Product',
        required: true
    }
 }, 
 { timestamps: true }
)

//This compound index makes it so that only one user can leave one review per product. 
ReviewSchema.index({product:1, user:1}, {unique:true})

//Static schema method for calculating the average rating of a product.
ReviewSchema.statics.calcAvgRating = async function(productID){
    const result = await this.aggregate([
        {$match:{product:productID}},
        {$group:{
            //passing in null here returns the entire list.
            _id:null,
            averageRating:{$avg:'$rating'},
            numOfReviews: {$sum: 1}
        }}
    ])
    try{
        await this.model('Product').findOneAndUpdate({_id:productID}, {
            averageRating: Math.ceil(result[0]?.averageRating || 0),
            numOfReviews: result[0]?.averageRating || 0,
        })
    } catch {
        //It this the correct catch, check the video.
        console.log(error) 
    }
}

ReviewSchema.post('save', async function(){
    console.log('post save')
    await this.constructor.calcAvgRating(this.product)
})

ReviewSchema.post('deleteOne', {document: true, query: false}, async function(){
    console.log('post delete')
    await this.constructor.calcAvgRating(this.product)
})


module.exports = mongoose.model('Review', ReviewSchema)
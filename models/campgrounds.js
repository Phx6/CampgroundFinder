const { string } = require("joi");
const mongoose = require("mongoose")
const Schema = mongoose.Schema;
const Review = require("./review")
//this is to be able to pass json virtual properties to our model
const opts = { toJSON: { virtuals: true } }

const ObjectId = mongoose.Schema.Types.ObjectId


//here we put the image property in a separate schema to be able to add a virtual property
const ImageSchema = new Schema({
    url: String,
    filename: String
})
//that virtual property allow me use the thumbnail property to add the w_300 on the url. so my pictures in edit mode are smaller
ImageSchema.virtual("thumbnail").get(function () {
    return this.url.replace("/upload", "/upload/w_200")
})




const campgroundSchema = new Schema({
    title: String,
    image: [ImageSchema],
    geometry: {
        type: {
            type: String,
            enum: ["Point"],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: ObjectId,
        ref: "User"
    },
    reviews: [
        {
            type: ObjectId, ref: "Review"
        }
    ]
}, opts)
//edit here for what the popup display on location clicm on cluster map
campgroundSchema.virtual("properties.popUpTitle").get(function () {
    return `<strong><a href="/campgrounds/${this._id}">${this.title}</a></strong><p>${this.location}</p>`
})



//this is to make sure every comment on a farm are deleted with that farm
campgroundSchema.post("findOneAndDelete", async function (doc) {
    if (doc) {
        //this says, delete every thing with an id in farm.products
        await Review.deleteMany({
            _id: { $in: doc.reviews }
        })

    }
})



module.exports = mongoose.model("Campground", campgroundSchema)
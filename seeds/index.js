const mongoose = require("mongoose")
const cities = require("./cities")
const Campground = require("../models/campgrounds")
const { places, descriptors } = require("./seedHelper")

mongoose.connect("mongodb://localhost:27017/campground-finder")

    .then(() => {  //check if you succesfully connect to mongodb
        console.log("Mongo Connection Open !")
    })
    .catch(err => {
        console.log("Oh No Mongo Error")
        console.log(err)
    })

const sample = (array) => {
    return array[Math.floor(Math.random() * array.length)]
    //pass in an array and return a random number from it
}


const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 200; i++) {
        const price = Math.floor(Math.random() * 30) + 10
        const random1000 = Math.floor(Math.random() * 1000);
        const camp = new Campground({
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude
                ]
            },
            image: [
                {
                    url: 'https://res.cloudinary.com/campgroundcloudinary/image/upload/v1652889158/Campgrounds/phnbsliadzmwza5p3cum.jpg',
                    filename: 'Campgrounds/phnbsliadzmwza5p3cum'
                }
            ],
            description: "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Neque dolore quasi totam aperiam minus sed hic a eius modi. Unde debitis aut ut inventore minima deleniti facilis quas ad magni.",
            price: price,
            //your use id
            author: "62754306277fc55627ee6492"

        })

        await camp.save()
    }

}
seedDB().then(() => {
    mongoose.connection.close()
})
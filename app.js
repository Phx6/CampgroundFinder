if (process.env.NODE_ENV !== "production") {
    require("dotenv").config()
}



const express = require("express");
const mongoose = require("mongoose")
const path = require("path")
const methodOverride = require("method-override")
const ejs = require("ejs")
const ejsMate = require("ejs-mate")
const Joi = require("joi")
const AppError = require("./utilities/AppError")
const session = require("express-session");
const flash = require("connect-flash")
const passport = require("passport")
const LocalStrategy = require("passport-local")
const User = require("./models/user")
const mongoSanitize = require("express-mongo-sanitize")
const helmet = require("helmet")

const MongoStore = require("connect-mongo")
const secret = process.env.SECRET || "thisisabadsecret"

const campgroundsRoutes = require("./routes/campgrounds")
const reviewsRoutes = require('./routes/reviews')
const authRoutes = require("./routes/auth")

const app = express()

//this is to change from local database to Atlas, wich is a server database
const dbAtlas = process.env.DB_ATLAS || "mongodb://localhost:27017/campground-finder"
//if there a problem, thats the path to the local database
// mongoose.connect("mongodb://localhost:27017/campground-finder")
mongoose.connect(dbAtlas)   //UNCOMMENT BEFORE DEPLOY

    .then(() => {  //check if you succesfully connect to mongodb
        console.log("Mongo Connection Open !")
    })
    .catch(err => {
        console.log("Oh No Mongo Error")
        console.log(err)
    })


const store = MongoStore.create({
    //CHANGE FOR dbAtlas BEFORE DEPLOYING {DONE}
    mongoUrl: dbAtlas,
    secret,
    touchAfter: 24 * 3600//to prevent saving for no reason
})

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
})

const sessionConfig = {
    store,
    //the name is what our cookie will be called. change it to make the hackers job more difficult to hijack session information
    name: "_kesh_15afc",
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        //makes the cookie unaccessible through js. only in html. helps prevent people trying to steal cookies information.
        httpOnly: true,
        //thats to allow cookies to be usable only on https.
        //********** */
        secure: true, //COMMENT WHEN EDITTING/PROGRAMING
        //************ */
        //this is to make the cookie expire in a week (1000 milliseconds in a seconds, 60 sec ina  minute and so on to reach one week in milliseconds)
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    },

}

//always put the session on top of other app.use
app.use(session(sessionConfig))//this one is the actual session
app.use(flash())
// helmet breaking my app for now.. not sure how to fix this so ill wait
app.use(helmet({ crossOriginEmbedderPolicy: false, originAgentCluster: true }))



const scriptSrcUrls = [
    "https://api.mapbox.com/mapbox-gl-js/v2.8.2/mapbox-gl.js",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net/"
];

const styleSrcUrls = [
    'https://api.mapbox.com/mapbox-gl-js/v2.8.2/mapbox-gl.css',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css',
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://font.googleapis.com/",
    "https://use.fontawesome.com/"
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/campgroundcloudinary/",
                "https://images.unsplash.com/"

            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

//this si the passport setup for app.js
app.use(passport.initialize())
//this needs to be used after app.use(session())
app.use(passport.session())
//authenticate is a built in fonction from passport-local-mongoose it is basicly the whole authentificatipn process made for us.
passport.use(new LocalStrategy(User.authenticate()));
//this is the built in put and retrieve from the session functio built in passport
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())


app.use(methodOverride("_method"))
app.use(express.urlencoded({ extended: true }))
app.use(mongoSanitize())





app.engine("ejs", ejsMate)
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))

//gives access to these variables on ALL the routes
app.use((req, res, next) => {

    //this req.user is built in passport. if its null, no one is logged in, if theres someone logged in it will = to its id username and email. Use current user to display or hide things in ejs file.
    res.locals.currentUser = req.user;
    res.locals.success = req.flash("success")
    res.locals.error = req.flash("error")
    next()
})

//this app.use is to tell express to use the public directory that we've linked in our boiler plate !
app.use(express.static(path.join(__dirname, "public")))
app.use("/campgrounds", campgroundsRoutes)
app.use("/campgrounds/:id/reviews", reviewsRoutes)
app.use("/", authRoutes)




app.get("/", (req, res) => {
    res.render("home")
})


app.all("*", (req, res, next) => {
    next(new AppError("Page Not Found", 404))
})
//this will run on any path that doesnt exist above and create an error

app.use((err, req, res, next) => {
    const { status = 500 } = err;
    if (!err.message) err.message = "Something went wrong"
    //the = just make a default value if theres none
    res.status(status).render("error", { err })

})
const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`listening to port ${port}`)
})
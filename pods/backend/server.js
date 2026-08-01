const mongoose = require("mongoose")
const cors = require("cors")
const express = require("express")
require("dotenv").config()
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const multer = require("multer")
const cloudinary = require("cloudinary").v2
const { CloudinaryStorage } = require("multer-storage-cloudinary")
const OpenAI = require("openai")
const key = "$@*#5gf*yre@gutcf&@*#$234ju6"

const app = express()
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || process.env.Open_Api
})

const getLocalChatReply = (message = "") => {
    const text = message.toLowerCase()
    const hasAny = (...words) => words.some((word) => text.includes(word))

    if (hasAny("hi", "hello", "hey")) {
        return "Hi! Ask me about room booking, coworking reservations, wishlist, login, or your account."
    }

    if (hasAny("price", "cost", "rate", "charge", "fees")) {
        return "Prices depend on the room or coworking space you choose. Open the place details page to check the listed price before booking."
    }

    if (hasAny("room type", "standard", "deluxe", "suite", "family")) {
        return "Room options include Standard Room, Deluxe Room, Family Suite, and Premium Suite. Pick one from the Room Type dropdown on the Book Room page."
    }

    if (hasAny("room", "hotel", "book", "booking")) {
        return "To book a room, go to Book Room, enter your name, email, room type, number of rooms, check-in date, and check-out date, then submit."
    }

    if (hasAny("date", "check in", "check-in", "checkout", "check out")) {
        return "Select your check-in and check-out dates in the booking form. Make sure the check-out date is after the check-in date."
    }

    if (hasAny("reservation", "reserve", "cowork", "space", "seat")) {
        return "For coworking reservations, open the coworking space page, choose a place, and send your reservation details."
    }

    if (hasAny("wishlist", "favourite", "favorite", "save")) {
        return "Use the wishlist button on a place to save it. You can view saved places from your wishlist page."
    }

    if (hasAny("login", "sign in", "signin", "register", "signup", "sign up", "account")) {
        return "Use the account page to log in or create a new account. After login, you can manage reservations and wishlist items."
    }

    if (hasAny("cancel", "delete", "remove")) {
        return "To cancel or remove something, open the related booking, reservation, or wishlist item and use the available remove option."
    }

    if (hasAny("contact", "support", "help")) {
        return "Tell me what you need help with: room booking, coworking reservations, wishlist, login, or account support."
    }

    return "I did not fully understand that. Please ask about booking a room, reserving a coworking space, wishlist, login, prices, or dates."
}

app.use(cors({
    origin: [
        "https://cafefinder-u2me.onrender.com",
        "https://cafe-finder-amber.vercel.app",
        "http://localhost:3000"
    ]
}))
app.use(express.json())

const port = process.env.PORT || 9000
const mongoUri = process.env.MONGODB_URI

async function startServer() {
    if (!mongoUri) {
        console.error("MongoDB connection failed: MONGODB_URI is not set in .env")
        process.exitCode = 1
        return
    }

    try {
        await mongoose.connect(mongoUri)
        console.log("connected to MongoDB")

        app.listen(port, () => {
            console.log(`connected to the server on port ${port}`)
        })
    }
    catch (error) {
        console.error("MongoDB connection failed:", error.message)
        process.exitCode = 1
    }
}

startServer()

const register = mongoose.Schema({
    Name: String,
    Email: String,
    Password: String,
    UserType: String
})

const user = mongoose.model("Users", register)

app.post("/api/register", async (req, res) => {
    const hash = bcrypt.hashSync(req.body.pass, 10)
    const result = new user({
        Name: req.body.name,
        Email: req.body.email,
        Password: hash,
        UserType: "User"
    })
    if (result) {
        const response = await result.save()
        if (response) {
            res.send({ statuscode: 1 })
        }
        else {
            res.send({ statuscode: 0 })
        }
    }
})

app.get("/api/getusers", async (req, res) => {
    const result = await user.find()
    if (result) {
        res.send({ statuscode: 1, data: result })
    }
    else {
        res.send({ statuscode: 0 })
    }
})

app.delete("/api/removeuser/:id", async (req, res) => {
    const result = await user.deleteOne({ _id: req.params.id })
    if (result.deletedCount > 0) {
        res.send({ statuscode: 1 })
    }
    else {
        res.send({ statuscode: 0 })
    }
})

app.post("/api/login", async (req, res) => {

    const result = await user.findOne({ Email: req.body.email })
    const respass = result.Password
    const pass2 = bcrypt.compareSync(req.body.pass, respass)
    if (pass2 === true) {
        let token = jwt.sign({ id: result._id, mail: result.Email, usrtype: result.UserType }, key, { expiresIn: "1h" })
        res.send({ statuscode: 1, data: result, jwtoken: token })
    }
    else {
        res.send({ statuscode: 0 })
    }
})

cloudinary.config({
    cloud_name: process.env.Cloud_name,
    api_key: process.env.Api_key,
    api_secret: process.env.Secret_key
})

const myStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "WorkWave",
        allowed_formats: ["jpg", "png", "jpeg", "webp", "avif"]
    }
})

const upload = multer({ storage: myStorage })

//types

const category = mongoose.Schema({
    Type: String,
    Img: String
})

const cate = mongoose.model("Category", category)

app.post("/api/category", upload.single("pic"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send({ statuscode: 0, message: "image is required" })
        }
        const result = new cate({
            Type: req.body.category,
            Img: req.file.path
        })
        const response = await result.save()
        if (response) {
            res.send({ statuscode: 1 })
        }
        else {
            res.send({ statuscode: 0 })
        }
    }
    catch (error) {
        console.log(error)
        res.status(500).send({ statuscode: 0, message: "category not added" })
    }
})


app.get("/api/getcat", async (req, res) => {
    const result = await cate.find()
    if (result) {
        res.send({ statuscode: 1, data: result })
    }
    else {
        res.send({ statuscode: 0 })
    }
})

const place = new mongoose.Schema({

    Placename: String,
    Type: String,
    Rating: Number,
    About: String,
    City: String,
    Image: [String],
    WiFi: Boolean,
    Gaming: Boolean,
    Meeting: Boolean,
    Address: String,
    Location: {
        lat: Number,
        lng: Number
    }

});
const addedplace = mongoose.model("Place", place)

app.post("/api/place", upload.array("images", 10), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).send({ statuscode: 0, message: "image is required" })
        }
        const result = new addedplace({
            Placename: req.body.name,
            About: req.body.about,
            Type: req.body.type,
            Rating: req.body.rating,
            WiFi: req.body.wifi,
            Meeting: req.body.meeting,
            Gaming: req.body.gaming,
            Address: req.body.address,
            City: req.body.city,
            Image: req.files.map(file => file.path),
            Location: {
                lat: Number(req.body.lat),
                lng: Number(req.body.lng)
            },
        })
        const response = await result.save()
        if (response) {
            res.send({ statuscode: 1, imageCount: req.files.length })
        }
        else {
            res.send({ statuscode: 0 })
        }
    }
    catch (error) {
        console.log(error)
        res.status(500).send({ statuscode: 0, message: "place not added" })
    }
})
app.get("/api/showplace", async (req, res) => {
    const result = await addedplace.find().sort({ _id: -1 }).limit(6)
    if (result) {
        res.send({ statuscode: 1, data: result })
    }
    else {
        res.send({ statuscode: 0 })
    }
})

app.delete("/api/removeplace/:id", async (req, res) => {
    const result = await addedplace.deleteOne({ _id: req.params.id })
    if (result.deletedCount > 0) {
        res.send({ statuscode: 1 })
    }
    else{
        res.send({statuscode:0})
    }
})

app.get("/api/gaming", async (req, res) => {
    const result = await addedplace.find({ Type: "6a0494a3da7b49bca4d98cf0", Gaming: true })
    if (result) {
        res.send({ statuscode: 1, data: result })
    }
    else {
        res.send({ statuscode: 0 })
    }
})
app.get("/api/gamingandcafe", async (req, res) => {
    const result = await addedplace.find({
        Type: "6a0494a3da7b49bca4d98cf0",
        $and: [
            { Gaming: true },
            { Meeting: true }
        ]
    })
    if (result) {
        res.send({ statuscode: 1, data: result })
    }
    else {
        res.send({ statuscode: 0 })
    }
})

app.get("/api/related/:id", async (req, res) => {
    const result = await addedplace.find({ Type: req.params.id })
    if (result) {
        res.send({ statuscode: 1, data: result })
    }
    else {
        res.send({ statuscode: 0 })
    }
})

app.get("/api/showplace2/:id", async (req, res) => {
    try {
        const result = await addedplace.findOne({ _id: req.params.id })
        if (result) {
            res.send({ statuscode: 1, data: result })
        }
        else {
            res.send({ statuscode: 0 })
        }
    }
    catch (error) {
        console.log(error)
        res.status(500).send({ statuscode: 0, message: "place not found" })
    }
})

//review part 

const review = new mongoose.Schema({
    Date: String,
    ID: String,
    Name: String,
    Email: String,
    Msg: String,
    Rating: Number,
    UserID: String

})

const userReview = mongoose.model("Reviews", review)

app.post("/api/review", async (req, res) => {
    const result = new userReview({
        Date: new Date(),
        ID: req.body.prr,
        Name: req.body.user,
        Email: req.body.usermail,
        Msg: req.body.msg,
        Rating: req.body.rating2,
        UserID: req.body.id
    })
    if (result) {
        const response = await result.save()
        if (response) {
            res.send({ statuscode: 1 })
        }
        else {
            res.send({ statuscode: 0 })
        }
    }
})
app.get("/api/getreview/:id", async (req, res) => {
    const result = await userReview.find({ ID: req.params.id }).sort({ _id: -1 }).limit(2)
    if (result) {
        res.send({ statuscode: 1, data: result })
    }
    else {
        res.send({ statuscode: 0 })
    }
})

app.get("/api/allreviews", async (req, res) => {
    const result = await userReview.find().sort({ _id: -1 })
    if (result) {
        res.send({ statuscode: 1, data: result })
    }
    else {
        res.send({ statuscode: 0 })
    }
})

app.get("/api/userreviews/:id", async (req, res) => {
    const userId = req.params?.id

    if (!userId || userId === "undefined") {
        return res.send({ statuscode: 1, data: [] })
    }

    const result = await userReview.find({ UserID: userId }).sort({ _id: -1 })
    if (result) {
        res.send({ statuscode: 1, data: result })
    }
    else {
        res.send({ statuscode: 0 })
    }
})

//reservation schema model

const Table = mongoose.Schema({
    Name: String,
    Email: String,
    Guests: Number,
    Date: String,
    Phone: Number,
    UserID: String,
    PlaceID: String,
    Placename: String,
    TimeSlot: String,
    Status: { type: String, default: "Pending" }
})

const booktable = new mongoose.model("Reservations", Table)

app.post("/api/reservation", async (req, res) => {
    const result = new booktable({
        Name: req.body.name,
        Email: req.body.email,
        Guests: req.body.guest,
        Date: req.body.date,
        Phone: req.body.phone,
        UserID: req.body.userId || req.body.id || "",
        PlaceID: req.body.placeId || "",
        Placename: req.body.placename || req.body.placeName || "General Table",
        TimeSlot: req.body.timeSlot || "12:00 PM - 02:00 PM",
        Status: "Pending"
    })
    if (result) {
        const response = await result.save()
        if (response) {
            res.send({ statuscode: 1 })
        }
        else {
            res.send({ statuscode: 0 })
        }
    }
})

app.get("/api/reservations", async (req, res) => {
    const result = await booktable.find().sort({ _id: -1 })
    if (result) {
        res.send({ statuscode: 1, data: result })
    }
    else {
        res.send({ statuscode: 0 })
    }
})

app.get("/api/userreservations/:id", async (req, res) => {
    const userId = req.params?.id

    if (!userId || userId === "undefined") {
        return res.send({ statuscode: 1, data: [] })
    }

    const result = await booktable.find({ UserID: userId }).sort({ _id: -1 })
    if (result) {
        res.send({ statuscode: 1, data: result })
    }
    else {
        res.send({ statuscode: 0 })
    }
})

app.delete("/api/cancelreservation/:id", async (req, res) => {
    const result = await booktable.deleteOne({ _id: req.params.id })
    if (result.deletedCount > 0) {
        res.send({ statuscode: 1 })
    }
    else {
        res.send({ statuscode: 0 })
    }
})

app.post("/api/updatereservationstatus", async (req, res) => {
    const { id, status } = req.body
    const result = await booktable.updateOne({ _id: id }, { $set: { Status: status } })
    if (result.modifiedCount > 0) {
        res.send({ statuscode: 1 })
    }
    else {
        res.send({ statuscode: 0 })
    }
})



//hotel booking

const hotel = mongoose.Schema({
    Name: String,
    Email: String,
    RoomType: String,
    Rooms: Number,
    CheckIn: String,
    CheckOut: String
})

const bookhotel = mongoose.model("/hotels", hotel)

app.post("/api/hotel", async (req, res) => {
    const result = await new bookhotel({
        Name: req.body.name,
        Email: req.body.email,
        RoomType: req.body.type,
        Rooms: req.body.room,
        CheckIn: req.body.checkin,
        CheckOut: req.body.checkout
    })
    if (result) {
        const response = await result.save()
        if (response) {
            res.send({ statuscode: 1 })
        }
        else {
            res.send({ statuscode: 0 })
        }
    }
})

const coworking = mongoose.Schema({
    Name: String,
    Email: String,
    Phone: Number,
    SpaceType: String
})

const coworkingSpace = new mongoose.model("CoworkingSpaces", coworking)

app.post("/api/cowork", async (req, res) => {
    const result = await new coworkingSpace({
        Name: req.body.name,
        Email: req.body.email,
        Phone: req.body.phone,
        SpaceType: req.body.type
    })
    if (result) {
        const response = await result.save()
        if (response) {
            res.send({ statuscode: 1 })
        }
        else {
            res.send({ statuscode: 0 })
        }
    }
})


// wishlist schema

const wishlist = mongoose.Schema({
    Placename: String,
    Type: String,
    UserId: String,
    Image: String,
    PlaceID: String,
    Address: String,
    City: String

})

const wlist = mongoose.model("Wishlist", wishlist)

app.post("/api/wishlist", async (req, res) => {
    const result = await new wlist({
        Placename: req.body.name,
        Address: req.body.address,
        City: req.body.city,
        Type: req.body.type,
        UserId: req.body.id,
        Image: req.body.img,
        PlaceID: req.body.prr
    })
    if (result) {
        const response = await result.save()
        if (response) {
            res.send({ statuscode: 1 })
        }
        else {
            res.send({ statuscode: 0 })
        }
    }
})

app.get("/api/favourite/:id", async (req, res) => {
    const result = await wlist.find({ UserId: req.params.id })
    if (result) {
        res.send({ statuscode: 1, data: result })
    }
    else {
        res.send({ statuscode: 0 })
    }
})

//chat bot
app.post("/api/chat", async (req, res) => {
    try {
        const userMessage = req.body.message

        if (!process.env.OPENAI_API_KEY && !process.env.Open_Api) {
            return res.status(500).send({
                statuscode: 0,
                message: "OpenAI API key is missing. Add OPENAI_API_KEY in .env and restart the server."
            })
        }

        if (!userMessage) {
            return res.status(400).send({
                statuscode: 0,
                message: "Message is required"
            })
        }

        const response = await openai.responses.create({
            model: "gpt-4.1-mini",
            instructions: `
You are a helpful chatbot for a coworking and cafe booking website called WorkWave.
Help users with reservations, room booking, coworking spaces, wishlist, login, and account questions.
Keep answers short, friendly, and simple.
`,
            input: userMessage
        })

        res.send({
            statuscode: 1,
            reply: response.output_text
        })
    }
    catch (error) {
        console.log("OpenAI chatbot error:", error)

        if (error.status === 429 || error.code === "insufficient_quota") {
            const isQuotaError = error.code === "insufficient_quota"
                || error.message?.toLowerCase().includes("quota")

            if (isQuotaError) {
                return res.send({
                    statuscode: 1,
                    reply: getLocalChatReply(req.body.message)
                })
            }

            return res.status(429).send({
                statuscode: 0,
                message: "OpenAI is receiving too many requests right now. Please wait a moment and try again."
            })
        }

        res.status(500).send({
            statuscode: 0,
            message: error.message || "Chatbot error"
        })
    }
})

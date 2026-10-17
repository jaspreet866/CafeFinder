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
    origin: (origin, callback) => {
        if (!origin || 
            /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) || 
            origin.includes("vercel.app") || 
            origin.includes("onrender.com")
        ) {
            callback(null, true);
        } else {
            callback(null, true);
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"]
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
    try {
        const hash = bcrypt.hashSync(req.body.pass, 10)
        const result = new user({
            Name: req.body.name,
            Email: req.body.email,
            Password: hash,
            UserType: req.body.userType || req.body.usertype || "User"
        })
        const response = await result.save()
        if (response) {
            res.send({ statuscode: 1 })
        }
        else {
            res.send({ statuscode: 0 })
        }
    } catch (err) {
        console.error("Register error:", err)
        res.status(500).send({ statuscode: 0, message: err.message })
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
    try {
        const rawEmail = req.body.email ? String(req.body.email).trim() : "";
        const rawPass = req.body.pass ? String(req.body.pass) : "";

        if (!rawEmail || !rawPass) {
            return res.send({ statuscode: 0, message: "Email and password are required" });
        }

        // Case-insensitive email search so users can log in regardless of email casing
        const escapedEmail = rawEmail.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
        const result = await user.findOne({
            Email: { $regex: new RegExp(`^${escapedEmail}$`, "i") }
        });

        if (!result || !result.Password) {
            return res.send({ statuscode: 0, message: "Invalid email or password" });
        }

        const passMatches = bcrypt.compareSync(rawPass, result.Password);
        if (passMatches === true) {
            let token = jwt.sign(
                { id: result._id, mail: result.Email, usrtype: result.UserType },
                key,
                { expiresIn: "7d" }
            );
            res.send({ statuscode: 1, data: result, jwtoken: token });
        } else {
            res.send({ statuscode: 0, message: "Invalid email or password" });
        }
    } catch (err) {
        console.error("Login route error:", err);
        res.status(500).send({ statuscode: 0, message: "Error during authentication" });
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

app.delete("/api/removecategory/:id", async (req, res) => {
    try {
        const result = await cate.deleteOne({ _id: req.params.id })
        res.send({ statuscode: result.deletedCount > 0 ? 1 : 0 })
    } catch (err) {
        res.status(500).send({ statuscode: 0, message: err.message })
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
    },
    OwnerId: String,
    OwnerEmail: String
});
const addedplace = mongoose.model("Place", place)

app.post("/api/place", upload.array("images", 10), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).send({ statuscode: 0, message: "image is required" })
        }

        const latVal = Number(req.body.lat) || 28.6139;
        const lngVal = Number(req.body.lng) || 77.2090;

        const result = new addedplace({
            Placename: req.body.name,
            About: req.body.about,
            Type: req.body.type,
            Rating: Number(req.body.rating) || 4.5,
            WiFi: req.body.wifi === "true" || req.body.wifi === true,
            Meeting: req.body.meeting === "true" || req.body.meeting === true,
            Gaming: req.body.gaming === "true" || req.body.gaming === true,
            Address: req.body.address,
            City: req.body.city,
            Image: req.files.map(file => file.path),
            Location: {
                lat: latVal,
                lng: lngVal
            },
            OwnerId: req.body.ownerId || "",
            OwnerEmail: req.body.ownerEmail || ""
        })
        const response = await result.save()
        if (response) {
            res.send({ statuscode: 1, imageCount: req.files.length, data: response })
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

app.get("/api/allplaces", async (req, res) => {
    try {
        const result = await addedplace.find().sort({ _id: -1 })
        res.send({ statuscode: 1, data: result || [] })
    } catch (err) {
        res.status(500).send({ statuscode: 0, message: err.message })
    }
})

app.get("/api/owner/places/:ownerId", async (req, res) => {
    try {
        const ownerId = req.params.ownerId
        const ownerEmail = req.query.email || ""
        const result = await addedplace.find({
            $or: [
                { OwnerId: ownerId },
                { OwnerEmail: { $exists: true, $eq: ownerEmail, $ne: "" } }
            ]
        }).sort({ _id: -1 })
        res.send({ statuscode: 1, data: result || [] })
    } catch (err) {
        res.status(500).send({ statuscode: 0, message: err.message })
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
    UserID: String,
    Images: [String],
    Likes: { type: Number, default: 0 },
    LikedBy: [String],
    OwnerReply: {
        text: String,
        replyDate: String
    }
})

const userReview = mongoose.model("Reviews", review)

app.post("/api/review", upload.array("images", 5), async (req, res) => {
    try {
        const uploadedImages = req.files && req.files.length > 0 ? req.files.map(file => file.path) : []
        const result = new userReview({
            Date: new Date().toISOString(),
            ID: req.body.prr,
            Name: req.body.user,
            Email: req.body.usermail,
            Msg: req.body.msg,
            Rating: Number(req.body.rating2) || 5,
            UserID: req.body.id || "",
            Images: uploadedImages,
            Likes: 0,
            LikedBy: [],
            OwnerReply: null
        })
        const response = await result.save()
        if (response) {
            res.send({ statuscode: 1, data: response })
        }
        else {
            res.send({ statuscode: 0 })
        }
    } catch (err) {
        console.error("Review save error:", err)
        res.status(500).send({ statuscode: 0, message: err.message })
    }
})

app.get("/api/getreview/:id", async (req, res) => {
    const result = await userReview.find({ ID: req.params.id }).sort({ _id: -1 })
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

app.delete("/api/removereview/:id", async (req, res) => {
    try {
        const result = await userReview.deleteOne({ _id: req.params.id })
        res.send({ statuscode: result.deletedCount > 0 ? 1 : 0 })
    } catch (err) {
        res.status(500).send({ statuscode: 0, message: err.message })
    }
})

app.post("/api/review/:id/like", async (req, res) => {
    try {
        const { userId } = req.body
        const rev = await userReview.findById(req.params.id)
        if (!rev) return res.status(404).send({ statuscode: 0, message: "Review not found" })

        const likedBy = rev.LikedBy || []
        const userIdentifier = userId || "anonymous"
        const alreadyLiked = likedBy.includes(userIdentifier)

        if (alreadyLiked) {
            rev.LikedBy = likedBy.filter(u => u !== userIdentifier)
            rev.Likes = Math.max(0, (rev.Likes || 1) - 1)
        } else {
            rev.LikedBy.push(userIdentifier)
            rev.Likes = (rev.Likes || 0) + 1
        }

        await rev.save()
        res.send({ statuscode: 1, likes: rev.Likes, liked: !alreadyLiked })
    } catch (err) {
        res.status(500).send({ statuscode: 0, message: err.message })
    }
})

app.post("/api/review/:id/reply", async (req, res) => {
    try {
        const { reply } = req.body
        const rev = await userReview.findById(req.params.id)
        if (!rev) return res.status(404).send({ statuscode: 0, message: "Review not found" })

        rev.OwnerReply = {
            text: reply,
            replyDate: new Date().toISOString()
        }
        await rev.save()
        res.send({ statuscode: 1, data: rev })
    } catch (err) {
        res.status(500).send({ statuscode: 0, message: err.message })
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
    Status: { type: String, default: "Pending" },
    PreOrderItems: [{
        name: String,
        price: Number,
        qty: Number
    }],
    PreOrderTotal: { type: Number, default: 0 },
    OwnerId: String,
    OwnerEmail: String,
    CreatedAt: { type: Date, default: Date.now }
})

const booktable = new mongoose.model("Reservations", Table)

app.post("/api/reservation", async (req, res) => {
    try {
        let parsedPreOrder = []
        if (req.body.preOrderItems) {
            parsedPreOrder = typeof req.body.preOrderItems === "string" 
                ? JSON.parse(req.body.preOrderItems) 
                : req.body.preOrderItems
        }

        let ownerId = req.body.ownerId || ""
        let ownerEmail = req.body.ownerEmail || ""
        if (req.body.placeId) {
            const pl = await addedplace.findById(req.body.placeId).catch(() => null)
            if (pl) {
                ownerId = ownerId || pl.OwnerId || ""
                ownerEmail = ownerEmail || pl.OwnerEmail || ""
            }
        }

        const result = new booktable({
            Name: req.body.name,
            Email: req.body.email,
            Guests: Number(req.body.guest) || 1,
            Date: req.body.date,
            Phone: Number(req.body.phone) || 0,
            UserID: req.body.userId || req.body.id || "",
            PlaceID: req.body.placeId || "",
            Placename: req.body.placename || req.body.placeName || "General Table",
            TimeSlot: req.body.timeSlot || "12:00 PM - 02:00 PM",
            Status: "Pending",
            PreOrderItems: parsedPreOrder,
            PreOrderTotal: Number(req.body.preOrderTotal || 0),
            OwnerId: ownerId,
            OwnerEmail: ownerEmail
        })
        const response = await result.save()
        if (response) {
            res.send({ statuscode: 1, data: response })
        }
        else {
            res.send({ statuscode: 0 })
        }
    } catch (err) {
        console.error("Reservation error:", err)
        res.status(500).send({ statuscode: 0, message: err.message })
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

// Owner Reservations & Reviews
app.get("/api/owner/reservations/:ownerId", async (req, res) => {
    try {
        const ownerId = req.params.ownerId
        const ownerEmail = req.query.email || ""
        
        const places = await addedplace.find({
            $or: [
                { OwnerId: ownerId },
                { OwnerEmail: { $exists: true, $eq: ownerEmail, $ne: "" } }
            ]
        })
        const placeIds = places.map(p => p._id.toString())
        const placeNames = places.map(p => p.Placename)

        const reservations = await booktable.find({
            $or: [
                { OwnerId: ownerId },
                { OwnerEmail: { $exists: true, $eq: ownerEmail, $ne: "" } },
                { PlaceID: { $in: placeIds } },
                { Placename: { $in: placeNames } }
            ]
        }).sort({ _id: -1 })

        res.send({ statuscode: 1, data: reservations || [] })
    } catch (err) {
        res.status(500).send({ statuscode: 0, message: err.message })
    }
})

app.get("/api/owner/reviews/:ownerId", async (req, res) => {
    try {
        const ownerId = req.params.ownerId
        const ownerEmail = req.query.email || ""

        const places = await addedplace.find({
            $or: [
                { OwnerId: ownerId },
                { OwnerEmail: { $exists: true, $eq: ownerEmail, $ne: "" } }
            ]
        })
        const placeIds = places.map(p => p._id.toString())

        const reviews = await userReview.find({ ID: { $in: placeIds } }).sort({ _id: -1 })
        res.send({ statuscode: 1, data: reviews || [] })
    } catch (err) {
        res.status(500).send({ statuscode: 0, message: err.message })
    }
})

// Digital Menu Item Model & Endpoints
const menuItemSchema = new mongoose.Schema({
    PlaceID: { type: String, required: true },
    Name: { type: String, required: true },
    Category: { type: String, default: "Beverage" },
    Price: { type: Number, required: true },
    Description: { type: String, default: "" },
    IsVeg: { type: Boolean, default: true },
    InStock: { type: Boolean, default: true },
    Image: { type: String, default: "" }
})

const MenuItem = mongoose.model("MenuItems", menuItemSchema)

app.get("/api/menu/:placeId", async (req, res) => {
    try {
        const items = await MenuItem.find({ PlaceID: req.params.placeId }).sort({ _id: -1 })
        res.send({ statuscode: 1, data: items || [] })
    } catch (err) {
        res.status(500).send({ statuscode: 0, message: err.message })
    }
})

app.post("/api/menu", upload.single("pic"), async (req, res) => {
    try {
        const item = new MenuItem({
            PlaceID: req.body.placeId,
            Name: req.body.name,
            Category: req.body.category || "Beverage",
            Price: Number(req.body.price) || 0,
            Description: req.body.description || "",
            IsVeg: req.body.isVeg === "true" || req.body.isVeg === true,
            InStock: true,
            Image: req.file ? req.file.path : (req.body.image || "")
        })
        const saved = await item.save()
        res.send({ statuscode: 1, data: saved })
    } catch (err) {
        console.error("Menu save error:", err)
        res.status(500).send({ statuscode: 0, message: err.message })
    }
})

app.delete("/api/menu/:id", async (req, res) => {
    try {
        const result = await MenuItem.deleteOne({ _id: req.params.id })
        res.send({ statuscode: result.deletedCount > 0 ? 1 : 0 })
    } catch (err) {
        res.status(500).send({ statuscode: 0, message: err.message })
    }
})

app.put("/api/menu/:id/toggle", async (req, res) => {
    try {
        const item = await MenuItem.findById(req.params.id)
        if (!item) return res.status(404).send({ statuscode: 0, message: "Item not found" })
        item.InStock = !item.InStock
        await item.save()
        res.send({ statuscode: 1, inStock: item.InStock })
    } catch (err) {
        res.status(500).send({ statuscode: 0, message: err.message })
    }
})



//hotel booking

//hotel booking

const hotel = mongoose.Schema({
    Name: String,
    Email: String,
    Phone: String,
    RoomType: String,
    Rooms: { type: Number, default: 1 },
    CheckIn: String,
    CheckOut: String,
    PlaceID: String,
    Placename: String,
    OwnerId: String,
    OwnerEmail: String,
    UserID: String,
    Status: { type: String, default: "Pending" },
    CreatedAt: { type: Date, default: Date.now }
})

const bookhotel = mongoose.model("/hotels", hotel)

app.post("/api/hotel", async (req, res) => {
    try {
        let ownerId = req.body.ownerId || ""
        let ownerEmail = req.body.ownerEmail || ""
        if (req.body.placeId) {
            const pl = await addedplace.findById(req.body.placeId).catch(() => null)
            if (pl) {
                ownerId = ownerId || pl.OwnerId || ""
                ownerEmail = ownerEmail || pl.OwnerEmail || ""
            }
        }

        const result = new bookhotel({
            Name: req.body.name,
            Email: req.body.email,
            Phone: req.body.phone || "",
            RoomType: req.body.type || "Standard Room",
            Rooms: Number(req.body.room) || 1,
            CheckIn: req.body.checkin,
            CheckOut: req.body.checkout,
            PlaceID: req.body.placeId || "",
            Placename: req.body.placename || "Hotel Room",
            UserID: req.body.userId || "",
            OwnerId: ownerId,
            OwnerEmail: ownerEmail,
            Status: "Pending"
        })
        const response = await result.save()
        if (response) {
            res.send({ statuscode: 1, data: response })
        } else {
            res.send({ statuscode: 0 })
        }
    } catch (err) {
        res.status(500).send({ statuscode: 0, message: err.message })
    }
})

// Owner Hotel Bookings
app.get("/api/owner/hotel-bookings/:ownerId", async (req, res) => {
    try {
        const ownerId = req.params.ownerId
        const ownerEmail = req.query.email || ""
        
        const places = await addedplace.find({
            $or: [
                { OwnerId: ownerId },
                { OwnerEmail: { $exists: true, $eq: ownerEmail, $ne: "" } }
            ]
        })
        const placeIds = places.map(p => p._id.toString())
        const placeNames = places.map(p => p.Placename)

        const bookings = await bookhotel.find({
            $or: [
                { OwnerId: ownerId },
                { OwnerEmail: { $exists: true, $eq: ownerEmail, $ne: "" } },
                { PlaceID: { $in: placeIds } },
                { Placename: { $in: placeNames } }
            ]
        }).sort({ _id: -1 })

        res.send({ statuscode: 1, data: bookings || [] })
    } catch (err) {
        res.status(500).send({ statuscode: 0, message: err.message })
    }
})

// Update Hotel Booking Status (Confirm / Decline)
app.post("/api/updatehotelstatus", async (req, res) => {
    try {
        const { id, status } = req.body
        const result = await bookhotel.updateOne({ _id: id }, { $set: { Status: status } })
        if (result.modifiedCount > 0) {
            res.send({ statuscode: 1 })
        } else {
            res.send({ statuscode: 0 })
        }
    } catch (err) {
        res.status(500).send({ statuscode: 0, message: err.message })
    }
})

// Cancel Hotel Booking
app.delete("/api/cancelhotel/:id", async (req, res) => {
    try {
        const result = await bookhotel.deleteOne({ _id: req.params.id })
        res.send({ statuscode: result.deletedCount > 0 ? 1 : 0 })
    } catch (err) {
        res.status(500).send({ statuscode: 0, message: err.message })
    }
})

// Admin Hotel Bookings
app.get("/api/hotel", async (req, res) => {
    try {
        const bookings = await bookhotel.find().sort({ _id: -1 })
        res.send({ statuscode: 1, data: bookings || [] })
    } catch (err) {
        res.status(500).send({ statuscode: 0, message: err.message })
    }
})

// Owner Total Pending Requests Count (for Navigation Badge)
app.get("/api/owner/pending-count/:ownerId", async (req, res) => {
    try {
        const ownerId = req.params.ownerId
        const ownerEmail = req.query.email || ""
        
        const places = await addedplace.find({
            $or: [
                { OwnerId: ownerId },
                { OwnerEmail: { $exists: true, $eq: ownerEmail, $ne: "" } }
            ]
        })
        const placeIds = places.map(p => p._id.toString())
        const placeNames = places.map(p => p.Placename)

        const pendingTables = await booktable.countDocuments({
            $and: [
                {
                    $or: [
                        { Status: "Pending" },
                        { Status: { $exists: false } },
                        { Status: null },
                        { Status: "" }
                    ]
                },
                {
                    $or: [
                        { OwnerId: ownerId },
                        { OwnerEmail: { $exists: true, $eq: ownerEmail, $ne: "" } },
                        { PlaceID: { $in: placeIds } },
                        { Placename: { $in: placeNames } }
                    ]
                }
            ]
        })

        const pendingRooms = await bookhotel.countDocuments({
            $and: [
                {
                    $or: [
                        { Status: "Pending" },
                        { Status: { $exists: false } },
                        { Status: null },
                        { Status: "" }
                    ]
                },
                {
                    $or: [
                        { OwnerId: ownerId },
                        { OwnerEmail: { $exists: true, $eq: ownerEmail, $ne: "" } },
                        { PlaceID: { $in: placeIds } },
                        { Placename: { $in: placeNames } }
                    ]
                }
            ]
        })

        res.send({
            statuscode: 1,
            pendingCount: pendingTables + pendingRooms,
            pendingTables,
            pendingRooms
        })
    } catch (err) {
        res.status(500).send({ statuscode: 0, message: err.message, pendingCount: 0 })
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

app.delete("/api/wishlist/:id", async (req, res) => {
    try {
        const result = await wlist.findByIdAndDelete(req.params.id);
        if (result) {
            res.send({ statuscode: 1, message: "Item removed from wishlist" });
        } else {
            res.send({ statuscode: 0, message: "Item not found" });
        }
    } catch (err) {
        res.status(500).send({ statuscode: 0, message: "Server error" });
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

const mongoose = require("mongoose")
require("dotenv").config()

const MONGOURL = process.env.MONGODB

const initialiseDatabase = async () => {
    await mongoose.connect(MONGOURL)
    .then(()=>console.log("Connected to the database."))
    .catch((err)=>console.log(err))
}

module.exports = {initialiseDatabase}
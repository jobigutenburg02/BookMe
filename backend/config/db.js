import mongoose from "mongoose";

export const connectDB = async() => {
    await mongoose.connect("mongodb+srv://jobigutenburg29_db_user:C8Sn7AMRZ0JACzWD@cluster0.ilf4pyl.mongodb.net/BookMe")
    .then(() => {
        console.log("DB CONNECTED")
    })
}
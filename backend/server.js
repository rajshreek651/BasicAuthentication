import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from "dotenv";
import postRoutes from "./routes/posts.routes.js";
import userRoutes from "./routes/user.routes.js";

dotenv.config(); // to load the things from '.env' file to 'process'

const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors()); // to avoid 'Exceptions' related to 'origin'
app.use(express.json()); // to send requests-responses in json format

// 'Routes' should be after 'express.json()', else ERROR: 'Cannot destructure property...'
app.use(postRoutes);
app.use(userRoutes);

// creating a 'STATIC SERVER' to upload files by users
app.use(express.static("uploads"));
// Here, at the time of testing, we can search the url as --> localhost:3000/doraemon_profile.png
// DON'T USE ABSOLUTE PATH HERE -->  C:\Users\user\OneDrive\Desktop\Projects\MajorProjects\LinkedinClone\uploads --> coz not every programmer has the same path, as ours, so it won't work
// USE RELATIVE PATH --> uploads/

// We will use a 'start script', coz mongoDB being ASYNCHRONOUS takes some time to get started
const start = async () => {
    const connectDB = await mongoose.connect(process.env.MONGODB_URI);
    
    app.listen(PORT, () => {
        console.log(`Server is listening to Port: ${PORT}`);
        console.log("Connected To MongoDB");
    });
}

start();
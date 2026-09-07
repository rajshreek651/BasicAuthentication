import mongoose, {Schema} from "mongoose";

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    active: {
        type: Boolean,
        default: true
    },
    password: {
        type: String, 
        required: true
    }, 
    profilePicture: {
        type: String, 
        default: 'default.jpg' // a new logged in user will have a 'default profile image'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    token: {
        type: String,
        default: ''
    }
});

const UserModel = mongoose.model("User", UserSchema);

export default UserModel;
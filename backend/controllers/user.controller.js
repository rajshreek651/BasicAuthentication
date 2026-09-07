// 'user.controller.js' will have all those routes, which are related to 'USER POST REQUESTS'
// import funcs. from here to ../routes/user.controller.js'

import UserModel from "../models/user.model.js";
import ProfileModel from "../models/profile.model.js";
import bcrypt from "bcrypt";
import crypto from "crypto";

// If 'new user' wants to 'Register'
export const register = async (req, res) => {
    try{

        const {name, email, password, username} = req.body;

        // If even one info. is missing then , give the Error message
        if(!name || !email || !password || !username){
            return res.status(400).json({message: "All fields are required!!"});
        }

        // When all info entered, then check if the user has an pre-existing account, if so then there is no need of 'Registering' or 'Sign up' again
        const user = await UserModel.findOne({ email });
        if(user){ // if user exists already 
            return res.status(409).json({message: "User already exists!!"});
        }

        // If there's a new user then, create a 'hashedPassword' from the 'password' entered by the user
        const hashedPassword = await bcrypt.hash(password, 10); // '10' to provide salt of length 10

        // Push the 'newUser' in DB
        const newUser = new UserModel({
            name,
            email,
            password: hashedPassword,
            username
        });

        await newUser.save();

        // NOTE: 'token' is not generated at the time of 'Register', it is to be generated at the time of 'Login', so that the 'token' generated will make the user an 'AUTHORIZED USER', and the user can edit, view, make changes, etc... to their account. The token is checked through the 'middleware'

        // Just after 'Registering', we will take the user to set their 'Profile'
        // Just after 'Registering', when the 'user details' are set in the DB, the lines below will create their 'profile obj' in the DB, so that at the time of updating the profile, the respective userId's profile gets updated. Else at the time of updating the profile we may not know whose profile details are these.
        const profile = new ProfileModel({
            userId: newUser._id, // we already get the userId when the 'newUser' object was made
        });
        await profile.save();

        return res.status(200).json({message: "User registered successfully"});

    }catch(err){
        // Someone may use the same username as another user, which already exists in the DB, so we need to check if the 'username' is already taken or not
        if (err.code === 11000) {
            return res.status(400).json({message: "Username already exists. Try some other username."});
        }else{
            return res.status(500).json({message: err.message});
        }
    }
};

export const login = async (req, res) => {
    try{
        const {email, password} = req.body;

        // If even one info. missing then return error
        if(!email || !password){
            return res.status(400).json({message: "All fields are required !!"});
        }

        // If all info. given then check if 'email is a registered email or not'
        const user = await UserModel.findOne({ email });

        // If Not a 'Registered Email Id'
        if(!user) return res.status(404).json({message: "User does not exist !!"});

        // If a 'Registered Email Id', then check if 'entered password' is correct or not
        const isPswdMatch = await bcrypt.compare(password, user.password);
        // If 'wrong password' entered
        if(!isPswdMatch) return res.status(400).json({message: "Invalid Credentials !!"});

        // If password is correct, then we will 'generate a TOKEN', to make them an 'AUTHORIZED & AUTHENTICATED USER'
        const token = crypto.randomBytes(32).toString("hex");
        // TOKEN IS TO BE USED BECOZ,
        /* 
            Suppose, once the user has already logged in, and refreshes the page, this will make the user get 'logout', so to be an 'AUTHORIZED & AUTHENTICATED USER',
            the user has to login again, and if due to some issues like network error, if again and again the page gets 'refresh', then the user logs out and has to login again & again. So for this one may want to remove 'LOGIN', but we want SECURITY' as well, so we cant remove 'Login' functionality
            So to reduce this friction, the once logged in user's 'TOKEN' is saved in their local storage as a credential to access their account, instead of saving their credentials like username, password (which can be at threat if system is HACKED),
        */
       await UserModel.updateOne({_id: user._id}, { token }); // this will make the 'token' of the 'logging in user' get updated. So every time a user logs in, their 'TOKEN' gets updated. Since 'token' is not constant and gets changed eveytime of login, so the user's detail can't be hacked so easily
       return res.json({token: token}); // sending to browser for local storage of this 'token'

    }catch(err){
        return res.status(500).json({message: err.message});
    }
};

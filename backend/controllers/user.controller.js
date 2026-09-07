// 'user.controller.js' will have all those routes, which are related to 'USER POST REQUESTS'
// import funcs. from here to ../routes/user.controller.js'

import UserModel from "../models/user.model.js";
import ProfileModel from "../models/profile.model.js";
import ConnectionRequestModel from "../models/connections.model.js";
import CommentModel from "../models/comments.model.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import PDFDocument from "pdfkit";
import fs from "fs"; // 'fs' means file_system

// convert User Data To PDF
const convertUserDataToPDF = async (userData) => {
    // Creating new document
    const doc = new PDFDocument(); // can learn from 'https://pdfkit.org/ 
    const outputPath = crypto.randomBytes(32).toString("hex") + ".pdf"; // creating a unique filename
    // we can think that why to use 'crypto'; Instead we can just get the 'username' and then do '<username>.pdf' --> just generate it at once and keep. 
    // user profile can be updated, and if once generated and kept the PDF, then later we can get the updated profile as the 'file will be OVERWRITTEN'
    // BUT, we used crypto, coz if we generate using 'username', then 'username' can be known by others, and they may mess with it using, it somewhere else to access, that user's details,... which can 'hamper the security' of that user 

    const stream = fs.createWriteStream(`uploads/${outputPath}`); // storing pdfs also in 'uploads folder'
    // DON'T USE ABSOLUTE PATH HERE -->  C:\Users\user\OneDrive\Desktop\Projects\MajorProjects\LinkedinClone\uploads --> coz not every programmer has the same path, as ours, so it won't work
    // USE RELATIVE PATH --> uploads/

    doc.pipe(stream);

    doc.image(`uploads/${userData.userId.profilePicture}`, { align: "center", width: 100 });
    // 'align: "center"' centers it 'horizontally' from the top of the pdf page
    doc.fontSize(16).text(`Name: ${userData.userId.name}`, { align: "center"});
    doc.fontSize(14).text(`Username: ${userData.userId.username}`);
    doc.fontSize(14).text(`Email: ${userData.userId.email}`);
    doc.fontSize(14).text(`Bio: ${userData.bio}`);
    doc.fontSize(14).text(`Current Position: ${userData.currentPost}`);

    doc.fontSize(16).text("Past Work: ");
    userData.pastWork.forEach((work, index) => {
        doc.fontSize(14).text(`Company Name: ${work.company}`);
        doc.fontSize(14).text(`Position: ${work.position}`);
        doc.fontSize(14).text(`Years: ${work.years}`);
    });

    doc.fontSize(16).text("Education: ");
    userData.education.forEach((edu, index) => {
        doc.fontSize(14).text(`College: ${edu.school}`);
        doc.fontSize(14).text(`Degree: ${edu.degree}`);
        doc.fontSize(14).text(`Field of Study: ${edu.fieldOfStudy}`);
    });

    doc.end();

    return outputPath;

};

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

export const uploadProfilePicture = async (req, res) => {
    const {token} = req.body; 
    // to check if the user is Authorized or not, else becoz, anybody can change the profile picture from 'hoppscotch', 'thunder client', 'postman' ,etc... 'api testing tools
    // and also, we need to know, to which profile (i.e. the current user's profile) we need to send the user, so we use the 'token'
    try{
        const user = await UserModel.findOne({ token: token });
        // If user doe not exist
        if(!user) return res.status(404).json({message: "User not found !!"});
        // if user exists, then
        user.profilePicture = req.file.filename; // we don't save binary file in 'MONGO_DB', we are just 'giving' the directory , where the file exists,..., uploading of file is done through 'multer' in the provided destination as here --> 'uploads/'
        await user.save();

        return res.json({message: "Profile picture updated."});

    }catch(err){
        return res.status(500).json({message: err.message});
    }
};

// UPDATING THINGS(LIKE EMAIL, USERNAME) IN 'USER COLLECTION' IN DB
export const updateUserProfile = async (req, res) => {
    try{
        const {token, ...newUserData} = req.body; // get the 'token' and 'other data of the user' using 'spread opr.'
        // 'req.body' will contain the updated 'username' & 'email'
        // Why did we took the token away and then store rest things in 'newUserData' --> IT IS BECOZ WE DONT WANT THE 'TOKEN' TO GET UPDATED, ELSE THE USER WILL GET 'LOG OUT', so when we update 'newUserData', the 'TOKEN' doesn't get updated
        // --> WE DONT WANT THE 'TOKEN' TO GET UPDATED, ELSE THE USER WILL GET 'LOG OUT'

        const user = await UserModel.findOne({token: token});

        if(!user) return res.status(404).json({message: "User does not exist !!"});

        const {username, email} = newUserData;

        const existingUser = await UserModel.findOne({$or: [{username}, {email}] });

        /* NOTE:
        'user' is the user whose profile is being updated. This user will have 'TOKEN', as they might have 'LOGGED IN' some time...
        'existingUser' is the user who is updating the profile, i.e., the user who has 'LOGGED IN' to their account

        Now, if the 'Current LOGGED IN existingUser' is same as the 'user' whose profile is being 'updated', 
        then let the 'existingUser' change their profile, else DENY..."You are not an Authorized user to edit this profile!!"
        */

        if(existingUser){ // if there is the 'registered user'
            if(existingUser || String(existingUser._id) !== String(user._id)){ // to check if the profile being updated is not somebody else's profile
                return res.status(401).json({message: "You are not an Authorized user to edit this profile!!"}); 
            }
            // else let the user 'edit' the 'profile details' , coz the user is updating their own profile, not someone else's
            Object.assign(user, newUserData); 
            // --> this could also be done as :-
            // user.username = newUserData.username;
            // user.email = newUserData.email;
            // but 'Object.assign(user, newUserData);' becomes handy & easy, so we use it

            await user.save();
            return res.json({message: "User Updated !!"});
            
        }

    }catch(err){
        return res.status(500).json({message: err.message});
    }
};

export const getUserAndProfile = async(req, res) => {
    try{
        const {token} = req.body;
        const user = await UserModel.findOne({token: token});

        if(!user) return res.status(404).json({message: "User does not exist !!"});

        const userProfile = await ProfileModel.findOne({userId: user._id}).populate('userId', 'name email username profilePicture'); // This '.populate' will get us "name, email, username, profilePicture"
        // 'userProfile' was made at the time of 'Register'

        return res.json(userProfile); // Fetching userProfile
        
    }catch(err){
        return res.status(500).json({message: err.message});
    }
};

// UPDATING 'THINGS' IN 'PROFILE COLLECTION' IN DB
export const updateProfileData = async(req, res) => {
    try{
        const {token, ...newProfileData} = req.body;

        // here 'token' is used not for 'authorization', becoz other may want to someone else's profile, 
        // rather 'token' is here just used to find the 'user', i.e. if the user has 'logged in user or not'
        // Find the user using token
        const user = await UserModel.findOne({token: token});
        if(!user){
            return res.status(404).json({message: "User does not exist !!"});
        }

        // Find the profile belonging to this user
        const profile_to_update = await ProfileModel.findOne({userId: user._id});

        // Update only the fields sent in the request
        Object.assign(profile_to_update, newProfileData);
        // Object.assign(target, source); // and matching of the dictionary's values are done on basis of 'keys', so the 'keys which are being updated, thode keys' names must be same in "target" & "source" '
        
        // Save updated profile
        await profile_to_update.save();

        return res.status(200).json({ message: "Profile Updated" });

    }catch(err){
        return res.status(500).json({message: err.message});
    }
};

// GET ALL THOSE USERS WHEN THE NAME IS SEARCHED
export const getAllUserProfile = async (req, res) => {
    
    try{
        const profiles = await ProfileModel.find().populate('userId', 'name username email profilePicture'); // get details of all the users from the 'USER COLLECTION' as ' REFERENCED BY "userId" ' to the 'PROFILE' details ... so we use find()...instead of findOne({})
        return res.json({ profiles });

    }catch(err){
        return res.status(500).json({message: err.message});
    }
};

// to download linkedin profile as resume pdf
export const downloadProfile= async (req, res) => { 
    try{
        const user_id = req.query.id; // 'id' taken from url
        const userProfile = await ProfileModel.findOne({userId: user_id}).populate('userId', 'name username email profilePicture');

        let outputPathFetched = await convertUserDataToPDF(userProfile); // 'convertUserDataToPDF' is made above
        // 'convertUserDataToPDF()' --> returns the 'outputPath'

        return res.json({ message: outputPathFetched });
    }catch(err){
        return res.status(500).json({message: err.message});
    }
};

// ------------------------------------------------------------------------------------------------------------------------------------------
// FUNCTION RELATED TO CONNECTION ESTABLISHMENT BTW 2 USERS
// send connection request to other members in linkedin
export const sendConnectionRequest = async(req, res) => {
    
    try{
        const {token, connectionId} = req.body; 
        // from 'token' we are getting to know, "who is sending the connection request", so now we don't need the 'userId' of this person
        // from connectionId we get to know, "to whom the request is being sent"

        const user = await UserModel.findOne({token: token});
        if(!user) {
            return res.status(404).json({message: "User does not exist !!"});
        }

        // from connectionId we get to know, "to whom the request is being sent"
        // we will get the user from 'UserModel Collection in DB',  "to whom the response is being sent"
        const connectionUser = await UserModel.findOne({_id: connectionId});
        if(!connectionUser) {
            return res.status(404).json({message: "Connection User was not found !!"});
        }
        // We might think, that we are doing 'send request' which can only be done by the 'button' show in the profile "to whom the response is being sent"
        // But one may use 'Developer tools' like 'Hoppscotch' to 'send request' to that id which may not exist

        // 'existingRequest' is made to check if once the request is sent from the user, they should not be able to send it again-n-again, until 'request denied'
        // else it will fill up the feed of the user "to whom the response is being sent"
        const existingRequest = await ConnectionRequestModel.findOne({userId: user._id, connectionId: connectionUser._id})
        if(existingRequest){
            return res.status(400).json({message: "Request already sent !!"});
        }

        // else If the request is not 'already sent', then send it
        const request = new ConnectionRequestModel({
            userId: user._id, 
            connectionId: connectionUser._id
        });
        await request.save();
        return res.status(200).json({message: "Request Sent"});

    }catch(err){
        return res.status(500).json({message: err.message});
    }
};

export const getMyConnectionsRequests = async (req, res) => {
    try{

        const {token} = req.body;

        const user = await UserModel.findOne({token: token});
        if(!user) {
            return res.status(404).json({message: "User does not exist !!"});
        } 

        // to find all those "ConnectionRequest objects" from the "ConnectionRequestModel Collection in DB" whose 'userId' includes 'my userId' i.e. (me as logged in user), which will show all the connection requests sent BY me
        // so, we used 'find()' instead of 'findOne({})'
        const connections = await ConnectionRequestModel.find({userId: user._id}).populate('connectionId', 'name username email profilePicture');

        return res.json({ connections });

    }catch(err){
        return res.status(500).json({message: err.message});
    }
};

// Connection Requests sent to me
export const connectionsSentToMe = async(req, res) => {
    try{

        const {token} = req.body;

        const user = await UserModel.findOne({token: token});
        if(!user) {
            return res.status(404).json({message: "User does not exist !!"});
        } 

        // to find all those "ConnectionRequest objects" from the "ConnectionRequestModel Collection in DB" whose 'connectionId' includes 'my userId' i.e. (me as logged in user), which will show all the connection requests sent TO me
        // so, we used 'find()' instead of 'findOne({})'
        const connections = await ConnectionRequestModel.find({connectionId: user._id}).populate('connectionId', 'name username email profilePicture');
        // COZ HERE, 'connectionId' stored that user's id "to whom the request is sent"
        // &, 'userId' stores 'my userId', i.e., (me as logged in user)

        return res.json(connections); // NOTE: DON'T CLOSE 'connections' WITHIN CURLY BRACES AS {connections}, COZ 'connections' IS ALREADY A LIST

    }catch(err){
        return res.status(500).json({message: err.message});
    }
};

// Connection Accepted or Rejected
export const acceptConnectionRequest = async (req, res) => {
    try{

        const {token, requestId, action_type} = req.body; // 'action_type' --> represents connection 'accepted' or 'rejected'

        const user = await UserModel.findOne({token: token});
        if(!user) {
            return res.status(404).json({message: "User does not exist !!"});
        } 

        const connection = await ConnectionRequestModel.findOne({_id: requestId});
        if(!connection) {
            return res.status(404).json({message: "Connection not found !!"});
        }

        if(action_type === "accept"){
            connection.status_accepted = true; // Then we will show them in connections whoever sent it 
        }else{
            connection.status_accepted = false; // else we will "remove" that "connection request from the feed" of the user "to whom the request is sent"
        }

        await connection.save();
        return res.json({message: "Request Updated"});

    }catch(err){
        return res.status(500).json({message: err.message});
    }
};


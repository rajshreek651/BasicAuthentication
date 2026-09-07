// To manage 'USER POST REQUESTS' --> we use 'user.routes.js'

import { Router } from "express";
import { register, login, uploadProfilePicture, updateUserProfile, getUserAndProfile, updateProfileData, getAllUserProfile, downloadProfile, sendConnectionRequest, getMyConnectionsRequests, connectionsSentToMe, acceptConnectionRequest} from "../controllers/user.controller.js";

import multer from "multer";
const router = Router();

// for profile_picture uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/') // 'uploads/' folder made by us that we can store in our storage by 'compressing the images' in order to consume 'less bandwidth', but for uploading 'videos or posts' which consumes high bandwidth we have to use other services !!!
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
})
// Similarly, we can make for video uploads, posts uploads, etc. using 'multer' and giving the 'desired destination name as per the service used'

const upload = multer({storage: storage,
                       fileFilter: (req, file, cb) => {
                            if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
                                cb(null, true);
                            } else {
                                cb(new Error("Only JPG and PNG images are allowed"));
                            }
                        }
});

// Route to update profile_picture
router.route('/update_profile_picture')
    .post(upload.single('profile_picture'), uploadProfilePicture); // 'uploadProfilePicture' is from '../controllers/user.controller.js'

// Authentication routes
router.route('/register').post(register);
router.route('/login').post(login);

// Route to update user username, email, etc...
router.route("/user_update").post(updateUserProfile);
// This above router will just update 'email' & 'username'
// For rest things(like, education, add_work, experiences, etc...) to update we will make another route
// For this we first need to check, what the user is providing (Is it 'education' or 'add_work' or 'experiences')
router.route("/get_user_and_profile").get(getUserAndProfile);
// then we can update the profile
router.route("/update_profile_data").post(updateProfileData)
// to get all users profile with the matching name as searched
router.route("/user/get_all_users").get(getAllUserProfile);

// to download linkedin profile as resume pdf
router.route("/user/download_resume").get(downloadProfile); 
// While testing, Search as--> http://localhost:3000/user/download_resume?id=6a92808769bec9a1e44be5e1
// The above 'search' will download the pdf in 'uploads' folder, the copy the pdf name and search
// then can search the pdf as e.g. -->http://localhost:3000/2d23dcc0084d5a2e72f46273831257780da8b94b9b470e7077df8e43fc6a6987.pdf

// send connection request to other members in linkedin
router.route("/user/send_connection_request").post(sendConnectionRequest);

// get all connections 'requests' sent BY me
router.route("/user/get_ConnectionRequests_sent_by_me").get(getMyConnectionsRequests);

// get all Connections Requests sent TO me
router.route("/user/get_ConnectionsRequests_sent_to_me").get(connectionsSentToMe);

// Connection Accepted or Rejected
router.route("/user/accept_connection_request").post(acceptConnectionRequest);

export default router; // import this to './server.js'
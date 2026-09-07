// To manage 'USER POST REQUESTS' --> we use 'user.routes.js'

import { Router } from "express";
import { register, login} from "../controllers/user.controller.js";

const router = Router();

// Authentication routes
router.route('/register').post(register);
router.route('/login').post(login);

export default router; // import this to './server.js'

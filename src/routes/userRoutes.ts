import {signUp,signIn,signOut,profile,adminPanel} from "../controller/userController"
import {Router} from "express"
import { auth,authorize} from "../middleware/userMiddleware"

const router =Router()

router.post("/signUp",signUp)
router.post("/signIn",signIn)
router.get("/signOut",signOut)
router.get("/profile",auth,profile)
router.get("/admin",auth,authorize,adminPanel)

export {router};
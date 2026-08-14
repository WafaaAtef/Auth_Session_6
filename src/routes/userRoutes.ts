import {signUp,signIn,signOut,profile} from "../controller/userController"
import {Router} from "express"
import { auth} from "../middleware/userMiddleware"

const router =Router()

router.post("/signUp",signUp)
router.post("/signIn",signIn)
router.get("/signOut",signOut)
router.get("/profile",auth,profile)

export {router};
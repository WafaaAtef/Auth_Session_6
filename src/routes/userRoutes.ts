import {signUp,signIn,signOut,profile,DeleteUser,ShowAllUsers} from "../controller/userController"
import {Router} from "express"
import { auth,authorize} from "../middleware/userMiddleware"

const router =Router()

router.post("/signUp",signUp)
router.post("/signIn",signIn)
router.get("/signOut",signOut)
router.get("/profile",auth,profile)
router.get("/admin/DeleteUser",auth,authorize,DeleteUser)
router.get("/admin/ShowAllUsers",auth,authorize,ShowAllUsers)

export {router};
import { Router } from "express";
import { UserController } from "../controller/users-controller";
import { ensureAuthenticated } from "../middleware/ensure-authenticated";
import { verifyUserAuthorization } from "../middleware/verifyUserAuthorization";

const userRoutes = Router()
const userController = new UserController()


userRoutes.post("/", userController.create)

userRoutes.use(ensureAuthenticated, verifyUserAuthorization(["customer"]))

userRoutes.put("/", userController.update)
userRoutes.delete("/",userController.delete)

export { userRoutes }
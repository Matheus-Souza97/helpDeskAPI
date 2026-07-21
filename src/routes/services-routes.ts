import { Router } from "express";
import { ServicesController } from "../controller/services-controller";
import { ensureAuthenticated } from "../middleware/ensure-authenticated";
import { verifyUserAuthorization } from "../middleware/verifyUserAuthorization";

const servicesRoutes = Router()
const servicesController = new ServicesController()

servicesRoutes.use(ensureAuthenticated, verifyUserAuthorization(["admin"]))

servicesRoutes.post("/", servicesController.create)
servicesRoutes.get("/", servicesController.index)
servicesRoutes.put("/update/:id", servicesController.update)
servicesRoutes.put("/disableServices/:id", servicesController.disableServices)

export { servicesRoutes }
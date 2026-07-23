import { Router } from "express";
import { SupportController } from "../controller/support-controller";
import { ensureAuthenticated } from "../middleware/ensure-authenticated";
import { verifyUserAuthorization } from "../middleware/verifyUserAuthorization";

const supportRoutes = Router()
const supportController = new SupportController()

supportRoutes.use(ensureAuthenticated, verifyUserAuthorization(["support"]))

supportRoutes.get("/", supportController.listAllTickets)
supportRoutes.post("/:id", supportController.additionalServices)
supportRoutes.put("/:id", supportController.statusUpdated)

export { supportRoutes }
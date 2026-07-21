import { Router } from "express";
import { SupportController } from "../controller/support-controller";
import { ensureAuthenticated } from "../middleware/ensure-authenticated";
import { verifyUserAuthorization } from "../middleware/verifyUserAuthorization";

const supportRoutes = Router()
const supportController = new SupportController()

supportRoutes.use(ensureAuthenticated, verifyUserAuthorization(["support"]))

supportRoutes.get("/", supportController.listAllTickets)

export { supportRoutes }
import { ensureAuthenticated } from "../middleware/ensure-authenticated";
import { verifyUserAuthorization } from "../middleware/verifyUserAuthorization";
import { CustomerTicketController } from "../controller/custumer-ticket-contoller";
import { Router } from "express";

const customerTicketRoutes = Router()
const customerTicketController = new CustomerTicketController()

customerTicketRoutes.use(ensureAuthenticated, verifyUserAuthorization(["customer"]))

customerTicketRoutes.post("/", customerTicketController.create)
customerTicketRoutes.get("/", customerTicketController.index)

export { customerTicketRoutes }
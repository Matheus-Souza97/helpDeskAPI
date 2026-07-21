import { Router } from "express";
import { ensureAuthenticated } from "../middleware/ensure-authenticated";
import { verifyUserAuthorization } from "../middleware/verifyUserAuthorization";
import { AdminController } from "../controller/admin-controller";

const adminRoutes = Router()
const adminController = new AdminController()

adminRoutes.use(ensureAuthenticated, verifyUserAuthorization(["admin"]))

adminRoutes.post("/", adminController.createSupport)
adminRoutes.get("/tickets", adminController.listAllTickets)
adminRoutes.get("/supports", adminController.listAllSupports)
adminRoutes.get("/customers", adminController.listAllCustomers)
adminRoutes.put("/support/:id", adminController.updatedSupport)
adminRoutes.put("/customer/:id", adminController.updatedCustomer)
adminRoutes.delete("/support/:id", adminController.deletedSupport)
adminRoutes.delete("/customer/:id", adminController.deletedCustommer)

export { adminRoutes }
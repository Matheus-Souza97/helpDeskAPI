import { Router } from "express";
import { userRoutes } from "./users-routes";
import { sessionRoutes } from "./session-routes";
import { servicesRoutes } from "./services-routes";
import { customerTicketRoutes } from "./customer-ticket-routes";
import { adminRoutes } from "./admin-routes";
import { supportRoutes } from "./support-routes";

const routes = Router()

routes.use("/users", userRoutes)
routes.use("/admin", adminRoutes)
routes.use("/support", supportRoutes)
routes.use("/session", sessionRoutes)
routes.use("/services", servicesRoutes)
routes.use("/customer", customerTicketRoutes)

export { routes }
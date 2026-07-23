import { AppError } from "../utils/AppError";
import { Request, Response } from "express";
import { prisma } from "../database/prisma";
import { number, string, z } from "zod"
import { CATEGORIES } from "../utils/categories";

class SupportController{
  async listAllTickets(request:Request, response:Response){
    const {id, role} = request.user!

    if(role !== "support"){
      throw new AppError("Não autorizado!",403)
    }

    const tickets = await prisma.ticketAssignment.findMany({where: {supportId:id},
      select: {
        id:true,
        ticket: {
          select: {
            name:true,
            category:true,
            description:true,
            initialPrice:true,
            finalPrice:true,
            createdAt:true,
            ticketAssignment: {
              select: {
                additionalServices:true
              }
            },
            user: {
              select: {
                name:true
              }
            }
          }
        }
      }
    })

    const additionalServices = tickets.flatMap(ticket => ticket.ticket.ticketAssignment?.additionalServices ?? [])

    const services = await prisma.services.findMany({
      where: {
        name: {
          in: additionalServices
        }
      }})

      const serviceMap = new Map(
        services.map(service => [service.name, Number(service.amount)])
      )
      

    const result = tickets.map(ticket => ({id:ticket.id, name:ticket.ticket.name, description:ticket.ticket.description, cetegory:ticket.ticket.category, initialPrice:ticket.ticket.initialPrice, finalPrice:ticket.ticket.finalPrice, createdAt:ticket.ticket.createdAt, customer:ticket.ticket.user.name, additionalServices:ticket.ticket.ticketAssignment?.additionalServices.map(service => ({name:service, price:serviceMap.get(service)}))}))

    return response.status(200).json({result})
  }

  async additionalServices(request:Request, response:Response){
    const paramsSchema = z.object({
      id : z.string().uuid("ID inválido")
    })

    const { id } = paramsSchema.parse(request.params)

    const verifyTicket = await prisma.ticket.findUnique({where: { id }})

    if(!verifyTicket){
      throw new AppError("Ticket não encontrado",404)
    }

    const bodySchema = z.object({
      service: z.array(z.enum(CATEGORIES, "Categoria inválida")).min(1, "Informe ao menos uma categoria")
    })

    const { service } = bodySchema.parse(request.body)

   
    const price = await prisma.services.findMany({where: {name: {in: service}}})

    const additional_services = await prisma.ticketAssignment.findUnique({where: {ticketId:id}})

    const currentServices = additional_services?.additionalServices ?? []

    const updatedAddicionalService = [...currentServices, ...service]

    const allService = await prisma.services.findMany({
      where: {
        name: {
          in: updatedAddicionalService
        }
      }
    })

    const totalAdditional = allService.reduce((total,price) => total + Number(price.amount), 0)


    const ticket = await prisma.ticket.findUnique({where: {id}})


    const finalPrice = Number(ticket?.initialPrice ?? 0) + totalAdditional


    const result = await prisma.ticketAssignment.update({where: {ticketId:id},
      data: {
        additionalServices:updatedAddicionalService,
        total: finalPrice 
      }
    })

    await prisma.ticket.update({
      where: {id},
      data: {
        finalPrice: finalPrice
      }
    })

    return response.status(200).json({result, finalPrice})
  }
  
}

export { SupportController }
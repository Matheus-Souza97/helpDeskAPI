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

    const results = await prisma.ticketAssignment.findMany({where: {supportId:id},
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

    return response.status(200).json({results})
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
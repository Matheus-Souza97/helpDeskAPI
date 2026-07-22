import { Request, Response } from "express";
import { CATEGORIES } from "../utils/categories";
import { prisma } from "../database/prisma";
import { z } from "zod"
import { AppError } from "../utils/AppError";

class CustomerTicketController{
  async create(request:Request, response:Response){
    const bodySchema = z.object({
      name: z.string().min(15, "O nome da solicitacão deve ser mais especifico"),
      description: z.string().min(15, "Especifique a solicitacão com mais detalhes"),
      category: z.enum(CATEGORIES, "Categoria invalida")
    })

    const { name, description, category } = bodySchema.parse(request.body)

    const ticket = await prisma.ticket.create({
      data: {
        name,
        description,
        category,
        userId: request.user!.id
      }
    })
    
    const hour = ticket.createdAt.getHours().toString().padStart(2, "0") + ":00"
    

    const supportDefine = await prisma.support.findMany({
      where: {
        supportHours: {
          has: hour
        }
      }, select: {
        id:true,
        name:true,
        ticketAssignments: {
          select: {
            id:true
          }
        }
      }
    })

    if(!supportDefine){
      throw new AppError("Nenhum tecnico disponivel no momento. Tente novamente mais tarde",400)
    }

    const support = supportDefine.sort((a, b) => a.ticketAssignments.length - b.ticketAssignments.length)[0]

    const support_Id = support.id
    const ticket_Id = ticket.id


    await prisma.ticketAssignment.create({
      data: {
        supportId: support_Id,
        ticketId: ticket_Id
      }
    })

    

    return response.status(201).json({ticket, supportDefine, support})
  }
  async index(request:Request, response:Response){
    const { id } = request.user!

    const tickets = await prisma.ticket.findMany({where: {userId: id},
      select: {
        ticketAssignment: {
          select: {
            support: {
              select: {
                name:true
              }
            }
          }
        }, name:true,
        description:true,
        category:true,
        status:true,
        createdAt:true
      }
    
    })

    return response.status(200).json(tickets)
  }
}

export { CustomerTicketController }
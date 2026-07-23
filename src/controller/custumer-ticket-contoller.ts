import { Request, Response } from "express";
import { CATEGORIES } from "../utils/categories";
import { prisma } from "../database/prisma";
import { z } from "zod"
import { AppError } from "../utils/AppError";

class CustomerTicketController{
  async create(request:Request, response:Response){
    const bodySchema = z.object({
      name: z.string().min(5, "O nome da solicitacão deve ser mais especifico"),
      description: z.string().min(15, "Especifique a solicitacão com mais detalhes"),
      category: z.enum(CATEGORIES, "Categoria invalida")
    })

    const { name, description, category } = bodySchema.parse(request.body)

    const price = await prisma.services.findFirst({where: {name: category}})

    if(!price){
      throw new AppError("Categoria não encontrada, infome uma categoria válida.",404)
    }

    console.log({
      name,
      description,
      category,
      initialPrice: price?.amount,
      userId: request.user!.id,
      price
    })

    const ticket = await prisma.ticket.create({
      data: {
        name,
        description,
        category,
        finalPrice: price.amount,
        initialPrice: price.amount,
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
        ticketId: ticket_Id,
        total: price.amount
      }
    })

    
    return response.status(201).json({ticket, support})
  }
  async index(request:Request, response:Response){
    const { id } = request.user!

    const tickets = await prisma.ticket.findMany({where: {userId: id},
      select: {
        ticketAssignment: {
          select: {
            additionalServices:true,
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
        initialPrice:true,
        finalPrice:true,
        createdAt:true,
      }
    
    })


    const additionalServices = tickets.map(ticket => ({additional_services:ticket.ticketAssignment?.additionalServices}))

    const result = tickets.map(ticket => ({support:ticket.ticketAssignment?.support.name, name:ticket.name, description:ticket.description, category:ticket.category, initialPrice:ticket.initialPrice, finalPrice:ticket.finalPrice,  stattus:ticket.status}))

    return response.status(200).json(result)
  }
}

export { CustomerTicketController }
import { SUPPORT_HOURS } from "../utils/supportHouts";
import { AppError } from "../utils/AppError";
import { Request, Response } from "express";
import { prisma } from "../database/prisma";
import { hash } from "bcrypt";
import { z } from "zod";
import { format } from "node:path";

class AdminController{
  async createSupport(request:Request, response:Response){
    const bodySchema = z.object({
      name: z.string().trim().min(3, "Nome menor que o permitido").max(200, "Nome excede o tamanho máximo permitido"),
      email: z.string().trim().email("E-mail inválido"),
      password: z.string().min(6, "O password deve ter no minimo 6 caracteres"),
      supportHours: z.array(z.enum(SUPPORT_HOURS)).min(1)
    })

    const { name, email, password, supportHours } = bodySchema.parse(request.body)

    const [ support, user ] = await Promise.all([
       prisma.support.findUnique({where: {email}}),
       prisma.user.findUnique({where: {email}})
    ])

    if(support || user){
      throw new AppError("E-mail indisponivel",409)
    }

    const hashedPassword = await hash(password, 8)

    const createSupport = await prisma.support.create({
      data: {
        name,
        email,
        password: hashedPassword,
        supportHours
      }
    })

    const { password:_, ...supportWithoutPassword } = createSupport

    return response.status(201).json(supportWithoutPassword)
  }

  async listAllSupports(request:Request, response:Response){
    const result = await prisma.support.findMany({
      select: {
        id:true,
        name:true,
        email:true,
        supportHours:true,
        createdAt:true
      }
    })

    return response.status(200).json(result)
  }

  async listAllCustomers(request:Request, response:Response){
    const result = await prisma.user.findMany({select:{
      id:true,
      name:true,
      email:true
    }})
    
    return response.status(200).json(result)
  }

  async listAllTickets(request:Request, response:Response){
    const results = await prisma.ticket.findMany({
      select: {
        ticketAssignment: {
          select: {
            support: {
              select: {
                name:true
              }
            }
          }
        },
        user: {
          select: {
            name:true
          }
        },
        id:true,
        name:true,
        description:true,
        category:true,
        status:true,
        createdAt:true,
      }
    })

    return response.status(200).json({results})
  }

  async updatedSupport(request:Request, response:Response){
    const paramsSchema = z.object({
      id: z.string().uuid("ID inválido")
    })

    const { id } = paramsSchema.parse(request.params)

    const support = await prisma.support.findUnique({where: { id }})

    if(!support){
      throw new AppError("Técnico não encontrado",404)
    }
    
    const bodySchema = z.object({
      name: z.string().trim().min(3, "Nome menor que o permitido").max(200, "Nome excede o tamanho máximo permitido").optional(),
      email: z.string().trim().email("E-mail inválido").optional(),
      supportHours: z.array(z.enum(SUPPORT_HOURS)).min(1).optional()
    })

    const { name, email, supportHours } = bodySchema.parse(request.body)

    if(email){
      const [ userEmailExists, supportEmailExists ] = await Promise.all([
        prisma.user.findUnique({where: {email}}),
        prisma.support.findUnique({where: {email}})
      ])

      if(userEmailExists){
        throw new AppError("E-mail indisponivel",409)
      }

      if(supportEmailExists && supportEmailExists.id !== id){
        throw new AppError("E-mail indisponivel",409)
      }
    }

    const updatedSupport = await prisma.support.update({where: {id},
    data: {
      name,
      email,
      supportHours
    }})

    const { password:_, ...supportWithoutPassword} = updatedSupport

    return response.status(200).json(supportWithoutPassword)
  }

  async updatedCustomer(request:Request, response:Response){
    const paramsSchema = z.object({
      id: z.string().uuid("ID inválido")
    })

    const { id } = paramsSchema.parse(request.params)

    const userExists = await prisma.user.findUnique({where: {id}})

    if(!userExists){
      throw new AppError("Usuario não encontrado.", 404)
    }

    const bodySchema = z.object({
      name: z.string().trim().min(3, "Nome menor que o permitido").max(200, "Nome excede o tamanho máximo permitido").optional(),
      email: z.string().trim().email("E-mail inválido").optional(),
    })

    const { name, email } = bodySchema.parse(request.body)

    if(email){
      const [userEmailExists, supportEmailExists] = await Promise.all([
        prisma.user.findUnique({where: {email}}),
        prisma.support.findUnique({where: {email}})
      ])

      if(userEmailExists && userEmailExists.id !== id){
        throw new AppError("E-mail indisponivel", 409)
      }

      if(supportEmailExists){
        throw new AppError("E-mail indisponivel", 409)
      }
    }

    const updatedUser = await prisma.user.update({where: {id},
    data: {
      name,
      email
    }})

    const { password:_, ...userWithoutPassword } = updatedUser

    return response.status(200).json(userWithoutPassword)
  }

  async deletedSupport(request:Request, response:Response){
    const paramsSchema = z.object({
      id: z.string().uuid("ID invalido")
    })

    const { id } = paramsSchema.parse(request.params)

    const userExists = await prisma.support.findUnique({where: {id}})

    if(!userExists){
      throw new AppError("Tecnico não encontrado.", 404)
    }

    await prisma.support.delete({where: {id}})

    return response.status(200).json({message: "Deletado com sucesso"})
  }

  async deletedCustommer(request:Request, response:Response){
    const paramsSchema = z.object({
      id: z.string().uuid("ID inválido")
    })

    const { id } = paramsSchema.parse(request.params)

    const userExists = await prisma.user.findUnique({where: {id}})

    if(!userExists){
      throw new AppError("Usuario não encontrado", 404)
    }

    await prisma.$transaction([
      prisma.ticket.deleteMany({where: {userId:id}}),
      prisma.user.delete({where: {id}})
    ])

    return response.status(200).json({message: "Deletado com sucesso."})
  }

}

export { AdminController }


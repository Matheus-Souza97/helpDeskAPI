import { Response, Request } from "express";
import { AppError } from "../utils/AppError";
import { z } from "zod"
import { prisma } from "../database/prisma";
import { StatusRole } from "../../generated/prisma/enums";

class ServicesController{
  async create(request:Request, response:Response){
    const bodySchema = z.object({
      name: z.string(),
      amount: z.coerce.number().positive()
    })

    const { name, amount } = bodySchema.parse(request.body)

    const services = await prisma.services.create({
      data: {
        name,
        amount
      }
    })

    return response.status(201).json(services)

  }

  async index(request:Request, response:Response){
    const services = await prisma.services.findMany()
    return response.status(200).json(services)
  }

  async update(request:Request, response:Response){
    const paramsSchema = z.object({
      id: z.string().uuid("ID inválido")
    })

    const { id } = paramsSchema.parse(request.params) 

    const idExicts = await prisma.services.findUnique({where: {id}})

    if(!idExicts) {
      throw new AppError("Service ID Notfound", 404)
    }

    const bodySchema = z.object({
      name: z.string().optional(),
      amount: z.coerce.number().positive("Informe um valor positivo e maior que zero para o servico").optional(),
      status: z.enum(StatusRole, "Status inválido").optional()
    })

    const { name, amount, status } = bodySchema.parse(request.body)

    const service = await prisma.services.update({where: {id},
      data: {
        name,
        amount
      }
    })

    return response.status(201).json(service)
  }

  async disableServices(request:Request, response:Response){
    const paramsSchema = z.object({
      id: z.string().uuid("ID inválido")
    })

    const { id } = paramsSchema.parse(request.params) 

    const idExicts = await prisma.services.findUnique({where: {id}})

    if(!idExicts) {
      throw new AppError("Service ID Notfound", 404)
    }

    const bodySchema = z.object({
      status: z.enum(StatusRole, "Status inválido")
    })

    const { status } = bodySchema.parse(request.body)

    const service = await prisma.services.update({where: {id},
      data: {
        status
      }
    })

    return response.status(200).json(service)
  }
}

export { ServicesController }
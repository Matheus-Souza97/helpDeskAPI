import { Request, Response } from "express";
import { prisma } from "../database/prisma";
import { AppError } from "../utils/AppError";
import { hash } from "bcrypt"
import { z } from "zod"

class UserController{
  async create(request:Request, response:Response){
  const bodySchema = z.object({
    name: z.string().trim().min(3, "Nome menor que o permitido").max(200, "Nome excede o tamanho máximo permitido"),
    email: z.string().trim().email("E-mail inválido"),
    password: z.string().min(6, "O password deve ter no minimo 6 caracteres")
  })

  const { name, email, password } = bodySchema.parse(request.body)

  const [ support, user ] = await Promise.all([
       prisma.support.findUnique({where: {email}}),
       prisma.user.findUnique({where: {email}})
    ])

    if(support || user){
      throw new AppError("E-mail indisponivel",409)
    }

  const hashedPassword = await hash(password, 8)

  const createUser = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword
    }
  })

  const {password:_, ...userWithoutPassword} = createUser

    return response.status(201).json(userWithoutPassword)
  }

  async update(request:Request, response:Response){
    
    const {id} = request.user!

    const bodySchema = z.object({
      name: z.string().trim().min(3, "Nome menor que o permitido").max(200, "Nome excede o tamanho máximo permitido").optional(),
      email: z.string().trim().email("E-mail inválido").optional(),
      password: z.string().min(6, "O password deve ter no minimo 6 caracteres").optional()
    })

    const { name, email, password } = bodySchema.parse(request.body)

    const userExists = await prisma.user.findUnique({where: {id}})

    if(!userExists){
      throw new AppError("Usuário não encontrado", 404)
    }

    if(email){
      const [userEmailExists, supportEmailExists] = await Promise.all([
        prisma.user.findUnique({where: {email}}),
        prisma.support.findUnique({where: {email}})
      ])

      if(userEmailExists && userEmailExists.id !== id){
        throw new AppError("Email indisponivel", 409)
      }
      
      if(supportEmailExists){
        throw new AppError("Email indisponivel", 409)
      }
    }

    const data: {
      name?:string
      email?:string
      password?:string
    } = {
      name,
      email
    }

    if(password){
      data.password = await hash(password, 8)
    }

    const user = await prisma.user.update({
      where: {id},
      data
    })

    const { password:_,...userWithoutPassword } = user

    return response.status(200).json(userWithoutPassword)
  }

  async delete(request:Request, response:Response){

    const { id } = request.user!

    await prisma.$transaction([
      
      prisma.ticket.deleteMany({where:{userId:id}}),
      prisma.user.delete({where: {id}})

    ])

    return response.status(200).json({message: "ok"})
  }
}

export { UserController }
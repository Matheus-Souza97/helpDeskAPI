import { Request, Response } from "express";
import { AppError } from "../utils/AppError";
import { authConfig } from "../configs/auth";
import { prisma } from "../database/prisma";
import { compare } from "bcrypt";
import { sign } from "jsonwebtoken"
import { z } from "zod"

class SessionController{
  async create(request:Request, response:Response){
    const bodySchema = z.object({
      email: z.string().trim().email("E-mail ou senha inválido"),
      password: z.string().min(6, "E-mail ou senha inválido")
    })

    const { email, password } = bodySchema.parse(request.body)

    const [user, support] = await Promise.all([
      prisma.user.findUnique({where: {email}}),
      prisma.support.findUnique({where: {email}})
    ])

    if(!user && !support){
      throw new AppError("E-mail ou senha iválidos", 401)
    }

    if(user){
      const passwordMatched = await compare(password, user.password)
  
      if(!passwordMatched){
        throw new AppError("E-mail ou senha iválidos", 401)
      }

      const { secret, expiresIn } = authConfig.jwt
      const token = sign({role:user.role}, secret, {
        subject: user.id,
        expiresIn
      })
      return response.status(200).json(token)
    }

    if(support){
      const passwordMatched = await compare(password, support.password)
  
      if(!passwordMatched){
        throw new AppError("E-mail ou senha iválidos", 401)
      }

      const { secret, expiresIn } = authConfig.jwt
      const token = sign({role:support.role}, secret, {
        subject: support.id,
        expiresIn
      })

      return response.status(200).json(token)

    }
    
  }
}

export { SessionController }
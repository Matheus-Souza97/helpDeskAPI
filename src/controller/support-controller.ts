import { AppError } from "../utils/AppError";
import { Request, Response } from "express";
import { prisma } from "../database/prisma";
import { z } from "zod"

class SupportController{
  async listAllTickets(request:Request, response:Response){
    const {id, role} = request.user!

    if(role !== "support"){
      throw new AppError("Não autorizado!",403)
    }

    const results = await prisma.ticketAssignment.findMany({where: {supportId:id}})

    return response.status(200).json({results})
  }
  
}

export { SupportController }
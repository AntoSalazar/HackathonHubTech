import { NextFunction, Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Person } from "../entity/Person";


export const authorize = (roleNames: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.currentUser || !req.currentUser.id) {
      return res.status(401).json({ message: "Unauthorized: User not authenticated" });
    }
    
    try {
      const personRepository = AppDataSource.getRepository(Person);
      const person = await personRepository.findOne({
        where: { id: req.currentUser.id },
        relations: ['roles']
      });
      
      if (!person) {
        return res.status(401).json({ message: "Unauthorized: User not found" });
      }
      
      // Check if user has any of the required roles
      const hasRequiredRole = person.roles.some(role => 
        roleNames.includes(role.name)
      );
      
      if (!hasRequiredRole) {
        return res.status(403).json({ message: "Forbidden: Insufficient permissions" });
      }
      
      next();
    } catch (error) {
      console.error("Authorization error:", error);
      return res.status(500).json({ message: "Authorization error" });
    }
  };
};
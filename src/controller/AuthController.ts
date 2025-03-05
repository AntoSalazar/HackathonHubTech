// controllers/auth.controller.ts
import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Person } from "../entity/Person";
import { Encrypt } from "../helpers/encrypt";
import { Role } from "../entity/Role";

export class AuthController {
  static async signup(req: Request, res: Response) {
    try {
      const {
        first_name,
        last_name,
        email,
        password,
        picture,
        biometric_fingerprint,
        category_id,
        role_ids
      } = req.body;
      
      if (!email || !password || !first_name || !last_name) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      const personRepository = AppDataSource.getRepository(Person);
      const roleRepository = AppDataSource.getRepository(Role);
      
      // Check if user already exists
      const existingPerson = await personRepository.findOne({ where: { email } });
      if (existingPerson) {
        return res.status(409).json({ message: "Email already in use" });
      }
      
      // Create new person
      const person = new Person();
      person.first_name = first_name;
      person.last_name = last_name;
      person.email = email;
      person.password = await Encrypt.hashPassword(password);
      
      if (picture) {
        person.picture = picture;
      }
      
      if (biometric_fingerprint) {
        person.biometric_fingerprint = biometric_fingerprint;
      }
      
      if (category_id) {
        person.category_id = category_id;
      }
      
      // Save person first
      const savedPerson = await personRepository.save(person);
      
      // Add roles if provided
      if (role_ids && role_ids.length > 0) {
        const roles = await roleRepository.findByIds(role_ids);
        savedPerson.roles = roles;
        await personRepository.save(savedPerson);
      } else {
        // Assign default 'user' role if no roles provided
        const defaultRole = await roleRepository.findOne({ where: { name: 'user' } });
        if (defaultRole) {
          savedPerson.roles = [defaultRole];
          await personRepository.save(savedPerson);
        }
      }
      
      // Generate token
      const token = Encrypt.generateToken({ id: savedPerson.id });
      
      // Return user data (excluding password)
      const { password: _, ...personData } = savedPerson;
      
      return res.status(201).json({
        message: "Signup successful",
        user: personData,
        token
      });
    } catch (error) {
      console.error("Signup error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
      }

      const personRepository = AppDataSource.getRepository(Person);
      const person = await personRepository.findOne({ 
        where: { email },
        relations: ['roles'] 
      });

      if (!person) {
        return res.status(404).json({ message: "User not found" });
      }

      const isPasswordValid = Encrypt.comparePassword(person.password, password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = Encrypt.generateToken({ id: person.id });

      // Return user data (excluding password)
      const { password: _, ...personData } = person;

      return res.status(200).json({ 
        message: "Login successful", 
        user: personData, 
        token 
      });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  static async getProfile(req: Request, res: Response) {
    try {
      if (!req.currentUser || !req.currentUser.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const personRepository = AppDataSource.getRepository(Person);
      const person = await personRepository.findOne({
        where: { id: req.currentUser.id },
        relations: ['category', 'roles']
      });
      
      if (!person) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Return user data (excluding password)
      const { password, ...personData } = person;
      
      return res.status(200).json(personData);
    } catch (error) {
      console.error("Get profile error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
}
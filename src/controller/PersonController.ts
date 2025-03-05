import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Person } from '../entity/Person';
import { Category } from '../entity/Category';
import { Role } from '../entity/Role';

export class PersonController {
  
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const personRepository = AppDataSource.getRepository(Person);
      const persons = await personRepository.find({
        relations: ['category', 'roles']
      });
      res.json(persons);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching persons', error });
    }
  }

  async getOne(req: Request, res: Response): Promise<void> {
    try {
      const personRepository = AppDataSource.getRepository(Person);
      const id = parseInt(req.params.id);
      
      const person = await personRepository.findOne({ 
        where: { id },
        relations: ['category', 'roles']
      });
      
      if (!person) {
        res.status(404).json({ message: 'Person not found' });
        return;
      }
      
      res.json(person);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching person', error });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const personRepository = AppDataSource.getRepository(Person);
      const categoryRepository = AppDataSource.getRepository(Category);
      const roleRepository = AppDataSource.getRepository(Role);
      
      const {
        first_name,
        last_name,
        email,
        picture,
        biometric_fingerprint,
        category_id,
        role_ids
      } = req.body;
      
      const person = new Person();
      person.first_name = first_name;
      person.last_name = last_name;
      person.email = email;
      
      if (picture) {
        person.picture = picture;
      }
      
      if (biometric_fingerprint) {
        person.biometric_fingerprint = biometric_fingerprint;
      }
      
      if (category_id) {
        const category = await categoryRepository.findOne({ where: { id: category_id } });
        if (!category) {
          res.status(404).json({ message: 'Category not found' });
          return;
        }
        person.category_id = category_id;
      }
      
      const savedPerson = await personRepository.save(person);
      
      if (role_ids && role_ids.length > 0) {
        const roles = await roleRepository.findByIds(role_ids);
        savedPerson.roles = roles;
        await personRepository.save(savedPerson);
      }
      
      const result = await personRepository.findOne({
        where: { id: savedPerson.id },
        relations: ['category', 'roles']
      });
      
      res.status(201).json(result);
    } catch (error) {
      if (error.code === '23505') {
        res.status(409).json({ message: 'Person with this email already exists' });
      } else {
        res.status(500).json({ message: 'Error creating person', error });
      }
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const personRepository = AppDataSource.getRepository(Person);
      const categoryRepository = AppDataSource.getRepository(Category);
      const roleRepository = AppDataSource.getRepository(Role);
      
      const id = parseInt(req.params.id);
      
      const person = await personRepository.findOne({
        where: { id },
        relations: ['roles']
      });
      
      if (!person) {
        res.status(404).json({ message: 'Person not found' });
        return;
      }
      
      const {
        first_name,
        last_name,
        email,
        picture,
        biometric_fingerprint,
        category_id,
        role_ids
      } = req.body;
      
      if (first_name) person.first_name = first_name;
      if (last_name) person.last_name = last_name;
      if (email) person.email = email;
      if (picture) person.picture = picture;
      if (biometric_fingerprint) person.biometric_fingerprint = biometric_fingerprint;
      
      if (category_id) {
        const category = await categoryRepository.findOne({ where: { id: category_id } });
        if (!category) {
          res.status(404).json({ message: 'Category not found' });
          return;
        }
        person.category_id = category_id;
      }
      
      if (role_ids) {
        const roles = await roleRepository.findByIds(role_ids);
        person.roles = roles;
      }
      
      await personRepository.save(person);
      
      const result = await personRepository.findOne({
        where: { id },
        relations: ['category', 'roles']
      });
      
      res.json(result);
    } catch (error) {
      if (error.code === '23505') {
        res.status(409).json({ message: 'Person with this email already exists' });
      } else {
        res.status(500).json({ message: 'Error updating person', error });
      }
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const personRepository = AppDataSource.getRepository(Person);
      const id = parseInt(req.params.id);
      
      const deleteResult = await personRepository.delete(id);
      
      if (deleteResult.affected === 0) {
        res.status(404).json({ message: 'Person not found' });
        return;
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Error deleting person', error });
    }
  }

  async addRole(req: Request, res: Response): Promise<void> {
    try {
      const personRepository = AppDataSource.getRepository(Person);
      const roleRepository = AppDataSource.getRepository(Role);
      
      const personId = parseInt(req.params.id);
      const roleId = parseInt(req.params.roleId);
      
      const person = await personRepository.findOne({
        where: { id: personId },
        relations: ['roles']
      });
      
      if (!person) {
        res.status(404).json({ message: 'Person not found' });
        return;
      }
      
      const role = await roleRepository.findOne({ where: { id: roleId } });
      
      if (!role) {
        res.status(404).json({ message: 'Role not found' });
        return;
      }
      
      // Check if role is already assigned to person
      const hasRole = person.roles.some(r => r.id === role.id);
      
      if (!hasRole) {
        person.roles.push(role);
        await personRepository.save(person);
      }
      
      res.json(person);
    } catch (error) {
      res.status(500).json({ message: 'Error adding role to person', error });
    }
  }

  async removeRole(req: Request, res: Response): Promise<void> {
    try {
      const personRepository = AppDataSource.getRepository(Person);
      
      const personId = parseInt(req.params.id);
      const roleId = parseInt(req.params.roleId);
      
      const person = await personRepository.findOne({
        where: { id: personId },
        relations: ['roles']
      });
      
      if (!person) {
        res.status(404).json({ message: 'Person not found' });
        return;
      }
      
      person.roles = person.roles.filter(role => role.id !== roleId);
      const result = await personRepository.save(person);
      
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: 'Error removing role from person', error });
    }
  }
}
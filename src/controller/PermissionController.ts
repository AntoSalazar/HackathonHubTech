import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Permission } from '../entity/Permission';

export class PermissionController {
  
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const permissionRepository = AppDataSource.getRepository(Permission);
      const permissions = await permissionRepository.find();
      res.json(permissions);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching permissions', error });
    }
  }

  async getOne(req: Request, res: Response): Promise<void> {
    try {
      const permissionRepository = AppDataSource.getRepository(Permission);
      const id = parseInt(req.params.id);
      
      const permission = await permissionRepository.findOne({ where: { id } });
      
      if (!permission) {
        res.status(404).json({ message: 'Permission not found' });
        return;
      }
      
      res.json(permission);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching permission', error });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const permissionRepository = AppDataSource.getRepository(Permission);
      const permission = permissionRepository.create(req.body as Permission);
      
      const result = await permissionRepository.save(permission);
      res.status(201).json(result);
    } catch (error) {
      if (error.code === '23505') {
        res.status(409).json({ message: 'Permission with this name already exists' });
      } else {
        res.status(500).json({ message: 'Error creating permission', error });
      }
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const permissionRepository = AppDataSource.getRepository(Permission);
      const id = parseInt(req.params.id);
      
      let permission = await permissionRepository.findOne({ where: { id } });
      
      if (!permission) {
        res.status(404).json({ message: 'Permission not found' });
        return;
      }
      
      permissionRepository.merge(permission, req.body as Permission);
      const result = await permissionRepository.save(permission);
      
      res.json(result);
    } catch (error) {
      if (error.code === '23505') {
        res.status(409).json({ message: 'Permission with this name already exists' });
      } else {
        res.status(500).json({ message: 'Error updating permission', error });
      }
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const permissionRepository = AppDataSource.getRepository(Permission);
      const id = parseInt(req.params.id);
      
      const deleteResult = await permissionRepository.delete(id);
      
      if (deleteResult.affected === 0) {
        res.status(404).json({ message: 'Permission not found' });
        return;
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Error deleting permission', error });
    }
  }
}

import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Role } from '../entity/Role';
import { Permission } from '../entity/Permission';

export class RoleController {
  
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const roleRepository = AppDataSource.getRepository(Role);
      const roles = await roleRepository.find({ relations: ['permissions'] });
      res.json(roles);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching roles', error });
    }
  }

  async getOne(req: Request, res: Response): Promise<void> {
    try {
      const roleRepository = AppDataSource.getRepository(Role);
      const id = parseInt(req.params.id);
      
      const role = await roleRepository.findOne({ 
        where: { id },
        relations: ['permissions']
      });
      
      if (!role) {
        res.status(404).json({ message: 'Role not found' });
        return;
      }
      
      res.json(role);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching role', error });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const roleRepository = AppDataSource.getRepository(Role);
      const permissionRepository = AppDataSource.getRepository(Permission);
      
      const { name, permissionIds } = req.body;
      
      const role = new Role();
      role.name = name;
      
      if (permissionIds && permissionIds.length > 0) {
        role.permissions = await permissionRepository.findByIds(permissionIds);
      }
      
      const result = await roleRepository.save(role);
      res.status(201).json(result);
    } catch (error) {
      if (error.code === '23505') {
        res.status(409).json({ message: 'Role with this name already exists' });
      } else {
        res.status(500).json({ message: 'Error creating role', error });
      }
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const roleRepository = AppDataSource.getRepository(Role);
      const permissionRepository = AppDataSource.getRepository(Permission);
      const id = parseInt(req.params.id);
      
      const { name, permissionIds } = req.body;
      
      const role = await roleRepository.findOne({ 
        where: { id },
        relations: ['permissions']
      });
      
      if (!role) {
        res.status(404).json({ message: 'Role not found' });
        return;
      }
      
      if (name) {
        role.name = name;
      }
      
      if (permissionIds) {
        role.permissions = await permissionRepository.findByIds(permissionIds);
      }
      
      const result = await roleRepository.save(role);
      res.json(result);
    } catch (error) {
      if (error.code === '23505') {
        res.status(409).json({ message: 'Role with this name already exists' });
      } else {
        res.status(500).json({ message: 'Error updating role', error });
      }
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const roleRepository = AppDataSource.getRepository(Role);
      const id = parseInt(req.params.id);
      
      const deleteResult = await roleRepository.delete(id);
      
      if (deleteResult.affected === 0) {
        res.status(404).json({ message: 'Role not found' });
        return;
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Error deleting role', error });
    }
  }

  async addPermission(req: Request, res: Response): Promise<void> {
    try {
      const roleRepository = AppDataSource.getRepository(Role);
      const permissionRepository = AppDataSource.getRepository(Permission);
      
      const roleId = parseInt(req.params.id);
      const permissionId = parseInt(req.params.permissionId);
      
      const role = await roleRepository.findOne({ 
        where: { id: roleId },
        relations: ['permissions']
      });
      
      if (!role) {
        res.status(404).json({ message: 'Role not found' });
        return;
      }
      
      const permission = await permissionRepository.findOne({ where: { id: permissionId } });
      
      if (!permission) {
        res.status(404).json({ message: 'Permission not found' });
        return;
      }
      
      // Check if permission is already assigned to role
      const hasPermission = role.permissions.some(p => p.id === permission.id);
      
      if (!hasPermission) {
        role.permissions.push(permission);
        await roleRepository.save(role);
      }
      
      res.json(role);
    } catch (error) {
      res.status(500).json({ message: 'Error adding permission to role', error });
    }
  }

  async removePermission(req: Request, res: Response): Promise<void> {
    try {
      const roleRepository = AppDataSource.getRepository(Role);
      
      const roleId = parseInt(req.params.id);
      const permissionId = parseInt(req.params.permissionId);
      
      const role = await roleRepository.findOne({ 
        where: { id: roleId },
        relations: ['permissions']
      });
      
      if (!role) {
        res.status(404).json({ message: 'Role not found' });
        return;
      }
      
      role.permissions = role.permissions.filter(permission => permission.id !== permissionId);
      const result = await roleRepository.save(role);
      
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: 'Error removing permission from role', error });
    }
  }
}
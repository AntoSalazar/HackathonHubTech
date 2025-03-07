// controllers/category.controller.ts
import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Category } from '../entity/Category';

export class CategoryController {
  
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const categoryRepository = AppDataSource.getRepository(Category);
      const categories = await categoryRepository.find();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching categories', error });
    }
  }

  async getOne(req: Request, res: Response): Promise<void> {
    try {
      const categoryRepository = AppDataSource.getRepository(Category);
      const id = parseInt(req.params.id);
      
      const category = await categoryRepository.findOne({ where: { id } });
      
      if (!category) {
        res.status(404).json({ message: 'Category not found' });
        return;
      }
      
      res.json(category);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching category', error });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const categoryRepository = AppDataSource.getRepository(Category);
      const category = categoryRepository.create(req.body as Category);
      
      const result = await categoryRepository.save(category);
      res.status(201).json(result);
    } catch (error) {
      if (error.code === '23505') { // PostgreSQL unique violation
        res.status(409).json({ message: 'Category with this name already exists' });
      } else {
        res.status(500).json({ message: 'Error creating category', error });
      }
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const categoryRepository = AppDataSource.getRepository(Category);
      const id = parseInt(req.params.id);
      
      let category = await categoryRepository.findOne({ where: { id } });
      
      if (!category) {
        res.status(404).json({ message: 'Category not found' });
        return;
      }
      
      categoryRepository.merge(category, req.body as Category);
      const result = await categoryRepository.save(category);
      
      res.json(result);
    } catch (error) {
      if (error.code === '23505') {
        res.status(409).json({ message: 'Category with this name already exists' });
      } else {
        res.status(500).json({ message: 'Error updating category', error });
      }
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const categoryRepository = AppDataSource.getRepository(Category);
      const id = parseInt(req.params.id);
      
      const deleteResult = await categoryRepository.delete(id);
      
      if (deleteResult.affected === 0) {
        res.status(404).json({ message: 'Category not found' });
        return;
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Error deleting category', error });
    }
  }
}

import { Request, Response } from 'express';
import { MenuService } from '../services/MenuService';
import { asyncHandler } from '../utils/asyncHandler';
import { MenuCategory } from '../models/MenuItem';

const menuService = new MenuService();

export const createMenuItem = asyncHandler(async (req: Request, res: Response) => {
  const menuItem = await menuService.createMenuItem(req.body);
  
  res.status(201).json({
    success: true,
    data: menuItem,
  });
});

export const getMenuItemById = asyncHandler(async (req: Request, res: Response) => {
  const menuItem = await menuService.getMenuItemById(req.params.id);
  
  res.status(200).json({
    success: true,
    data: menuItem,
  });
});

export const getAllMenuItems = asyncHandler(async (req: Request, res: Response) => {
  const { category, isAvailable } = req.query;
  
  const filters: any = {};
  
  if (category) {
    filters.category = category as MenuCategory;
  }
  
  if (isAvailable !== undefined) {
    filters.isAvailable = isAvailable === 'true';
  }
  
  const menuItems = await menuService.getAllMenuItems(filters);
  
  res.status(200).json({
    success: true,
    data: menuItems,
    count: menuItems.length,
  });
});

export const updateMenuItem = asyncHandler(async (req: Request, res: Response) => {
  const menuItem = await menuService.updateMenuItem(req.params.id, req.body);
  
  res.status(200).json({
    success: true,
    data: menuItem,
  });
});

export const deleteMenuItem = asyncHandler(async (req: Request, res: Response) => {
  await menuService.deleteMenuItem(req.params.id);
  
  res.status(200).json({
    success: true,
    message: 'Menu item deleted successfully',
  });
});

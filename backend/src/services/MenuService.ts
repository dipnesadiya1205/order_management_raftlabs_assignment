import { MenuItemRepository } from '../repositories/MenuItemRepository';
import { IMenuItem, MenuCategory } from '../models/MenuItem';
import { NotFoundError, BadRequestError } from '../utils/AppError';

export class MenuService {
  private menuItemRepository: MenuItemRepository;

  constructor() {
    this.menuItemRepository = new MenuItemRepository();
  }

  async createMenuItem(data: Partial<IMenuItem>): Promise<IMenuItem> {
    return await this.menuItemRepository.create(data);
  }

  async getMenuItemById(id: string): Promise<IMenuItem> {
    const menuItem = await this.menuItemRepository.findById(id);
    if (!menuItem) {
      throw new NotFoundError('Menu item');
    }
    return menuItem;
  }

  async getAllMenuItems(filters?: {
    category?: MenuCategory;
    isAvailable?: boolean;
  }): Promise<IMenuItem[]> {
    return await this.menuItemRepository.findAll(filters);
  }

  async updateMenuItem(id: string, data: Partial<IMenuItem>): Promise<IMenuItem> {
    const menuItem = await this.menuItemRepository.update(id, data);
    if (!menuItem) {
      throw new NotFoundError('Menu item');
    }
    return menuItem;
  }

  async deleteMenuItem(id: string): Promise<void> {
    const menuItem = await this.menuItemRepository.delete(id);
    if (!menuItem) {
      throw new NotFoundError('Menu item');
    }
  }

  async validateMenuItems(itemIds: string[]): Promise<IMenuItem[]> {
    const menuItems = await this.menuItemRepository.findByIds(itemIds);
    
    if (menuItems.length !== itemIds.length) {
      throw new BadRequestError('One or more menu items not found');
    }

    const unavailableItems = menuItems.filter((item) => !item.isAvailable);
    if (unavailableItems.length > 0) {
      throw new BadRequestError(
        `The following items are not available: ${unavailableItems.map((i) => i.name).join(', ')}`
      );
    }

    return menuItems;
  }
}

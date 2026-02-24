import { MenuItem, IMenuItem, MenuCategory } from '../models/MenuItem';
import { FilterQuery } from 'mongoose';

export class MenuItemRepository {
  async create(data: Partial<IMenuItem>): Promise<IMenuItem> {
    const menuItem = new MenuItem(data);
    return await menuItem.save();
  }

  async findById(id: string): Promise<IMenuItem | null> {
    return await MenuItem.findById(id);
  }

  async findAll(filters?: {
    category?: MenuCategory;
    isAvailable?: boolean;
  }): Promise<IMenuItem[]> {
    const query: FilterQuery<IMenuItem> = {};

    if (filters?.category) {
      query.category = filters.category;
    }

    if (filters?.isAvailable !== undefined) {
      query.isAvailable = filters.isAvailable;
    }

    return await MenuItem.find(query).sort({ category: 1, name: 1 });
  }

  async update(id: string, data: Partial<IMenuItem>): Promise<IMenuItem | null> {
    return await MenuItem.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  }

  async delete(id: string): Promise<IMenuItem | null> {
    return await MenuItem.findByIdAndDelete(id);
  }

  async findByIds(ids: string[]): Promise<IMenuItem[]> {
    return await MenuItem.find({ _id: { $in: ids } });
  }

  async exists(id: string): Promise<boolean> {
    const count = await MenuItem.countDocuments({ _id: id });
    return count > 0;
  }
}

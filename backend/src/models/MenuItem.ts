import mongoose, { Schema, Document } from 'mongoose';

export enum MenuCategory {
  APPETIZER = 'appetizer',
  MAIN = 'main',
  DESSERT = 'dessert',
  BEVERAGE = 'beverage',
}

export interface IMenuItem extends Document {
  name: string;
  description: string;
  price: number;
  category: MenuCategory;
  imageUrl: string;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const menuItemSchema = new Schema<IMenuItem>(
  {
    name: {
      type: String,
      required: [true, 'Menu item name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [100, 'Name must not exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters long'],
      maxlength: [500, 'Description must not exceed 500 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be a positive number'],
      validate: {
        validator: function (value: number) {
          return Number.isFinite(value) && value >= 0;
        },
        message: 'Price must be a valid positive number',
      },
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: Object.values(MenuCategory),
        message: 'Category must be one of: appetizer, main, dessert, beverage',
      },
    },
    imageUrl: {
      type: String,
      required: [true, 'Image URL is required'],
      validate: {
        validator: function (value: string) {
          const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\w .-]*)*\/?$/;
          return urlPattern.test(value);
        },
        message: 'Please provide a valid image URL',
      },
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

menuItemSchema.index({ category: 1, isAvailable: 1 });
menuItemSchema.index({ name: 1 });

export const MenuItem = mongoose.model<IMenuItem>('menu_item', menuItemSchema);

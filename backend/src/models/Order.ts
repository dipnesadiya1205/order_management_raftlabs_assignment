import mongoose, { Schema, Document, Types } from 'mongoose';

export enum OrderStatus {
  RECEIVED = 'received',
  PREPARING = 'preparing',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export interface IOrderItem {
  menuItem: Types.ObjectId;
  quantity: number;
  priceAtOrder: number;
}

export interface ICustomer {
  name: string;
  phone: string;
  address: string;
}

export interface IStatusHistory {
  status: OrderStatus;
  timestamp: Date;
}

export interface IOrder extends Document {
  orderNumber: string;
  items: IOrderItem[];
  customer: ICustomer;
  totalAmount: number;
  status: OrderStatus;
  statusHistory: IStatusHistory[];
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    menuItem: {
      type: Schema.Types.ObjectId,
      ref: 'MenuItem',
      required: [true, 'Menu item reference is required'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
      validate: {
        validator: Number.isInteger,
        message: 'Quantity must be a whole number',
      },
    },
    priceAtOrder: {
      type: Number,
      required: [true, 'Price at order is required'],
      min: [0, 'Price must be a positive number'],
    },
  },
  { _id: false }
);

const customerSchema = new Schema<ICustomer>(
  {
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [100, 'Name must not exceed 100 characters'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      validate: {
        validator: function (value: string) {
          const phonePattern = /^[\d\s\-\+\(\)]{10,15}$/;
          return phonePattern.test(value);
        },
        message: 'Please provide a valid phone number',
      },
    },
    address: {
      type: String,
      required: [true, 'Delivery address is required'],
      trim: true,
      minlength: [10, 'Address must be at least 10 characters long'],
      maxlength: [300, 'Address must not exceed 300 characters'],
    },
  },
  { _id: false }
);

const statusHistorySchema = new Schema<IStatusHistory>(
  {
    status: {
      type: String,
      required: true,
      enum: Object.values(OrderStatus),
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    items: {
      type: [orderItemSchema],
      required: [true, 'Order must contain at least one item'],
      validate: {
        validator: function (items: IOrderItem[]) {
          return items && items.length > 0;
        },
        message: 'Order must contain at least one item',
      },
    },
    customer: {
      type: customerSchema,
      required: [true, 'Customer information is required'],
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Total amount must be a positive number'],
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: Object.values(OrderStatus),
        message: 'Invalid order status',
      },
      default: OrderStatus.RECEIVED,
    },
    statusHistory: {
      type: [statusHistorySchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'customer.phone': 1 });

orderSchema.pre('save', function (next) {
  if (this.isNew) {
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date(),
    });
  }
  next();
});

export const Order = mongoose.model<IOrder>('order', orderSchema);

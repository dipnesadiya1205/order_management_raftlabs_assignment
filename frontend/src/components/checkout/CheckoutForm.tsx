import React, { useState } from 'react';
import type { Customer } from '../../types/index';
import { Input } from '../shared/Input';
import { Button } from '../shared/Button';

interface CheckoutFormProps {
  onSubmit: (customer: Customer) => void;
  isSubmitting: boolean;
}

export const CheckoutForm: React.FC<CheckoutFormProps> = ({ onSubmit, isSubmitting }) => {
  const [formData, setFormData] = useState<Customer>({
    name: '',
    phone: '',
    address: '',
  });

  const [errors, setErrors] = useState<Partial<Customer>>({});

  const validate = (): boolean => {
    const newErrors: Partial<Customer> = {};

    if (!formData.name.trim() || formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    const phonePattern = /^[\d\s\-()]{10,15}$/;
    if (!phonePattern.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.address.trim() || formData.address.length < 10) {
      newErrors.address = 'Address must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof Customer]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Delivery Information</h2>
      
      <Input
        label="Full Name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        error={errors.name}
        placeholder="John Doe"
        required
      />

      <Input
        label="Phone Number"
        name="phone"
        type="tel"
        value={formData.phone}
        onChange={handleChange}
        error={errors.phone}
        placeholder="1234567890"
        required
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Delivery Address
        </label>
        <textarea
          name="address"
          value={formData.address}
          onChange={handleChange}
          rows={3}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
            errors.address ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="123 Main St, City, State, ZIP"
          required
        />
        {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Placing Order...' : 'Place Order'}
      </Button>
    </form>
  );
};

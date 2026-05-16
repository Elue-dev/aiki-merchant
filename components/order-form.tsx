'use client';

import { useState, useEffect } from 'react';
import { Order } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface OrderFormProps {
  order?: Order;
  onSubmit: (order: Omit<Order, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

export function OrderForm({ order, onSubmit, onCancel }: OrderFormProps) {
  const [formData, setFormData] = useState<Omit<Order, 'id' | 'createdAt'>>({
    orderNumber: '',
    customerName: '',
    items: '',
    amount: 0,
    status: 'pending',
    date: '',
    dueDate: '',
  });

  useEffect(() => {
    if (order) {
      const { id, createdAt, ...rest } = order;
      setFormData(rest);
    }
  }, [order]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Order Number</label>
        <Input
          name="orderNumber"
          value={formData.orderNumber}
          onChange={handleChange}
          placeholder="e.g., ORD-2024-001"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Customer Name</label>
        <Input
          name="customerName"
          value={formData.customerName}
          onChange={handleChange}
          placeholder="e.g., Tech Corp Inc"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Items</label>
        <textarea
          name="items"
          value={formData.items}
          onChange={handleChange}
          placeholder="e.g., 10x Laptops, 5x Monitors"
          className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground"
          rows={3}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Amount</label>
        <Input
          type="number"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          placeholder="0.00"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Status</label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground"
        >
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Order Date</label>
          <Input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Due Date</label>
          <Input
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-4">
        <Button type="button" onClick={onCancel} variant="outline">
          Cancel
        </Button>
        <Button type="submit">
          {order ? 'Update Order' : 'Add Order'}
        </Button>
      </div>
    </form>
  );
}

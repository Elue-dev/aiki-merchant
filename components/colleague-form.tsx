'use client';

import { useState, useEffect } from 'react';
import { Colleague } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ColleagueFormProps {
  colleague?: Colleague;
  onSubmit: (colleague: Omit<Colleague, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

export function ColleagueForm({ colleague, onSubmit, onCancel }: ColleagueFormProps) {
  const [formData, setFormData] = useState<Omit<Colleague, 'id' | 'createdAt'>>({
    name: '',
    email: '',
    role: 'editor',
    joinDate: '',
  });

  useEffect(() => {
    if (colleague) {
      const { id, createdAt, ...rest } = colleague;
      setFormData(rest);
    } else {
      setFormData(prev => ({
        ...prev,
        joinDate: new Date().toISOString().split('T')[0],
      }));
    }
  }, [colleague]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Full Name</label>
        <Input
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g., John Doe"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Email Address</label>
        <Input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="e.g., john@company.com"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Role</label>
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground"
        >
          <option value="admin">Admin - Full access</option>
          <option value="editor">Editor - Can manage items</option>
          <option value="viewer">Viewer - Read-only access</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Join Date</label>
        <Input
          type="date"
          name="joinDate"
          value={formData.joinDate}
          onChange={handleChange}
          required
        />
      </div>

      <div className="flex gap-3 justify-end pt-4">
        <Button type="button" onClick={onCancel} variant="outline">
          Cancel
        </Button>
        <Button type="submit">
          {colleague ? 'Update Colleague' : 'Add Colleague'}
        </Button>
      </div>
    </form>
  );
}

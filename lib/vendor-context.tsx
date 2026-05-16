'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Device, Order, Colleague } from './types';

interface VendorContextType {
  devices: Device[];
  orders: Order[];
  colleagues: Colleague[];

  // Device methods
  addDevice: (device: Omit<Device, 'id' | 'createdAt'>) => void;
  updateDevice: (id: string, device: Omit<Device, 'id' | 'createdAt'>) => void;
  deleteDevice: (id: string) => void;

  // Order methods
  addOrder: (order: Omit<Order, 'id' | 'createdAt'>) => void;
  updateOrder: (id: string, order: Omit<Order, 'id' | 'createdAt'>) => void;
  deleteOrder: (id: string) => void;

  // Colleague methods
  addColleague: (colleague: Omit<Colleague, 'id' | 'createdAt'>) => void;
  updateColleague: (id: string, colleague: Omit<Colleague, 'id' | 'createdAt'>) => void;
  deleteColleague: (id: string) => void;
}

const VendorContext = createContext<VendorContextType | undefined>(undefined);

const STORAGE_KEYS = {
  devices: 'vendor_devices',
  orders: 'vendor_orders',
  colleagues: 'vendor_colleagues',
};

// Mock data
const mockDevices: Device[] = [
  {
    id: '1',
    name: 'Laptop Pro',
    model: 'MacBook Pro 16"',
    serialNumber: 'SN001234',
    status: 'instock',
    quantity: 15,
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    name: 'Desktop Workstation',
    model: 'Dell XPS',
    serialNumber: 'SN005678',
    status: 'instock',
    quantity: 8,
    createdAt: '2024-02-20',
  },
  {
    id: '3',
    name: 'Monitor 4K',
    model: 'LG 27UK850',
    serialNumber: 'SN009012',
    status: 'sold out',
    quantity: 0,
    createdAt: '2024-03-10',
  },
];

const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD-2024-001',
    customerName: 'Tech Corp Inc',
    items: '10x Laptops, 5x Monitors',
    amount: 45000,
    status: 'processing',
    date: '2024-05-01',
    dueDate: '2024-05-15',
    createdAt: '2024-05-01',
  },
  {
    id: '2',
    orderNumber: 'ORD-2024-002',
    customerName: 'Enterprise Solutions',
    items: '20x Desktops',
    amount: 60000,
    status: 'pending',
    date: '2024-05-02',
    dueDate: '2024-05-20',
    createdAt: '2024-05-02',
  },
];

const mockColleagues: Colleague[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@company.com',
    role: 'admin',
    joinDate: '2024-01-01',
    createdAt: '2024-01-01',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@company.com',
    role: 'editor',
    joinDate: '2024-02-15',
    createdAt: '2024-02-15',
  },
];

export function VendorProvider({ children }: { children: React.ReactNode }) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [colleagues, setColleagues] = useState<Colleague[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load data from localStorage on mount (client-side only)
  useEffect(() => {
    try {
      const storedDevices = localStorage.getItem(STORAGE_KEYS.devices);
      const storedOrders = localStorage.getItem(STORAGE_KEYS.orders);
      const storedColleagues = localStorage.getItem(STORAGE_KEYS.colleagues);

      setDevices(storedDevices ? JSON.parse(storedDevices) : mockDevices);
      setOrders(storedOrders ? JSON.parse(storedOrders) : mockOrders);
      setColleagues(storedColleagues ? JSON.parse(storedColleagues) : mockColleagues);
      setIsLoaded(true);
    } catch (error) {
      console.error('Failed to load data from localStorage:', error);
      setDevices(mockDevices);
      setOrders(mockOrders);
      setColleagues(mockColleagues);
      setIsLoaded(true);
    }
  }, []);

  // Save devices to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEYS.devices, JSON.stringify(devices));
    }
  }, [devices, isLoaded]);

  // Save orders to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEYS.orders, JSON.stringify(orders));
    }
  }, [orders, isLoaded]);

  // Save colleagues to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEYS.colleagues, JSON.stringify(colleagues));
    }
  }, [colleagues, isLoaded]);

  // Device methods
  const addDevice = (device: Omit<Device, 'id' | 'createdAt'>) => {
    const newDevice: Device = {
      ...device,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
    };
    setDevices([...devices, newDevice]);
  };

  const updateDevice = (id: string, device: Omit<Device, 'id' | 'createdAt'>) => {
    setDevices(devices.map(d => d.id === id ? { ...d, ...device } : d));
  };

  const deleteDevice = (id: string) => {
    setDevices(devices?.filter(d => d.id !== id));
  };

  // Order methods
  const addOrder = (order: Omit<Order, 'id' | 'createdAt'>) => {
    const newOrder: Order = {
      ...order,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
    };
    setOrders([...orders, newOrder]);
  };

  const updateOrder = (id: string, order: Omit<Order, 'id' | 'createdAt'>) => {
    setOrders(orders.map(o => o.id === id ? { ...o, ...order } : o));
  };

  const deleteOrder = (id: string) => {
    setOrders(orders.filter(o => o.id !== id));
  };

  // Colleague methods
  const addColleague = (colleague: Omit<Colleague, 'id' | 'createdAt'>) => {
    const newColleague: Colleague = {
      ...colleague,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
    };
    setColleagues([...colleagues, newColleague]);
  };

  const updateColleague = (id: string, colleague: Omit<Colleague, 'id' | 'createdAt'>) => {
    setColleagues(colleagues.map(c => c.id === id ? { ...c, ...colleague } : c));
  };

  const deleteColleague = (id: string) => {
    setColleagues(colleagues.filter(c => c.id !== id));
  };

  return (
    <VendorContext.Provider
      value={{
        devices,
        orders,
        colleagues,
        addDevice,
        updateDevice,
        deleteDevice,
        addOrder,
        updateOrder,
        deleteOrder,
        addColleague,
        updateColleague,
        deleteColleague,
      }}
    >
      {isLoaded ? children : null}
    </VendorContext.Provider>
  );
}

export function useVendor() {
  const context = useContext(VendorContext);
  if (context === undefined) {
    throw new Error('useVendor must be used within a VendorProvider');
  }
  return context;
}

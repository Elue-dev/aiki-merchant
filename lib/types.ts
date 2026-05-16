export interface Device {
  id: string;
  name: string;
  model: string;
  serialNumber: string;
  status: 'instock' | 'sold out';
  quantity: number;
  image?: string;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  items: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  date: string;
  dueDate: string;
  createdAt: string;
}

export interface Colleague {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  joinDate: string;
  createdAt: string;
}

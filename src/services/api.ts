import { DriverData, Contract } from '../types';

const BASE_URL = 'https://assinagr-backend.assinagr.workers.dev';

export const api = {
  contracts: {
    list: async (): Promise<Contract[]> => {
      const res = await fetch(`${BASE_URL}/api/contracts`);
      if (!res.ok) throw new Error('Failed to fetch contracts');
      return res.json();
    },
    create: async (contractData: any): Promise<void> => {
      const res = await fetch(`${BASE_URL}/api/contracts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contractData)
      });
      if (!res.ok) throw new Error('Failed to create contract');
    },
    get: async (id: string): Promise<Contract> => {
      const res = await fetch(`${BASE_URL}/api/contracts/${id}`);
      if (!res.ok) throw new Error('Failed to fetch contract');
      return res.json();
    },
    sign: async (id: string, signature: string): Promise<void> => {
      const res = await fetch(`${BASE_URL}/api/contracts/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signature })
      });
      if (!res.ok) throw new Error('Failed to sign contract');
    },
    updateOnbase: async (id: string, status: boolean): Promise<void> => {
      const res = await fetch(`${BASE_URL}/api/contracts/${id}/onbase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error('Failed to update status');
    },
    delete: async (id: string): Promise<void> => {
      const res = await fetch(`${BASE_URL}/api/contracts/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete contract');
    }
  }
};

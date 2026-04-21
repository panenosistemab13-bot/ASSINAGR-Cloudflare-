import { DriverData, Contract } from '../types';

// Helper para acessar o binding ASSINATURAS caso estejamos de alguma forma num ambiente Cloudflare
const getKV = () => {
  // @ts-ignore
  if (typeof env !== 'undefined' && env.ASSINATURAS) return env.ASSINATURAS;
  // @ts-ignore
  if (typeof window !== 'undefined' && window.env && window.env.ASSINATURAS) return window.env.ASSINATURAS;
  // @ts-ignore
  if (typeof ASSINATURAS !== 'undefined') return ASSINATURAS;
  return null;
};

export const api = {
  contracts: {
    list: async (): Promise<Contract[]> => {
      try {
        const kv = getKV();
        if (kv) {
          const val = await kv.list();
          const keys = val.keys || [];
          const acc = [];
          for (let k of keys) {
            const data = await kv.get(k.name);
            if (data) acc.push(JSON.parse(data));
          }
          return acc.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        }
      } catch (e) { console.error(e); }

      const stored = localStorage.getItem('pront_contracts');
      return stored ? JSON.parse(stored) : [];
    },
    create: async (contractData: any): Promise<void> => {
      try {
        const kv = getKV();
        if (kv) {
          await kv.put(contractData.id, JSON.stringify(contractData));
          return;
        }
      } catch (e) { console.error(e); }

      const stored = localStorage.getItem('pront_contracts');
      const contracts = stored ? JSON.parse(stored) : [];
      contracts.unshift(contractData);
      localStorage.setItem('pront_contracts', JSON.stringify(contracts));
    },
    get: async (id: string): Promise<Contract | null> => {
      try {
        const kv = getKV();
        if (kv) {
          const data = await kv.get(id);
          return data ? JSON.parse(data) : null;
        }
      } catch(e) { console.error(e); }

      const stored = localStorage.getItem('pront_contracts');
      if (stored) {
        const contracts = JSON.parse(stored);
        return contracts.find((c: Contract) => c.id === id) || null;
      }
      return null;
    },
    sign: async (id: string, signature: string): Promise<void> => {
      try {
        const kv = getKV();
        if (kv) {
          const str = await kv.get(id);
          if (str) {
            const c = JSON.parse(str);
            c.signature = signature;
            c.signed_at = new Date().toISOString();
            await kv.put(id, JSON.stringify(c));
          }
          return;
        }
      } catch (e) { console.error(e); }

      const stored = localStorage.getItem('pront_contracts');
      if (stored) {
        const contracts = JSON.parse(stored);
        const index = contracts.findIndex((c: Contract) => c.id === id);
        if (index !== -1) {
          contracts[index].signature = signature;
          contracts[index].signed_at = new Date().toISOString();
          localStorage.setItem('pront_contracts', JSON.stringify(contracts));
        }
      }
    },
    updateOnbase: async (id: string, status: boolean): Promise<void> => {
      try {
        const kv = getKV();
        if (kv) {
          const str = await kv.get(id);
          if (str) {
            const c = JSON.parse(str);
            c.onbase_status = status;
            await kv.put(id, JSON.stringify(c));
          }
          return;
        }
      } catch(e) { console.error(e); }

      const stored = localStorage.getItem('pront_contracts');
      if (stored) {
        const contracts = JSON.parse(stored);
        const index = contracts.findIndex((c: Contract) => c.id === id);
        if (index !== -1) {
          contracts[index].onbase_status = status;
          localStorage.setItem('pront_contracts', JSON.stringify(contracts));
        }
      }
    },
    delete: async (id: string): Promise<void> => {
      try {
        const kv = getKV();
        if (kv) {
          await kv.delete(id);
          return;
        }
      } catch(e) { console.error(e); }

      const stored = localStorage.getItem('pront_contracts');
      if (stored) {
        const contracts = JSON.parse(stored);
        const filtered = contracts.filter((c: Contract) => c.id !== id);
        localStorage.setItem('pront_contracts', JSON.stringify(filtered));
      }
    }
  }
};

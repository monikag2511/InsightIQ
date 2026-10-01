'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Dataset, User } from '@/types';
import { api } from '@/services/api';

interface DatasetContextType {
  currentDataset: Dataset | null;
  datasets: Dataset[];
  loading: boolean;
  user: User | null;
  setCurrentDataset: (ds: Dataset | null) => void;
  selectDataset: (id: number) => Promise<void>;
  refreshDatasets: () => Promise<Dataset[]>;
  loadDemoDataset: (type?: string) => Promise<Dataset>;
  uploadModalOpen: boolean;
  setUploadModalOpen: (open: boolean) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  logout: () => void;
}

const DatasetContext = createContext<DatasetContextType | undefined>(undefined);

export function DatasetProvider({ children }: { children: React.ReactNode }) {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [currentDataset, setCurrentDataset] = useState<Dataset | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // Check stored theme and auth on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem('insightiq_theme') as 'light' | 'dark';
      if (storedTheme) {
        setTheme(storedTheme);
        document.documentElement.classList.toggle('dark', storedTheme === 'dark');
      } else {
        document.documentElement.classList.add('dark');
      }

      const storedUser = localStorage.getItem('insightiq_user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {}
      }
    }
    refreshDatasets();
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('insightiq_theme', next);
    document.documentElement.classList.toggle('dark', next === 'dark');
  };

  const logout = () => {
    api.logout();
    setUser(null);
  };

  const refreshDatasets = async () => {
    setLoading(true);
    try {
      const list = await api.listDatasets();
      setDatasets(list);
      if (list.length > 0 && !currentDataset) {
        setCurrentDataset(list[0]);
      }
      return list;
    } catch (err) {
      console.error('Failed to load datasets:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const selectDataset = async (id: number) => {
    const found = datasets.find((d) => d.id === id);
    if (found) {
      setCurrentDataset(found);
    } else {
      try {
        const ds = await api.getDataset(id);
        setCurrentDataset(ds);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const loadDemoDataset = async (type: string = 'retail') => {
    setLoading(true);
    try {
      const ds = await api.loadDemoDataset(type);
      await refreshDatasets();
      setCurrentDataset(ds);
      return ds;
    } finally {
      setLoading(false);
    }
  };

  return (
    <DatasetContext.Provider
      value={{
        currentDataset,
        datasets,
        loading,
        user,
        setCurrentDataset,
        selectDataset,
        refreshDatasets,
        loadDemoDataset,
        uploadModalOpen,
        setUploadModalOpen,
        mobileMenuOpen,
        setMobileMenuOpen,
        theme,
        toggleTheme,
        logout,
      }}
    >
      {children}
    </DatasetContext.Provider>
  );
}

export function useDataset() {
  const context = useContext(DatasetContext);
  if (!context) {
    throw new Error('useDataset must be used within a DatasetProvider');
  }
  return context;
}

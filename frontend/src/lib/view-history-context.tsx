'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';

// Types
export interface ViewHistoryItem {
  id: string;
  entityType: 'navigation' | 'category' | 'product';
  entityId: string;
  title: string;
  path: string;
  imageUrl?: string;
  timestamp: Date;
}

interface ViewHistoryContextType {
  history: ViewHistoryItem[];
  addToHistory: (item: Omit<ViewHistoryItem, 'id' | 'timestamp'>) => void;
  clearHistory: () => void;
  removeFromHistory: (id: string) => void;
  getRecentItems: (limit?: number) => ViewHistoryItem[];
}

const ViewHistoryContext = createContext<ViewHistoryContextType | undefined>(
  undefined
);

const STORAGE_KEY = 'book-explorer-view-history';
const MAX_HISTORY_ITEMS = 100;

// Provider Component
export function ViewHistoryProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<ViewHistoryItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Restore Date objects
        const items = parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        }));
        setHistory(items);
      }
    } catch (error) {
      console.error('Failed to load view history:', error);
    }
    setIsHydrated(true);
  }, []);

  // Save history to localStorage when it changes
  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
      } catch (error) {
        console.error('Failed to save view history:', error);
      }
    }
  }, [history, isHydrated]);

  const addToHistory = useCallback(
    (item: Omit<ViewHistoryItem, 'id' | 'timestamp'>) => {
      setHistory((prev) => {
        // Check if item already exists (same entity)
        const existingIndex = prev.findIndex(
          (h) => h.entityType === item.entityType && h.entityId === item.entityId
        );

        const newItem: ViewHistoryItem = {
          ...item,
          id: `${item.entityType}-${item.entityId}-${Date.now()}`,
          timestamp: new Date(),
        };

        let updated: ViewHistoryItem[];

        if (existingIndex !== -1) {
          // Move existing item to front and update timestamp
          updated = [
            newItem,
            ...prev.filter((_, index) => index !== existingIndex),
          ];
        } else {
          // Add new item to front
          updated = [newItem, ...prev];
        }

        // Limit history size
        return updated.slice(0, MAX_HISTORY_ITEMS);
      });
    },
    []
  );

  const clearHistory = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear view history:', error);
    }
  }, []);

  const removeFromHistory = useCallback((id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const getRecentItems = useCallback(
    (limit = 10) => {
      return history.slice(0, limit);
    },
    [history]
  );

  return (
    <ViewHistoryContext.Provider
      value={{
        history,
        addToHistory,
        clearHistory,
        removeFromHistory,
        getRecentItems,
      }}
    >
      {children}
    </ViewHistoryContext.Provider>
  );
}

// Hook
export function useViewHistory() {
  const context = useContext(ViewHistoryContext);
  if (context === undefined) {
    throw new Error('useViewHistory must be used within a ViewHistoryProvider');
  }
  return context;
}

// Helper hook to track views
export function useTrackView(
  entityType: ViewHistoryItem['entityType'],
  entityId: string | undefined,
  title: string | undefined,
  path: string,
  imageUrl?: string
) {
  const { addToHistory } = useViewHistory();

  useEffect(() => {
    if (entityId && title) {
      addToHistory({
        entityType,
        entityId,
        title,
        path,
        imageUrl,
      });
    }
  }, [entityType, entityId, title, path, imageUrl, addToHistory]);
}

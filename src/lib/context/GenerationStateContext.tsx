import React, { createContext, useContext } from 'react';
import { useGenerationState as useGenerationStateBase } from '../hooks/useGenerationState';

const GenerationStateContext = createContext<ReturnType<typeof useGenerationStateBase> | undefined>(undefined);

export const GenerationStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const value = useGenerationStateBase();
  return (
    <GenerationStateContext.Provider value={value}>
      {children}
    </GenerationStateContext.Provider>
  );
};

export function useGenerationState() {
  const ctx = useContext(GenerationStateContext);
  if (!ctx) throw new Error('useGenerationState must be used within GenerationStateProvider');
  return ctx;
} 
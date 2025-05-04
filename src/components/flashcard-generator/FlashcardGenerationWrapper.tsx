import React, { useState, useEffect, Suspense } from 'react';
import { GenerationStateProvider } from '../../lib/context/GenerationStateContext';
import GenerateButton from './GenerateButton';
import SkeletonLoader from './SkeletonLoader';
import ErrorNotification from './ErrorNotification';
import FlashcardList from './FlashcardList';
import BulkSaveButton from './BulkSaveButton';
import SupabaseDiagnostics from './SupabaseDiagnostics';

// Lazy loading TextInputArea to avoid hydration mismatch
const ClientOnlyTextInput = () => {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Na serwerze lub przed hydratacją pokaż placeholder
  if (!isMounted) {
    return (
      <div className="min-h-[200px] w-full resize-none rounded-md border p-2 border-gray-300 bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">Ładowanie edytora tekstu...</p>
      </div>
    );
  }
  
  // Importowanie komponentu tylko po stronie klienta po hydratacji
  const TextInputArea = React.lazy(() => import('./TextInputArea'));
  
  return (
    <Suspense fallback={
      <div className="min-h-[200px] w-full resize-none rounded-md border p-2 border-gray-300 bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">Ładowanie edytora tekstu...</p>
      </div>
    }>
      <TextInputArea />
    </Suspense>
  );
};

export default function FlashcardGenerationWrapper() {
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  return (
    <GenerationStateProvider>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Generator Fiszek</h1>
          <button 
            onClick={() => setShowDiagnostics(prev => !prev)}
            className="text-xs bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-full"
          >
            {showDiagnostics ? "Ukryj diagnostykę" : "Pokaż diagnostykę"}
          </button>
        </div>
        
        {showDiagnostics && (
          <div className="mb-6">
            <SupabaseDiagnostics />
          </div>
        )}
        
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Wprowadź tekst źródłowy</h2>
            <p className="text-gray-600 mb-4">
              Wklej tekst, z którego chcesz wygenerować fiszki.
            </p>
            
            <ClientOnlyTextInput />
          </div>

          <div className="flex justify-end">
            <GenerateButton />
          </div>

          <SkeletonLoader />
          <ErrorNotification />

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Wygenerowane fiszki</h2>
              <BulkSaveButton />
            </div>
            
            <FlashcardList />
          </div>
        </div>
      </div>
    </GenerationStateProvider>
  );
} 
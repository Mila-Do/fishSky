import React, { useState } from 'react';
import { useGenerationState } from '../../lib/context/GenerationStateContext';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { ErrorNotificationProps } from './types';
import { checkSupabaseConnection } from '../../db/supabase.client';

export default function ErrorNotification({
  error: externalError,
  onDismiss,
  onRetry,
}: ErrorNotificationProps) {
  const { state } = useGenerationState();
  const [showDetails, setShowDetails] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<any>(null);
  const [isCheckingConnection, setIsCheckingConnection] = useState(false);
  
  // Use the external error prop if provided, otherwise use the state
  const error = externalError !== undefined ? externalError : state.error;
  
  if (!error) return null;
  
  const checkConnection = async () => {
    setIsCheckingConnection(true);
    try {
      const result = await checkSupabaseConnection();
      setConnectionStatus(result);
    } catch (err) {
      setConnectionStatus({ error: 'Failed to check connection', exception: err });
    } finally {
      setIsCheckingConnection(false);
    }
  };

  return (
    <Alert variant="destructive" className="my-6">
      <AlertDescription>
        <div className="flex flex-col">
          <p>{error}</p>
          <div className="mt-4 flex">
            {onRetry && (
              <Button
                variant="outline"
                size="sm"
                className="mr-4 text-sm border-red-200 hover:bg-red-50"
                onClick={onRetry}
              >
                Spróbuj ponownie
              </Button>
            )}
            {onDismiss && (
              <Button
                variant="outline"
                size="sm"
                className="text-sm border-red-200 hover:bg-red-50"
                onClick={onDismiss}
              >
                Zamknij
              </Button>
            )}
          </div>
          
          <div className="flex space-x-2 mt-2">
            <button 
              onClick={() => setShowDetails(!showDetails)}
              className="text-red-700 underline text-sm"
            >
              {showDetails ? 'Ukryj szczegóły' : 'Pokaż szczegóły'}
            </button>
            
            <button 
              onClick={checkConnection}
              disabled={isCheckingConnection}
              className="text-red-700 underline text-sm"
            >
              {isCheckingConnection ? 'Sprawdzanie...' : 'Sprawdź połączenie z Supabase'}
            </button>
          </div>
          
          {showDetails && (
            <div className="mt-3 bg-white p-3 rounded border border-red-100 text-xs">
              <h4 className="font-medium mb-1">Informacje diagnostyczne:</h4>
              <ul className="space-y-1 list-disc pl-5">
                <li>Tekst źródłowy: {state.sourceText.length} znaków</li>
                <li>ID generacji: {state.generationId || 'brak'}</li>
                <li>Liczba propozycji: {state.proposals.length}</li>
                <li>Stan generowania: {state.isGenerating ? 'w toku' : 'zakończone'}</li>
              </ul>
              
              <div className="mt-3">
                <p className="font-medium mb-1">Możliwe rozwiązania:</p>
                <ul className="space-y-1 list-disc pl-5">
                  <li>Sprawdź, czy Supabase jest poprawnie skonfigurowane (URL i klucz API)</li>
                  <li>Upewnij się, że tabele w bazie danych są utworzone zgodnie ze schematem</li>
                  <li>Sprawdź, czy Edge Functions są skonfigurowane i działają</li>
                  <li>Sprawdź logi w konsoli przeglądarki</li>
                </ul>
              </div>
              
              {connectionStatus && (
                <div className="mt-3">
                  <h4 className="font-medium mb-1">Status połączenia z Supabase:</h4>
                  <div className={`px-2 py-1 rounded inline-block text-white ${connectionStatus.connection ? 'bg-green-500' : 'bg-red-500'}`}>
                    {connectionStatus.connection ? 'Połączono' : 'Brak połączenia'}
                  </div>
                  <pre className="mt-2 bg-gray-100 p-2 rounded overflow-auto max-h-32 text-xs text-gray-800">
                    {JSON.stringify(connectionStatus, null, 2)}
                  </pre>
                </div>
              )}
              
              <pre className="mt-3 bg-gray-100 p-2 rounded overflow-auto max-h-32 text-xs text-gray-800">
                Error: {state.error}
                {'\n'}State: {JSON.stringify({
                  isGenerating: state.isGenerating,
                  generationId: state.generationId,
                  proposalsCount: state.proposals.length,
                  textLength: state.sourceText.length
                }, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
} 
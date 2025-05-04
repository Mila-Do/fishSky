import React, { useState } from 'react';
import { supabaseClient, checkSupabaseConnection } from '../../db/supabase.client';

export default function SupabaseDiagnostics() {
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [queryType, setQueryType] = useState<string>('connection');

  // Test połączenia z Supabase
  const testConnection = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const result = await checkSupabaseConnection();
      setResult(result);
      console.log('Wynik testu połączenia:', result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nieznany błąd');
      console.error('Błąd testu połączenia:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Sprawdź strukturę tabeli generations
  const checkGenerationsTable = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const { data, error } = await supabaseClient
        .from('generations')
        .select('*')
        .limit(5);

      if (error) throw error;
      setResult(data);
      console.log('Dane z tabeli generations:', data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nieznany błąd');
      console.error('Błąd pobierania danych z tabeli generations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Ręczne utworzenie rekordu w tabeli generations
  const createGenerationRecord = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const { data, error } = await supabaseClient
        .from('generations')
        .insert({
          sourceTextHash: 'test_hash_' + Date.now(),
          sourceTextLength: 1000,
          model: 'gpt-4-test',
          generationDuration: 0,
          userId: '39372e69-3264-457c-a816-988fdb0b24a1' // Default user ID
        })
        .select();

      if (error) throw error;
      setResult(data);
      console.log('Utworzony rekord:', data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nieznany błąd');
      console.error('Błąd tworzenia rekordu:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Sprawdź, które funkcje są dostępne w obiekcie supabaseClient
  const inspectSupabaseClient = () => {
    setError(null);
    try {
      const clientProperties = Object.keys(supabaseClient);
      const fromMethod = typeof supabaseClient.from === 'function' ? 'dostępna' : 'niedostępna';
      const authMethod = typeof supabaseClient.auth === 'object' ? 'dostępny' : 'niedostępny';
      
      setResult({
        clientProperties,
        fromMethod,
        authMethod,
        supabaseUrl: import.meta.env.PUBLIC_SUPABASE_URL || 'nie ustawiony',
        hasKey: !!import.meta.env.PUBLIC_SUPABASE_ANON_KEY
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nieznany błąd');
      console.error('Błąd inspekcji klienta Supabase:', err);
    }
  };

  // Wybierz i wykonaj odpowiednie zapytanie na podstawie wybranego typu
  const runSelectedQuery = async () => {
    switch (queryType) {
      case 'connection':
        await testConnection();
        break;
      case 'table':
        await checkGenerationsTable();
        break;
      case 'create':
        await createGenerationRecord();
        break;
      case 'inspect':
        inspectSupabaseClient();
        break;
      default:
        setError('Nieznany typ zapytania');
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">Diagnostyka Supabase</h2>
      
      <div className="space-y-4">
        <div className="flex space-x-2">
          <select 
            value={queryType}
            onChange={(e) => setQueryType(e.target.value)}
            className="px-3 py-2 border rounded"
          >
            <option value="connection">Test połączenia</option>
            <option value="table">Sprawdź tabelę generations</option>
            <option value="create">Utwórz testowy rekord</option>
            <option value="inspect">Sprawdź konfigurację klienta</option>
          </select>
          
          <button
            onClick={runSelectedQuery}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
          >
            {isLoading ? 'Ładowanie...' : 'Wykonaj test'}
          </button>
        </div>
        
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded">
            <strong>Błąd:</strong> {error}
          </div>
        )}
        
        {result && (
          <div className="mt-4">
            <h3 className="font-medium mb-2">Wynik:</h3>
            <pre className="bg-gray-100 p-3 rounded overflow-auto max-h-64 text-xs">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
} 
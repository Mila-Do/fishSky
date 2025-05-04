import React, { useState, useRef, useEffect } from 'react';
import { useGenerationState } from '../../lib/context/GenerationStateContext';

// Pominięcie kontekstu dla debugging
// import { useGenerationState } from '../../lib/context/GenerationStateContext';

// Stałe
const MIN_LENGTH = 1000;
const MAX_LENGTH = 10000;

// Ustawić na true, aby włączyć tryb debugowania
const DEBUG_MODE = false;

export default function TextInputArea() {
  // Stan lokalny i referencje
  const { state, updateSourceText } = useGenerationState();
  const [inputText, setInputText] = useState(() => {
    // Inicjalizacja stanu z localStorage - bezpieczne, bo ten komponent jest ładowany tylko po stronie klienta
    try {
      return localStorage.getItem('fishsky_source_text') || '';
    } catch (e) {
      return '';
    }
  });
  
  const [count, setCount] = useState(() => {
    try {
      // Inicjalizacja licznika znaków od razu właściwą wartością
      const savedText = localStorage.getItem('fishsky_source_text') || '';
      return savedText.length;
    } catch (e) {
      return 0;
    }
  });
  
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Funkcja dodająca logi - używana tylko w trybie debug
  const addLog = (message: string) => {
    if (!DEBUG_MODE) return;
    
    setDebugLogs(prev => {
      const newLogs = [...prev, `${new Date().toLocaleTimeString()}: ${message}`];
      if (newLogs.length > 10) {
        return newLogs.slice(newLogs.length - 10);
      }
      return newLogs;
    });
  };
  
  // Synchronized with state context on mount
  useEffect(() => {
    if (inputText && inputText !== state.sourceText) {
      updateSourceText(inputText);
      addLog(`Synchronizacja początkowa z kontekstem: ${inputText.length} znaków`);
    }
  }, []);
  
  // Obsługa zmiany za pomocą zdarzeń React
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInputText(value);
    setCount(value.length);
    
    // Aktualizacja kontekstu
    updateSourceText(value);
    
    // Zapisanie do localStorage
    try {
      localStorage.setItem('fishsky_source_text', value);
    } catch (e) {
      // Ignoruj błędy localStorage
    }
    
    addLog(`React onChange: ${value.length} znaków`);
  };
  
  // Błąd walidacji
  const error =
    count > 0 && count < MIN_LENGTH
      ? `Tekst jest za krótki. Wymagane minimum ${MIN_LENGTH} znaków.`
      : count > MAX_LENGTH
      ? `Tekst jest za długi. Maksymalna długość to ${MAX_LENGTH} znaków.`
      : null;
  
  // Kolor licznika znaków
  const countColor = 
    count > MAX_LENGTH || (count > 0 && count < MIN_LENGTH)
      ? 'text-red-500'
      : count > MAX_LENGTH * 0.8
      ? 'text-amber-500'
      : 'text-gray-500';
  
  return (
    <div className="space-y-2 w-full">
      {/* Obszar wprowadzania tekstu */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={inputText}
          onChange={handleChange}
          placeholder="Wprowadź tekst, z którego chcesz wygenerować fiszki..."
          className={`min-h-[200px] w-full resize-none rounded-md border p-2 ${
            error ? 'border-red-500 focus-visible:ring-red-500' : 'border-gray-300'
          }`}
          id="source-text"
          disabled={state.isGenerating}
        />
        
        {/* Licznik znaków */}
        <div className={`absolute bottom-2 right-2 text-xs px-2 py-1 bg-gray-100 rounded-md ${countColor}`}>
          {count} / {MAX_LENGTH}
        </div>
      </div>
      
      {/* Komunikat błędu */}
      {error && (
        <div className="text-xs text-red-500">{error}</div>
      )}
      
      {/* Debug UI - widoczne tylko gdy DEBUG_MODE jest true */}
      {DEBUG_MODE && (
        <>
          <div className="text-xs bg-gray-100 p-3 rounded-md">
            <div className="mb-1">
              <b>Debug info:</b> tekstLen={count}, 
              stateLen={state?.sourceText?.length || 0},
              ref={textareaRef.current ? 'OK' : 'NULL'}
            </div>
          </div>
          
          <div className="bg-black text-green-400 p-3 rounded font-mono text-xs h-[150px] overflow-y-auto">
            <div className="mb-2 text-white font-bold">Log bezpośrednio w UI:</div>
            {debugLogs.length === 0 && <div>Brak logów</div>}
            {debugLogs.map((log, index) => (
              <div key={index} className="my-1">&gt; {log}</div>
            ))}
          </div>
          
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => {
                const testText = 'Test ' + new Date().toLocaleTimeString();
                setInputText(testText);
                setCount(testText.length);
                updateSourceText(testText);
                addLog(`Wstawiono tekst testowy: ${testText.length} znaków`);
              }}
              className="px-3 py-2 bg-blue-100 text-blue-800 rounded text-xs"
            >
              Wstaw tekst testowy
            </button>
            
            <button
              type="button"
              onClick={() => {
                addLog(`Stan: ${inputText.length} znaków`);
                if (textareaRef.current) {
                  addLog(`DOM: ${textareaRef.current.value.length} znaków`);
                }
              }}
              className="px-3 py-2 bg-amber-100 text-amber-800 rounded text-xs"
            >
              Pokaż stan
            </button>
          </div>
        </>
      )}
    </div>
  );
} 
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useGenerationState } from '../../lib/context/GenerationStateContext';

export default function GenerateButton() {
  console.log("GenerateButton component initialized");
  
  const { state, generateFlashcards } = useGenerationState();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const minLength = 1000;
  const maxLength = 10000;
  
  // Używamy efektu, aby zaznaczyć, że jesteśmy po stronie klienta
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const handleClick = async () => {
    try {
      // Reset error state
      setError(null);
      
      // Get text from global state
      const text = state.sourceText;
      console.log(`Generate button clicked, text length: ${text.length}`);
      
      // Validate text length
      if (text.length < minLength) {
        setError(`Tekst jest zbyt krótki. Wymagane minimum to ${minLength} znaków (obecna długość: ${text.length})`);
        return;
      }
      
      if (text.length > maxLength) {
        setError(`Tekst jest zbyt długi. Maksymalna długość to ${maxLength} znaków (obecna długość: ${text.length})`);
        return;
      }
      
      // Start generation process
      setIsLoading(true);
      
      try {
        // Use the hook function to generate flashcards
        await generateFlashcards(text);
      } catch (genError) {
        console.error('Error generating flashcards:', genError);
        throw genError;
      } finally {
        setIsLoading(false);
      }
      
    } catch (error) {
      console.error('Error in GenerateButton:', error);
      setError(error instanceof Error ? error.message : 'Wystąpił nieoczekiwany błąd');
      setIsLoading(false);
    }
  };
  
  // Po stronie klienta obliczamy czy przycisk powinien być wyłączony
  const isDisabled = isClient && (
    isLoading ||
    state.isGenerating ||
    state.sourceText.length < minLength ||
    state.sourceText.length > maxLength
  );

  return (
    <div className="flex flex-col items-end w-full">
      {/* 
        Używamy ternary operatora zamiast bezpośrednio przekazywać wartość boolean,
        dzięki czemu po stronie serwera renderujemy disabled={false},
        a nie disabled=""
      */}
      <Button
        onClick={handleClick}
        disabled={isDisabled ? true : false}
        className="w-48"
      >
        {(isLoading || state.isGenerating) && isClient ? 'Generowanie...' : 'Generuj fiszki'}
      </Button>
      {error && isClient && (
        <div className="text-red-500 text-xs mt-2 max-w-xs text-right">{error}</div>
      )}
    </div>
  );
} 
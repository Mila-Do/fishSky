import React, { useState, useEffect } from 'react';
import type { FlashcardProposalDTO } from '../../types';
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { EditModalProps, EditFormState } from './types';

// Typ FormErrors - może być używany wewnętrznie
interface FormErrors {
  front?: string;
  back?: string;
}

export default function EditModal({ isOpen, proposal, onClose, onSave }: EditModalProps) {
  const [front, setFront] = useState(proposal.flashcardFront);
  const [back, setBack] = useState(proposal.flashcardBack);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isTouched, setIsTouched] = useState(false);
  
  // Stan debugowania
  const [debugEvents, setDebugEvents] = useState<string[]>([]);
  const [isDebugVisible, setIsDebugVisible] = useState<boolean>(true);
  
  const MAX_FRONT_LENGTH = 200;
  const MAX_BACK_LENGTH = 500;

  // Reset form when proposal changes
  useEffect(() => {
    setFront(proposal.flashcardFront);
    setBack(proposal.flashcardBack);
    setErrors({});
    setIsTouched(false);
    
    addDebugEvent(`Formularz zresetowany z propozycji: front=${proposal.flashcardFront.length}, back=${proposal.flashcardBack.length}`);
  }, [proposal]);

  // Funkcja do dodawania wpisów debugowania
  const addDebugEvent = (event: string) => {
    setDebugEvents(prev => {
      const newEvents = [`${new Date().toISOString().substr(11, 8)}: ${event}`, ...prev];
      return newEvents.slice(0, 8); // Zachowaj tylko 8 ostatnich zdarzeń
    });
  };

  // Obsługa zmiany tekstu w polach front i back
  const handleFrontChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setFront(newValue);
    setIsTouched(true);
    addDebugEvent(`Front onChange: ${newValue.length}`);
  };

  const handleBackChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setBack(newValue);
    setIsTouched(true);
    addDebugEvent(`Back onChange: ${newValue.length}`);
  };

  // Validate real-time as user types or when values change
  useEffect(() => {
    if (isTouched) {
      validateForm();
    }
  }, [front, back, isTouched]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!front.trim()) {
      newErrors.front = 'Treść fiszki nie może być pusta';
    } else if (front.length > MAX_FRONT_LENGTH) {
      newErrors.front = `Treść fiszki nie może przekraczać ${MAX_FRONT_LENGTH} znaków`;
    }
    
    if (!back.trim()) {
      newErrors.back = 'Treść odpowiedzi nie może być pusta';
    } else if (back.length > MAX_BACK_LENGTH) {
      newErrors.back = `Treść odpowiedzi nie może przekraczać ${MAX_BACK_LENGTH} znaków`;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    addDebugEvent("Submit form");
    
    if (validateForm()) {
      // Dopasuj wywołanie do sygnatury z definicji typu EditModalProps
      onSave({
        flashcardId: proposal.flashcardId,
        flashcardFront: front.trim(),
        flashcardBack: back.trim(),
        flashcardStatus: proposal.flashcardStatus,
        flashcardSource: proposal.flashcardSource
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-medium">Edytuj fiszkę</h3>
        </div>
        
        {/* Panel debugowania */}
        <div className="bg-blue-100 p-4 m-4 rounded-md border border-blue-300 text-sm" style={{ display: isDebugVisible ? 'block' : 'none' }}>
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold">Debug Panel - EditModal</h3>
            <button 
              onClick={() => setIsDebugVisible(!isDebugVisible)}
              className="text-blue-500 hover:text-blue-700"
            >
              {isDebugVisible ? 'Ukryj' : 'Pokaż'}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div className="bg-white p-2 rounded">
              <span className="font-semibold">Front State:</span> {front.length}
            </div>
            <div className="bg-white p-2 rounded">
              <span className="font-semibold">Back State:</span> {back.length}
            </div>
          </div>
          <div className="bg-white p-2 rounded max-h-32 overflow-y-auto">
            <div className="font-semibold mb-1">Ostatnie zdarzenia:</div>
            {debugEvents.map((event, index) => (
              <div key={index} className="text-xs mb-1">{event}</div>
            ))}
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <Label htmlFor="front" className="block text-sm font-medium text-gray-700 mb-1">
                Pytanie <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="front"
                className={errors.front ? 'border-red-300 focus-visible:ring-red-400' : ''}
                rows={3}
                value={front}
                onChange={handleFrontChange}
                maxLength={MAX_FRONT_LENGTH}
                required
              />
              <div className="flex justify-between text-xs mt-1">
                {errors.front ? (
                  <span className="text-red-600">{errors.front}</span>
                ) : (
                  <span>&nbsp;</span>
                )}
                <span className={front.length > MAX_FRONT_LENGTH ? 'text-red-600' : 'text-gray-500'}>
                  {front.length}/{MAX_FRONT_LENGTH}
                </span>
              </div>
            </div>
            
            <div>
              <Label htmlFor="back" className="block text-sm font-medium text-gray-700 mb-1">
                Odpowiedź <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="back"
                className={errors.back ? 'border-red-300 focus-visible:ring-red-400' : ''}
                rows={5}
                value={back}
                onChange={handleBackChange}
                maxLength={MAX_BACK_LENGTH}
                required
              />
              <div className="flex justify-between text-xs mt-1">
                {errors.back ? (
                  <span className="text-red-600">{errors.back}</span>
                ) : (
                  <span>&nbsp;</span>
                )}
                <span className={back.length > MAX_BACK_LENGTH ? 'text-red-600' : 'text-gray-500'}>
                  {back.length}/{MAX_BACK_LENGTH}
                </span>
              </div>
            </div>
          </div>
          
          <div className="px-6 py-3 bg-gray-50 flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Anuluj
            </Button>
            <Button
              type="submit"
              disabled={!isTouched || Object.keys(errors).length > 0}
            >
              Zapisz zmiany
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 
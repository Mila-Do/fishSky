import React, { useState } from 'react';
import type { FlashcardGetResponseDTO, FlashcardUpdateCommandDTO } from '../../types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabaseClient } from '../../db/supabase.client';

interface FlashcardGridProps {
  flashcards: FlashcardGetResponseDTO[];
  onRefresh: () => void;
}

export function FlashcardGrid({ flashcards, onRefresh }: FlashcardGridProps) {
  // Stan dla modalu edycji
  const [editingFlashcard, setEditingFlashcard] = useState<FlashcardGetResponseDTO | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<{ front?: string; back?: string }>({});
  const [isTouched, setIsTouched] = useState(false);
  
  const MAX_FRONT_LENGTH = 200;
  const MAX_BACK_LENGTH = 500;

  // Handle edit flashcard
  const handleEdit = (id: string) => {
    const flashcard = flashcards.find(f => f.flashcardId === id);
    if (flashcard) {
      setEditingFlashcard(flashcard);
      setFront(flashcard.flashcardFront);
      setBack(flashcard.flashcardBack);
      setErrors({});
      setIsTouched(false);
      setIsModalOpen(true);
    }
  };
  
  // Walidacja formularza
  const validateForm = (): boolean => {
    const newErrors: { front?: string; back?: string } = {};
    
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
  
  // Zapisz zmiany
  const handleSaveEdit = async () => {
    if (!editingFlashcard || !validateForm()) return;
    
    try {
      setIsSaving(true);
      
      // WAŻNE: Zgodnie ze specyfikacją, jeśli edytujemy fiszkę wygenerowaną przez AI (ai-full),
      // musimy zmienić jej źródło na 'ai-edited', aby zaznaczyć, że została zmodyfikowana przez człowieka
      const sourceAfterEdit = editingFlashcard.flashcardSource === 'ai-full' ? 'ai-edited' : editingFlashcard.flashcardSource;
      
      // Przygotuj dane do aktualizacji
      const updateData: FlashcardUpdateCommandDTO = {
        flashcardFront: front.trim(),
        flashcardBack: back.trim(),
        flashcardSource: sourceAfterEdit
      };
      
      console.log(`Updating flashcard ${editingFlashcard.flashcardId}: changing source from ${editingFlashcard.flashcardSource} to ${sourceAfterEdit}`);
      
      // Aktualizuj w bazie danych
      const { error } = await supabaseClient
        .from('flashcards')
        .update({
          front: updateData.flashcardFront,
          back: updateData.flashcardBack,
          source: updateData.flashcardSource,
          updatedAt: new Date().toISOString()
        })
        .eq('id', editingFlashcard.flashcardId);
      
      if (error) {
        throw new Error(`Error updating flashcard: ${error.message}`);
      }
      
      // Zamknij modal i odśwież listę
      setIsModalOpen(false);
      setEditingFlashcard(null);
      onRefresh();
      
    } catch (error) {
      console.error('Error saving flashcard:', error);
      alert('Wystąpił błąd podczas zapisywania fiszki');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Obsługa zmiany pól formularza
  const handleFrontChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFront(e.target.value);
    setIsTouched(true);
  };
  
  const handleBackChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setBack(e.target.value);
    setIsTouched(true);
  };
  
  // Zamknij modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingFlashcard(null);
  };

  // Handle delete flashcard
  const handleDelete = async (id: string) => {
    if (confirm('Czy na pewno chcesz usunąć tę fiszkę?')) {
      try {
        // Soft delete the flashcard
        const { error } = await supabaseClient
          .from('flashcards')
          .update({ deletedAt: new Date().toISOString() })
          .eq('id', id);

        if (error) {
          throw new Error(`Error deleting flashcard: ${error.message}`);
        }

        // Refresh the list
        onRefresh();
      } catch (error) {
        console.error('Error deleting flashcard:', error);
        alert('Wystąpił błąd podczas usuwania fiszki');
      }
    }
  };

  // Function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL');
  };

  // Map status to badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return <Badge className="bg-green-500">Zaakceptowana</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500">Odrzucona</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">Oczekująca</Badge>;
      default:
        return <Badge>Niestandardowa</Badge>;
    }
  };

  // Map source to badge
  const getSourceBadge = (source: string) => {
    switch (source) {
      case 'manual':
        return <Badge variant="outline">Ręczna</Badge>;
      case 'ai-full':
        return <Badge variant="outline" className="border-purple-500 text-purple-500">AI</Badge>;
      case 'ai-edited':
        return <Badge variant="outline" className="border-blue-500 text-blue-500">AI Edytowana</Badge>;
      default:
        return null;
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {flashcards.map((flashcard) => (
          <Card key={flashcard.flashcardId} className="h-full flex flex-col">
            <CardHeader className="pb-2">
              <div className="flex justify-between">
                <CardTitle className="text-lg line-clamp-2">{flashcard.flashcardFront}</CardTitle>
              </div>
              <CardDescription className="flex gap-2 mt-2">
                {getStatusBadge(flashcard.flashcardStatus)}
                {getSourceBadge(flashcard.flashcardSource)}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="mt-2 text-gray-600 line-clamp-5">{flashcard.flashcardBack}</div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleEdit(flashcard.flashcardId)}
              >
                Edytuj
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={() => handleDelete(flashcard.flashcardId)}
              >
                Usuń
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {/* Modal do edycji fiszki */}
      {isModalOpen && editingFlashcard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div 
            className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-medium">Edytuj fiszkę</h3>
            </div>
            
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
                onClick={handleCloseModal}
              >
                Anuluj
              </Button>
              <Button
                type="button"
                onClick={handleSaveEdit}
                disabled={!isTouched || Object.keys(errors).length > 0 || isSaving}
              >
                {isSaving ? 'Zapisywanie...' : 'Zapisz zmiany'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 
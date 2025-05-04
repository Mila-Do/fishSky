import React, { useState, useEffect } from 'react';
import { supabaseClient, defaultUserId } from '../../db/supabase.client';
import type { FlashcardGetResponseDTO, FlashcardStatus, FlashcardSource } from '../../types';
import { FlashcardGrid } from './FlashcardGrid';
import { FlashcardFilters } from './FlashcardFilters';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PaginationControls } from './PaginationControls';

export default function FlashcardListWrapper() {
  // State variables
  const [flashcards, setFlashcards] = useState<FlashcardGetResponseDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalFlashcards, setTotalFlashcards] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<FlashcardStatus | null>(null);
  const [filterSource, setFilterSource] = useState<FlashcardSource | null>(null);
  
  const flashcardsPerPage = 12;

  // Fetch flashcards on component mount and when filters change
  useEffect(() => {
    fetchFlashcards();
  }, [currentPage, searchTerm, filterStatus, filterSource]);

  // Function to fetch flashcards from the database
  const fetchFlashcards = async () => {
    try {
      setIsLoading(true);
      setError(null);

      let query = supabaseClient
        .from('flashcards')
        .select('*', { count: 'exact' })
        .eq('userId', defaultUserId)
        .is('deletedAt', null)
        .order('createdAt', { ascending: false });

      // Apply filters if they are set
      if (searchTerm) {
        query = query.or(`front.ilike.%${searchTerm}%,back.ilike.%${searchTerm}%`);
      }

      if (filterStatus) {
        query = query.eq('status', filterStatus);
      }

      if (filterSource) {
        query = query.eq('source', filterSource);
      }

      // Apply pagination
      const from = (currentPage - 1) * flashcardsPerPage;
      const to = from + flashcardsPerPage - 1;
      query = query.range(from, to);

      // Execute the query
      const { data, error, count } = await query;

      if (error) {
        throw new Error(`Error fetching flashcards: ${error.message}`);
      }

      if (count !== null) {
        setTotalFlashcards(count);
      }

      // Transform data to match FlashcardGetResponseDTO
      const formattedFlashcards: FlashcardGetResponseDTO[] = data.map(card => ({
        flashcardId: card.id,
        flashcardFront: card.front,
        flashcardBack: card.back,
        flashcardStatus: card.status,
        flashcardSource: card.source,
        flashcardGenerationId: card.generationId,
        flashcardCreatedAt: card.createdAt,
        flashcardUpdatedAt: card.updatedAt,
        flashcardUserId: card.userId,
        flashcardAiMetadata: card.aiMetadata as object | null
      }));

      setFlashcards(formattedFlashcards);
    } catch (error) {
      console.error('Error fetching flashcards:', error);
      setError(error instanceof Error ? error.message : 'Wystąpił nieznany błąd');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle search
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page when search changes
  };

  // Handle filter changes
  const handleFilterChange = (type: 'status' | 'source', value: string | null) => {
    if (type === 'status') {
      setFilterStatus(value as FlashcardStatus | null);
    } else {
      setFilterSource(value as FlashcardSource | null);
    }
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Calculate total pages
  const totalPages = Math.ceil(totalFlashcards / flashcardsPerPage);

  // Create a new flashcard manually
  const handleCreateNew = () => {
    // Navigate to create flashcard page or open modal
    window.location.href = '/generate';
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Moje Fiszki</h1>
        <Button onClick={handleCreateNew}>Utwórz nowe fiszki</Button>
      </div>

      {/* Filters section */}
      <FlashcardFilters 
        onSearch={handleSearch}
        searchTerm={searchTerm}
        onFilterChange={handleFilterChange}
        filterStatus={filterStatus}
        filterSource={filterSource}
      />

      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p>{error}</p>
          <button 
            onClick={fetchFlashcards}
            className="text-red-500 underline mt-2"
          >
            Spróbuj ponownie
          </button>
        </div>
      )}

      {/* Flashcards grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="border rounded-lg p-6 h-64">
              <Skeleton className="h-6 w-3/4 mb-4" />
              <Skeleton className="h-4 w-5/6 mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-24 w-full mb-4" />
              <div className="flex justify-between">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : flashcards.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg mt-6">
          <h3 className="text-xl font-medium text-gray-600 mb-2">Brak fiszek</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || filterStatus || filterSource 
              ? 'Brak fiszek spełniających kryteria wyszukiwania.' 
              : 'Nie masz jeszcze żadnych fiszek.'}
          </p>
          <Button onClick={handleCreateNew}>
            Utwórz pierwsze fiszki
          </Button>
        </div>
      ) : (
        <>
          <div className="text-sm text-gray-500 mb-4">
            Znaleziono {totalFlashcards} fiszek
          </div>
          <FlashcardGrid 
            flashcards={flashcards}
            onRefresh={fetchFlashcards}
          />
        </>
      )}

      {/* Pagination */}
      {!isLoading && flashcards.length > 0 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
} 
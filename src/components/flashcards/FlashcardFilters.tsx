import React from 'react';
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { FlashcardStatus, FlashcardSource } from '../../types';

interface FlashcardFiltersProps {
  onSearch: (term: string) => void;
  searchTerm: string;
  onFilterChange: (type: 'status' | 'source', value: string | null) => void;
  filterStatus: FlashcardStatus | null;
  filterSource: FlashcardSource | null;
}

export function FlashcardFilters({
  onSearch,
  searchTerm,
  onFilterChange,
  filterStatus,
  filterSource
}: FlashcardFiltersProps) {
  // Handle search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearch(e.target.value);
  };

  // Handle status filter change
  const handleStatusChange = (value: string) => {
    onFilterChange('status', value === 'all' ? null : value);
  };

  // Handle source filter change
  const handleSourceChange = (value: string) => {
    onFilterChange('source', value === 'all' ? null : value);
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="search">Wyszukaj</Label>
          <Input
            id="search"
            type="text"
            placeholder="Szukaj w tekście fiszek..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="status-filter">Status</Label>
          <Select 
            onValueChange={handleStatusChange}
            defaultValue={filterStatus || 'all'}
          >
            <SelectTrigger id="status-filter">
              <SelectValue placeholder="Wybierz status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Wszystkie</SelectItem>
              <SelectItem value="accepted">Zaakceptowane</SelectItem>
              <SelectItem value="rejected">Odrzucone</SelectItem>
              <SelectItem value="pending">Oczekujące</SelectItem>
              <SelectItem value="custom">Niestandardowe</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="source-filter">Źródło</Label>
          <Select 
            onValueChange={handleSourceChange}
            defaultValue={filterSource || 'all'}
          >
            <SelectTrigger id="source-filter">
              <SelectValue placeholder="Wybierz źródło" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Wszystkie</SelectItem>
              <SelectItem value="manual">Ręczne</SelectItem>
              <SelectItem value="ai-full">AI</SelectItem>
              <SelectItem value="ai-edited">AI Edytowane</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
} 
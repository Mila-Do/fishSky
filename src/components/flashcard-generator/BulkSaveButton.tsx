import React from 'react';
import { useGenerationState } from '../../lib/context/GenerationStateContext';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress"

interface BulkSaveButtonProps {
  onSaveAll?: () => void;
  onSaveAccepted?: () => void;
  isLoading?: boolean;
  hasAccepted?: boolean;
}

export default function BulkSaveButton({
  onSaveAll,
  onSaveAccepted,
  isLoading: externalIsLoading,
  hasAccepted: externalHasAccepted
}: BulkSaveButtonProps) {
  const { 
    isSaving, 
    stats, 
    saveAllProposals, 
    saveAcceptedProposals 
  } = useGenerationState();
  
  // Use external props if provided, otherwise use state from hook
  const isLoading = externalIsLoading !== undefined ? externalIsLoading : isSaving;
  const hasAccepted = externalHasAccepted !== undefined ? externalHasAccepted : stats.accepted > 0;
  const hasProposals = stats.total > 0;
  
  // Handle saving all proposals
  const handleSaveAll = () => {
    if (onSaveAll) {
      onSaveAll();
    } else {
      saveAllProposals(true); // true = redirect after save
    }
  };
  
  // Handle saving only accepted proposals
  const handleSaveAccepted = () => {
    if (onSaveAccepted) {
      onSaveAccepted();
    } else {
      saveAcceptedProposals(true); // true = redirect after save
    }
  };
  
  if (!hasProposals) return null;
  
  return (
    <div className="mt-6 flex justify-end space-x-4">
      <Button
        variant="outline"
        disabled={!hasAccepted || isLoading}
        onClick={handleSaveAccepted}
        className={!hasAccepted ? 'opacity-50' : undefined}
      >
        {isLoading ? 'Zapisywanie...' : `Zapisz zaakceptowane (${stats.accepted})`}
      </Button>
      
      <Button
        variant="default"
        disabled={isLoading}
        onClick={handleSaveAll}
      >
        {isLoading ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Zapisywanie...
          </span>
        ) : (
          `Zapisz wszystkie (${stats.total})`
        )}
      </Button>
    </div>
  );
} 
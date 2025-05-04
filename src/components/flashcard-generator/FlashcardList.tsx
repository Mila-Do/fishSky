import React, { useState } from 'react';
import { useGenerationState } from '../../lib/context/GenerationStateContext';
import type { FlashcardProposalDTO } from '../../types';
import FlashcardListItem from './FlashcardListItem';
import EditModal from './EditModal';
import { AnimatePresence, motion } from 'framer-motion';

export default function FlashcardList() {
  const { state, proposalStates, acceptProposal, rejectProposal, updateProposal } = useGenerationState();
  const [editingProposal, setEditingProposal] = useState<FlashcardProposalDTO | null>(null);
  
  if (!state.proposals || state.proposals.length === 0) {
    if (!state.isGenerating && !state.error) {
      return (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 p-6 text-center border border-dashed border-gray-300 rounded-md bg-gray-50"
        >
          <p className="text-gray-600">
            Wygenerowane propozycje fiszek pojawią się tutaj. 
            Wklej tekst powyżej i kliknij "Generuj fiszki".
          </p>
        </motion.div>
      );
    }
    return null;
  }

  const handleEdit = (id: string) => {
    const proposal = state.proposals.find(p => p.flashcardId === id);
    if (proposal) {
      setEditingProposal(proposal);
    }
  };

  const handleSaveEdit = (updates: Partial<FlashcardProposalDTO>) => {
    if (editingProposal) {
      updateProposal(editingProposal.flashcardId, updates);
      setEditingProposal(null);
    }
  };

  const handleCloseModal = () => {
    setEditingProposal(null);
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">
        Propozycje fiszek ({state.proposals.length})
      </h2>
      
      <AnimatePresence mode="wait">
        <div className="space-y-4">
          {state.proposals.map((proposal) => {
            const status = proposalStates[proposal.flashcardId]?.status || 'pending';
            
            return (
              <motion.div
                key={proposal.flashcardId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <FlashcardListItem
                  proposal={proposal}
                  status={status}
                  onAccept={(id) => acceptProposal(id)}
                  onReject={(id) => rejectProposal(id)}
                  onEdit={(id) => handleEdit(id)}
                />
              </motion.div>
            );
          })}
        </div>
      </AnimatePresence>
      
      {editingProposal && (
        <EditModal
          isOpen={!!editingProposal}
          proposal={editingProposal}
          onClose={handleCloseModal}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
} 
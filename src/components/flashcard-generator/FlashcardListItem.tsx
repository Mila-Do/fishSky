import React from 'react';
import type { FlashcardProposalDTO } from '../../types';
import type { FlashcardListItemProps } from './types';
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';

export default function FlashcardListItem({
  proposal,
  status,
  onAccept,
  onReject,
  onEdit
}: FlashcardListItemProps) {
  const statusColors: Record<string, string> = {
    accepted: 'bg-green-50 border-green-200',
    rejected: 'bg-red-50 border-red-200',
    pending: 'bg-white border-gray-200',
    editing: 'bg-blue-50 border-blue-200'
  };

  const buttonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 }
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`border rounded-md p-4 transition-colors ${statusColors[status]}`}
    >
      <div className="flex justify-between items-start">
        <div className="w-3/4">
          <p className="font-medium mb-2">{proposal.flashcardFront}</p>
        </div>
        <div className="flex space-x-2">
          <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
            <Button 
              onClick={() => onAccept(proposal.flashcardId)}
              disabled={status === 'accepted'}
              variant="ghost"
              size="icon"
              className={`p-1 ${
                status === 'accepted' 
                  ? 'bg-green-100 text-green-700' 
                  : 'hover:bg-green-100 hover:text-green-700'
              }`}
              title="Zatwierdź"
              aria-label="Zatwierdź fiszkę"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </Button>
          </motion.div>

          <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
            <Button 
              onClick={() => onEdit(proposal.flashcardId)}
              variant="ghost"
              size="icon"
              className="p-1 hover:bg-blue-100 hover:text-blue-700"
              title="Edytuj"
              aria-label="Edytuj fiszkę"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
            </Button>
          </motion.div>

          <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
            <Button 
              onClick={() => onReject(proposal.flashcardId)}
              disabled={status === 'rejected'}
              variant="ghost"
              size="icon"
              className={`p-1 ${
                status === 'rejected' 
                  ? 'bg-red-100 text-red-700' 
                  : 'hover:bg-red-100 hover:text-red-700'
              }`}
              title="Odrzuć"
              aria-label="Odrzuć fiszkę"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </motion.div>
        </div>
      </div>
      
      <div className="border-t mt-3 pt-3">
        <p className="text-gray-700">{proposal.flashcardBack}</p>
      </div>
      
      {status !== 'pending' && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-2 text-sm"
        >
          {status === 'accepted' && (
            <span className="text-green-600">✓ Zaakceptowano</span>
          )}
          {status === 'rejected' && (
            <span className="text-red-600">✗ Odrzucono</span>
          )}
        </motion.div>
      )}
    </motion.div>
  );
} 
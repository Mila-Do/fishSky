import type { FlashcardProposalDTO, GenerationGetResponseDTO } from '../../types';

// Component Props Types
export interface TextInputAreaProps {
  value: string;
  onChange: (text: string) => void;
  isDisabled?: boolean;
  error?: string | null;
}

export interface GenerateButtonProps {
  onClick: () => void;
  isDisabled: boolean;
  isLoading: boolean;
}

export interface SkeletonLoaderProps {
  isVisible: boolean;
  message?: string;
}

export interface ErrorNotificationProps {
  error?: string | null;
  onDismiss?: () => void;
  onRetry?: () => void;
}

export interface FlashcardListProps {
  proposals: FlashcardProposalDTO[];
  onItemAction: (id: string, action: 'accept' | 'reject' | 'edit') => void;
  isLoading: boolean;
  generationId: string | null;
}

export interface FlashcardListItemProps {
  proposal: FlashcardProposalDTO;
  onAccept: (id: string) => void;
  onEdit: (id: string) => void;
  onReject: (id: string) => void;
  status: 'pending' | 'accepted' | 'rejected' | 'editing';
}

export interface EditModalProps {
  isOpen: boolean;
  proposal: FlashcardProposalDTO;
  onClose: () => void;
  onSave: (updates: Partial<FlashcardProposalDTO>) => void;
}

export interface BulkSaveButtonProps {
  onSaveAll: () => void;
  onSaveAccepted: () => void;
  isLoading: boolean;
  hasAccepted: boolean;
}

// State Types
export interface TextInputAreaState {
  text: string;
  textLength: number;
  isValid: boolean;
  errors: string[];
}

export interface GenerationStatusState {
  status: 'idle' | 'loading' | 'success' | 'error';
  error?: string;
  generationCount?: number;
  generationDuration?: number;
}

export interface FlashcardProposalState {
  proposal: FlashcardProposalDTO;
  status: 'pending' | 'accepted' | 'rejected' | 'editing';
}

export interface EditFormState {
  front: string;
  back: string;
  isValid: boolean;
  errors: {
    front?: string;
    back?: string;
  };
}

// Context Types
export interface GenerationContextState {
  sourceText: string;
  isGenerating: boolean;
  generationId: string | null;
  proposals: FlashcardProposalDTO[];
  error: string | null;
  generationCount: number;
  generationDuration: number;
}

// API Response Types
export type GenerationResponse = GenerationGetResponseDTO; 
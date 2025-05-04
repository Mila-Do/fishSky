import { useState, useEffect, useMemo } from 'react';
import type { 
  FlashcardProposalDTO, 
  GenerationCreateCommandDTO,
  GenerationGetResponseDTO,
  FlashcardStatus,
  FlashcardSource
} from '../../types';
import { supabaseClient, defaultUserId } from '../../db/supabase.client';

// Internal types
interface TextInputAreaState {
  text: string;
  textLength: number;
  isValid: boolean;
  errors: string[];
}

interface GenerationStatusState {
  status: 'idle' | 'loading' | 'success' | 'error';
  error?: string;
  generationCount?: number;
  generationDuration?: number;
}

interface FlashcardProposalState {
  proposal: FlashcardProposalDTO;
  status: 'pending' | 'accepted' | 'rejected' | 'editing';
}

interface EditFormState {
  front: string;
  back: string;
  isValid: boolean;
  errors: {
    front?: string;
    back?: string;
  };
}

interface GenerationContextState {
  sourceText: string;
  isGenerating: boolean;
  generationId: string | null;
  proposals: FlashcardProposalDTO[];
  error: string | null;
  generationCount: number;
  generationDuration: number;
}

interface GenerationStats {
  total: number;
  accepted: number;
  rejected: number;
  pending: number;
}

// Helper function to calculate text hash
async function calculateTextHash(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// Local storage keys
const STORAGE_KEY_GENERATION = 'fishsky_generation_state';
const STORAGE_KEY_PROPOSALS = 'fishsky_proposals_state';
const STORAGE_KEY_HASH = 'fishsky_last_text_hash';
const STORAGE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

// Helper function to safely access localStorage
const getLocalStorage = (key: string): string | null => {
  if (typeof window !== 'undefined' && window.localStorage) {
    return localStorage.getItem(key);
  }
  return null;
};

const setLocalStorage = (key: string, value: string): void => {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem(key, value);
  }
};

const removeLocalStorage = (key: string): void => {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.removeItem(key);
  }
};

export function useGenerationState() {
  // Track previously generated text to avoid duplicates
  const [lastGeneratedHash, setLastGeneratedHash] = useState<string | null>(null);
  
  // Main generation state
  const [state, setState] = useState<GenerationContextState>({
    sourceText: getLocalStorage('fishsky_source_text') || '',
    isGenerating: false,
    generationId: null,
    proposals: [],
    error: null,
    generationCount: 0,
    generationDuration: 0
  });

  // Proposal states tracking
  const [proposalStates, setProposalStates] = useState<Record<string, FlashcardProposalState>>({});
  
  // Save state
  const [isSaving, setIsSaving] = useState(false);
  const [redirectAfterSave, setRedirectAfterSave] = useState(false);

  // Generate flashcards
  const generateFlashcards = async (text: string) => {
    // Update source text in state
    setState(prev => ({ ...prev, sourceText: text, error: null }));
    
    // Save to localStorage
    setLocalStorage('fishsky_source_text', text);
    
    // Validate text length
    if (text.length < 1000 || text.length > 10000) {
      setState(prev => ({
        ...prev,
        error: `Tekst musi zawierać od 1000 do 10000 znaków (obecna długość: ${text.length})`
      }));
      return;
    }

    try {
      // Check if text is the same as previously generated
      const textHash = await calculateTextHash(text);
      if (textHash === lastGeneratedHash) {
        setState(prev => ({
          ...prev,
          error: 'Ten tekst został już przetworzony. Wprowadź nowy tekst.'
        }));
        return;
      }

      // Reset states
      setState(prev => ({
        ...prev,
        isGenerating: true,
        error: null
      }));
      setProposalStates({});

      // Call API to generate flashcards
      const generationRequest: GenerationCreateCommandDTO = {
        generationSourceText: text,
        generationModel: 'simple-text-splitting'
      };

      // Utwórz rekord generacji w bazie danych
      const { data, error } = await supabaseClient
        .from('generations')
        .insert({
          sourceTextHash: textHash,
          sourceTextLength: text.length,
          model: generationRequest.generationModel,
          generationDuration: 0,
          userId: defaultUserId
        })
        .select()
        .single();

      if (error) {
        throw new Error(`API Error: ${error.message}`);
      }

      if (!data) {
        throw new Error('No data returned from API');
      }
      
      // Uzyskaj ID generacji
      const generationId = data.id;
      
      // Przetwarzanie tekstu na fiszki (prosta implementacja)
      const sentences = text.split(/[.!?]/).filter(s => s.trim().length > 20);
      
      // Przygotuj propozycje fiszek (maksymalnie 10)
      const proposals: FlashcardProposalDTO[] = [];
      
      const maxProposals = Math.min(10, sentences.length);
      for (let i = 0; i < maxProposals; i++) {
        // Wybierz zdanie
        const sentence = sentences[i].trim();
        
        // Podziel zdanie na przód i tył fiszki
        const parts = sentence.split(',');
        let front, back;
        
        if (parts.length > 1) {
          // Jeśli jest przecinek, użyj go do podziału
          front = parts[0].trim();
          back = parts.slice(1).join(',').trim();
        } else {
          // Inaczej podziel mniej więcej na pół
          const mid = Math.floor(sentence.length / 2);
          front = sentence.substring(0, mid).trim();
          back = sentence.substring(mid).trim();
        }
        
        // Dodaj propozycję fiszki
        proposals.push({
          flashcardId: `temp-${i}-${Date.now()}`,
          flashcardFront: front,
          flashcardBack: back,
          flashcardStatus: 'pending',
          flashcardSource: 'ai-full'
        });
      }
      
      // Initialize proposal states
      const newProposalStates: Record<string, FlashcardProposalState> = {};
      proposals.forEach(proposal => {
        newProposalStates[proposal.flashcardId] = {
          proposal,
          status: 'pending'
        };
      });
      
      setProposalStates(newProposalStates);
      setLastGeneratedHash(textHash);
      
      setState(prev => ({
        ...prev,
        isGenerating: false,
        generationId: generationId,
        proposals: proposals,
        generationCount: proposals.length,
        generationDuration: 0
      }));
      
      // Save to local storage
      setLocalStorage(STORAGE_KEY_HASH, textHash);
      setLocalStorage(STORAGE_KEY_GENERATION, JSON.stringify({
        ...state,
        generationId: generationId,
        proposals: proposals,
        timestamp: Date.now()
      }));
      setLocalStorage(STORAGE_KEY_PROPOSALS, JSON.stringify({
        proposalStates: newProposalStates,
        timestamp: Date.now()
      }));
      
    } catch (error) {
      console.error('Error generating flashcards:', error);
      setState(prev => ({
        ...prev,
        isGenerating: false,
        error: error instanceof Error ? error.message : 'Wystąpił nieznany błąd podczas generowania fiszek.'
      }));
    }
  };

  // Proposal management functions
  const acceptProposal = (id: string) => {
    setProposalStates(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        status: 'accepted'
      }
    }));
  };

  const rejectProposal = (id: string) => {
    setProposalStates(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        status: 'rejected'
      }
    }));
  };

  const updateProposal = (id: string, updates: Partial<FlashcardProposalDTO>) => {
    setProposalStates(prev => {
      const current = prev[id];
      if (!current) return prev;
      
      return {
        ...prev,
        [id]: {
          proposal: {
            ...current.proposal,
            ...updates
          },
          status: 'accepted' // Auto-accept edited proposals
        }
      };
    });
  };

  // Save proposals
  const saveProposals = async (onlyAccepted: boolean = false, redirect: boolean = false) => {
    if (!state.generationId) {
      setState(prev => ({
        ...prev,
        error: 'Brak identyfikatora generacji. Wygeneruj fiszki ponownie.'
      }));
      return;
    }

    try {
      setIsSaving(true);
      setRedirectAfterSave(redirect);
      
      // Filter proposals to be saved
      const proposals = Object.values(proposalStates)
        .filter(p => !onlyAccepted || p.status === 'accepted')
        .map(p => ({
          front: p.proposal.flashcardFront,
          back: p.proposal.flashcardBack,
          source: 'ai-full' as FlashcardSource,
          generationId: state.generationId,
          status: 'accepted' as FlashcardStatus,
          userId: defaultUserId
        }));
      
      if (proposals.length === 0) {
        setState(prev => ({
          ...prev,
          error: 'Brak zaakceptowanych fiszek do zapisania.'
        }));
        setIsSaving(false);
        return;
      }

      // Call API to save flashcards
      const { data, error } = await supabaseClient
        .from('flashcards')
        .insert(proposals)
        .select();

      if (error) {
        throw new Error(`API Error: ${error.message}`);
      }

      // Clear local storage after successful save
      removeLocalStorage(STORAGE_KEY_GENERATION);
      removeLocalStorage(STORAGE_KEY_PROPOSALS);
      removeLocalStorage(STORAGE_KEY_HASH);
      
      // Redirect if needed
      if (redirect) {
        window.location.href = '/flashcards';
      }
      
    } catch (error) {
      console.error('Error saving flashcards:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Wystąpił nieznany błąd podczas zapisywania fiszek.'
      }));
    } finally {
      setIsSaving(false);
    }
  };

  const saveAllProposals = (redirect: boolean = false) => saveProposals(false, redirect);
  const saveAcceptedProposals = (redirect: boolean = false) => saveProposals(true, redirect);
  
  // Calculate stats from proposal states
  const stats = useMemo<GenerationStats>(() => {
    const values = Object.values(proposalStates);
    return {
      total: values.length,
      accepted: values.filter(p => p.status === 'accepted').length,
      rejected: values.filter(p => p.status === 'rejected').length,
      pending: values.filter(p => p.status === 'pending').length
    };
  }, [proposalStates]);
  
  // Load saved state from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return; // Skip on server

    try {
      const savedGenerationJSON = getLocalStorage(STORAGE_KEY_GENERATION);
      const savedProposalsJSON = getLocalStorage(STORAGE_KEY_PROPOSALS);
      const savedHash = getLocalStorage(STORAGE_KEY_HASH);
      
      if (savedGenerationJSON && savedProposalsJSON && savedHash) {
        const savedGeneration = JSON.parse(savedGenerationJSON);
        const savedProposals = JSON.parse(savedProposalsJSON);
        
        // Check if saved data is still valid (less than 24 hours old)
        if (
          savedGeneration.timestamp && 
          Date.now() - savedGeneration.timestamp < STORAGE_EXPIRY &&
          savedProposals.timestamp &&
          Date.now() - savedProposals.timestamp < STORAGE_EXPIRY
        ) {
          setState({
            sourceText: savedGeneration.sourceText || '',
            isGenerating: false,
            generationId: savedGeneration.generationId,
            proposals: savedGeneration.proposals || [],
            error: null,
            generationCount: savedGeneration.generationCount || 0,
            generationDuration: savedGeneration.generationDuration || 0
          });
          
          setProposalStates(savedProposals.proposalStates || {});
          setLastGeneratedHash(savedHash);
        } else {
          // Clear expired data
          removeLocalStorage(STORAGE_KEY_GENERATION);
          removeLocalStorage(STORAGE_KEY_PROPOSALS);
          removeLocalStorage(STORAGE_KEY_HASH);
        }
      }
    } catch (error) {
      console.error('Error loading saved state:', error);
      // Clear potentially corrupted data
      removeLocalStorage(STORAGE_KEY_GENERATION);
      removeLocalStorage(STORAGE_KEY_PROPOSALS);
      removeLocalStorage(STORAGE_KEY_HASH);
    }
  }, []);
  
  // Save state updates to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return; // Skip on server
    
    if (state.generationId && Object.keys(proposalStates).length > 0) {
      setLocalStorage(STORAGE_KEY_GENERATION, JSON.stringify({
        ...state,
        timestamp: Date.now()
      }));
      
      setLocalStorage(STORAGE_KEY_PROPOSALS, JSON.stringify({
        proposalStates,
        timestamp: Date.now()
      }));
    }
  }, [state.generationId, state.proposals, proposalStates]);

  return {
    state,
    proposalStates,
    isSaving,
    stats,
    generateFlashcards,
    acceptProposal,
    rejectProposal,
    updateProposal,
    saveAllProposals,
    saveAcceptedProposals,
    updateSourceText: (text: string) => {
      setState(prev => ({ ...prev, sourceText: text }));
      setLocalStorage('fishsky_source_text', text);
    }
  };
} 
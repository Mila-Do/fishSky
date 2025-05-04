# Plan implementacji widoku Generator Fiszek

## 1. Przegląd
Generator Fiszek to kluczowy widok aplikacji fishSky, umożliwiający użytkownikom tworzenie fiszek edukacyjnych z pomocą AI. Użytkownik wprowadza tekst źródłowy, a system generuje propozycje fiszek, które można zaakceptować, edytować lub odrzucić przed zapisaniem ich do własnej kolekcji.

## 2. Routing widoku
Widok będzie dostępny pod ścieżką: `/generate`

## 3. Struktura komponentów
```
FlashcardGenerationView (główny komponent widoku)
├── TextInputArea (pole tekstowe do wklejania tekstu)
├── GenerateButton (przycisk inicjujący proces generowania fiszek)
├── SkeletonLoader (wskaźnik ładowania podczas oczekiwania na odpowiedź API)
├── ErrorNotification (komponent do wyświetlania komunikatów o błędach)
└── FlashcardList (lista wyświetlająca propozycje fiszek otrzymanych z API)
    ├── FlashcardListItem (pojedynczy element listy, reprezentujący jedną propozycję fiszki)
    └── BulkSaveButton (przyciski do zapisu wszystkich fiszek lub tylko zaakceptowanych)
```

## 4. Szczegóły komponentów

### FlashcardGenerationView
- **Opis**: Główny kontener widoku generatora fiszek, zarządzający stanem procesu.
- **Elementy**: Kontener z nagłówkiem, komunikat instrukcji, komponenty potomne, licznik statystyk.
- **Obsługiwane zdarzenia**: Koordynacja przepływu danych między komponentami.
- **Warunki walidacji**: Nie dotyczy (delegowane do komponentów potomnych).
- **Typy**: Wykorzystuje GenerationContext.
- **Propsy**: Nie dotyczy (komponent najwyższego poziomu).

### TextInputArea
- **Opis**: Pole tekstowe do wprowadzania tekstu źródłowego.
- **Elementy**: TextArea z licznikiem znaków (1000-10000), komunikaty błędów.
- **Obsługiwane zdarzenia**: Wprowadzanie tekstu z walidacją, blokowanie podczas generowania.
- **Warunki walidacji**: Min 1000, max 10000 znaków, unikalne teksty.
- **Typy**: `TextInputAreaState`.
- **Propsy**: onChange, isDisabled, value.

### GenerateButton
- **Opis**: Przycisk inicjujący proces generowania fiszek.
- **Elementy**: Przycisk "Generuj" ze stylowaniem.
- **Obsługiwane zdarzenia**: Kliknięcie inicjujące, blokowanie podczas generowania.
- **Warunki walidacji**: Nie dotyczy.
- **Typy**: Nie dotyczy.
- **Propsy**: onClick, isDisabled, isLoading.

### SkeletonLoader
- **Opis**: Komponent wizualizacji ładowania danych (skeleton).
- **Elementy**: Szablon UI imitujący strukturę kart.
- **Obsługiwane zdarzenia**: Brak interakcji użytkownika.
- **Warunki walidacji**: Nie dotyczy.
- **Typy**: Stateless.
- **Propsy**: isVisible, message (opcjonalnie).

### ErrorNotification
- **Opis**: Komponent wyświetlający komunikaty o błędach.
- **Elementy**: Komunikat tekstowy, ikona błędu.
- **Obsługiwane zdarzenia**: Brak - komponent informacyjny.
- **Warunki walidacji**: Przekazany komunikat nie powinien być pusty.
- **Typy**: String (wiadomość błędu).
- **Propsy**: error, onDismiss, onRetry.

### FlashcardList
- **Opis**: Lista propozycji fiszek wygenerowanych przez AI.
- **Elementy**: Nagłówek z liczbą propozycji, lista elementów, przyciski akcji zbiorczych.
- **Obsługiwane zdarzenia**: Przewijanie listy, delegowanie interakcji.
- **Warunki walidacji**: Nie dotyczy.
- **Typy**: `FlashcardProposalDTO[]`.
- **Propsy**: proposals, onItemAction, isLoading, generationId.

### FlashcardListItem
- **Opis**: Pojedyncza karta przedstawiająca jedną propozycję fiszki.
- **Elementy**: Wyświetlenie tekstu przodu i tyłu fiszki, przyciski "Zatwierdź", "Edytuj", "Odrzuć".
- **Obsługiwane zdarzenia**: onClick dla każdego przycisku (modyfikacja stanu fiszki, otwarcie edycji).
- **Warunki walidacji**: W edycji: front ≤ 200 znaków, back ≤ 500 znaków.
- **Typy**: Rozszerzony typ `FlashcardProposalDTO`, lokalny model stanu (flagi accepted/edited).
- **Propsy**: proposal, onAccept, onEdit, onReject, status.

### EditModal
- **Opis**: Modal do edycji propozycji fiszki.
- **Elementy**: Nagłówek, formularz edycji, przyciski akcji.
- **Obsługiwane zdarzenia**: Edycja zawartości, zapisanie zmian, anulowanie, zamknięcie modalu.
- **Warunki walidacji**: Przód ≤ 200 znaków, tył ≤ 500 znaków.
- **Typy**: `FlashcardProposalDTO`, `EditFormState`.
- **Propsy**: isOpen, proposal, onClose, onSave.

### BulkSaveButton
- **Opis**: Przyciski do zbiorczego zapisu fiszek.
- **Elementy**: "Zapisz wszystkie", "Zapisz zatwierdzone", wskaźnik ładowania.
- **Obsługiwane zdarzenia**: Zapisywanie propozycji, blokowanie podczas procesu.
- **Warunki walidacji**: Dostępność zaakceptowanych fiszek do zapisania.
- **Typy**: Nie dotyczy.
- **Propsy**: onSaveAll, onSaveAccepted, isLoading, hasAccepted.

## 5. Typy

### Typy API
```typescript
// Typ dla propozycji fiszki
interface FlashcardProposalDTO {
  flashcardId: string;
  flashcardFront: string;
  flashcardBack: string;
  flashcardStatus: FlashcardStatus;
  flashcardSource: 'ai-full';
}

// Komenda tworzenia generacji
interface GenerationCreateCommandDTO {
  generationSourceText: string; // 1000-10000 znaków
  generationModel: string;
}

// Odpowiedź generacji
interface GenerationGetResponseDTO {
  generationId: string;
  generationFlashcardProposals: FlashcardProposalDTO[];
  generationCount: number;
  generationDuration: number;
}

// Odpowiedź API
interface ApiSuccessResponse<T> {
  apiData: T;
  apiMetadata: {
    apiTimestamp: string;
    apiRequestId: string;
  };
}

// Błąd API
interface ApiErrorResponse {
  apiError: {
    apiErrorCode: string;
    apiErrorMessage: string;
    apiErrorDetails: object | null;
  };
  apiMetadata: {
    apiTimestamp: string;
    apiRequestId: string;
  };
}
```

### Typy wewnętrzne
```typescript
// Stan pola tekstowego
interface TextInputAreaState {
  text: string;
  textLength: number;
  isValid: boolean;
  errors: string[];
}

// Stan statusu generacji
interface GenerationStatusState {
  status: 'idle' | 'loading' | 'success' | 'error';
  error?: string;
  generationCount?: number;
  generationDuration?: number;
}

// Stan propozycji fiszki
interface FlashcardProposalState {
  proposal: FlashcardProposalDTO;
  status: 'pending' | 'accepted' | 'rejected' | 'editing';
}

// Stan formularza edycji
interface EditFormState {
  front: string;
  back: string;
  isValid: boolean;
  errors: {
    front?: string;
    back?: string;
  };
}

// Stan dla kontekstu generacji
interface GenerationContextState {
  sourceText: string;
  isGenerating: boolean;
  generationId: string | null;
  proposals: FlashcardProposalDTO[];
  error: string | null;
  generationCount: number;
  generationDuration: number;
}
```

## 6. Zarządzanie stanem

Hook `useGenerationState` zarządza wszystkimi aspektami procesu generowania:

```typescript
const useGenerationState = () => {
  // Referencja do poprzednio wygenerowanego tekstu
  const [lastGeneratedHash, setLastGeneratedHash] = useState<string | null>(null);
  
  // Główny stan generacji
  const [state, setState] = useState<GenerationContextState>({...});

  // Stan propozycji fiszek
  const [proposalStates, setProposalStates] = useState<Record<string, FlashcardProposalState>>({});
  
  // Stan zapisywania
  const [isSaving, setIsSaving] = useState(false);
  const [redirectAfterSave, setRedirectAfterSave] = useState(false);

  // Funkcje
  const generateFlashcards = async (text: string) => {...};
  const calculateTextHash = async (text: string): Promise<string> => {...};
  const acceptProposal = (id: string) => {...};
  const rejectProposal = (id: string) => {...};
  const updateProposal = (id: string, updates: Partial<FlashcardProposalDTO>) => {...};
  const saveAllProposals = async (redirect = false) => {...};
  const saveAcceptedProposals = async (redirect = false) => {...};
  
  // Statystyki 
  const stats = useMemo(() => {...}, [proposalStates]);
  
  // Zapisywanie i przywracanie stanu z localStorage
  useEffect(() => {...}, [state.generationId, state.proposals, proposalStates]);
  useEffect(() => {...}, []);

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
    saveAcceptedProposals
  };
};
```

## 7. Integracja API

### Generowanie propozycji fiszek
- **Endpoint**: `POST /generations`
- **Funkcja**: `generateFlashcards` z `generation.service.ts`
- **Request**: generationSourceText (1000-10000 znaków), generationModel
- **Response**: generationId, generationFlashcardProposals, generationCount, generationDuration
- **Błędy**: Timeout, Content Policy, Server Overload, Invalid Response, Unknown

### Zapisywanie fiszek
- **Endpoint**: `POST /flashcards/batch`
- **Funkcja**: `createFlashcardBatch` z `flashcard.service.ts`
- **Walidacja**: `validateFlashcardSource` (spójność źródła i generationId)
- **Request**: flashcardList z właściwościami front, back, source, generationId, status
- **Response**: listItems, listTotal
- **Błędy**: Walidacja źródła/generationId, błędy zapisu DB

### Zabezpieczenia i optymalizacje
- Hash tekstu dla unikania duplikatów
- Zapisywanie stanu w localStorage
- Przekierowanie po zapisie

## 8. Interakcje użytkownika

1. **Wprowadzanie tekstu**:
   - Wpisywanie/wklejanie tekstu z walidacją długości
   - Aktualizacja licznika znaków
   - Aktywacja/dezaktywacja przycisku generowania

2. **Generowanie propozycji**:
   - Blokada formularza podczas generowania
   - Wyświetlenie SkeletonLoader i/lub ErrorNotification
   - Wyświetlenie listy propozycji po zakończeniu

3. **Zarządzanie propozycjami**:
   - Akceptacja/odrzucenie fiszek
   - Edycja w modalu
   - Aktualizacja statystyk w czasie rzeczywistym

4. **Zapisywanie propozycji**:
   - Zapisywanie wszystkich lub tylko zaakceptowanych
   - Wyświetlenie wskaźnika ładowania
   - Przekierowanie lub komunikat sukcesu

5. **Zachowanie stanu**:
   - Automatyczny zapis w localStorage
   - Przywracanie po odświeżeniu (24h ważności)

## 9. Walidacja i warunki

1. **Tekst źródłowy**:
   - Długość 1000-10000 znaków
   - Unikalność tekstu (hash)

2. **Edycja fiszki**:
   - Przód ≤ 200 znaków
   - Tył ≤ 500 znaków

3. **Zapisywanie**:
   - Minimum jedna zaakceptowana fiszka
   - Poprawny status (accepted)

4. **Zgodność źródła i generationId**:
   - AI-full/edited wymaga generationId
   - Walidacja przez validateFlashcardSource

## 10. Obsługa błędów

1. **Błędy generowania**:
   - Problemy API, timeout, naruszenie zasad
   - Wyświetlenie w ErrorNotification
   - Możliwość ponownej próby

2. **Błędy zapisywania**:
   - Problemy połączenia, autoryzacji, walidacji
   - Zachowanie stanu fiszek
   - Możliwość ponownej próby

3. **Błędy walidacji**:
   - Wyświetlenie przy polach formularza
   - Instrukcje naprawy

4. **Utrata połączenia**:
   - Zapis w localStorage
   - Przywrócenie po ponowieniu połączenia

## 11. Kroki implementacji

1. Konfiguracja routingu i struktury
2. Implementacja TextInputArea i GenerateButton
3. Implementacja SkeletonLoader i ErrorNotification
4. Implementacja hook useGenerationState
5. Implementacja FlashcardList i FlashcardListItem
6. Implementacja EditModal
7. Implementacja BulkSaveButton
8. Integracja z API
9. Testowanie i debugowanie
10. Optymalizacja wydajności 
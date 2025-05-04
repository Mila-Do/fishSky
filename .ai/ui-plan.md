# Architektura UI dla fishSky

## 1. Przegląd struktury UI

Architektura UI dla fishSky została zaprojektowana z naciskiem na prostotę i funkcjonalność. Aplikacja wykorzystuje Astro z React dla komponentów interaktywnych oraz bibliotekę shadcn/ui dla zapewnienia spójnego wyglądu. Zdecydowano się na tryb ciemny jako jedyny dostępny motyw oraz na proste przejścia między stronami realizowane poprzez przeładowania strony.

Główna struktura aplikacji opiera się na:
- Topbarze z nawigacją do głównych sekcji
- Układzie strony z głównym obszarem treści
- Modułowej architekturze z wyraźnie oddzielonymi widokami dla różnych funkcjonalności
- Zastosowaniu shadowcn/ui dla zapewnienia spójności wizualnej i dostępności

## 2. Lista widoków

### 2.1. Widok uwierzytelniania
- **Ścieżka widoku**: `/login` i `/register`
- **Główny cel**: Umożliwienie użytkownikom rejestracji i logowania
- **Kluczowe informacje**: Formularze logowania i rejestracji, komunikaty błędów
- **Kluczowe komponenty**:
  - Przełączany formularz logowania/rejestracji
  - Pola na email i hasło
  - Przyciski akcji
  - Komunikaty o błędach walidacji
- **UX, dostępność i bezpieczeństwo**:
  - Czytelne komunikaty błędów
  - Walidacja formularzy w czasie rzeczywistym
  - Zabezpieczenie przed atakami typu brute force
  - Możliwość odzyskania hasła
  - Focus management dla pól formularza

### 2.2. Dashboard
- **Ścieżka widoku**: `/dashboard`
- **Główny cel**: Zapewnienie szybkiego dostępu do głównych funkcji aplikacji i podstawowych statystyk
- **Kluczowe informacje**: Liczba fiszek, status nauki, szybkie linki do generatora i listy fiszek
- **Kluczowe komponenty**:
  - Karty z podstawowymi statystykami
  - Przyciski szybkiego dostępu do kluczowych funkcji
  - Wykres postępu nauki (prosty)
- **UX, dostępność i bezpieczeństwo**:
  - Przejrzysta organizacja elementów
  - Wysokie kontrasty dla czytelności
  - Zabezpieczenie dostępu tylko dla zalogowanych użytkowników

### 2.3. Generator fiszek
- **Ścieżka widoku**: `/generate`
- **Główny cel**: Umożliwienie generowania fiszek na podstawie wprowadzonego tekstu i ich rewizji (zaakceptuj, edytuj lub odrzuć)
- **Kluczowe informacje**: Wprowadzony tekst, propozycje fiszek generowanych przez AI, status generowania, przyciski akceptacji, edycji lub odrzucenia dla każdej fiszki
- **Kluczowe komponenty**:
  - Formularz z polem tekstowym (1000-10000 znaków)
  - Przycisk generowania
  - Wskaźnik ładowania
  - Lista propozycji fiszek z opcjami:
    - Akceptacji (bez edycji)
    - Edycji (przed akceptacją)
    - Odrzucenia
  - Przyciski zbiorczego zapisu: "Zapisz wszystkie", "Zapisz zatwierdzone"
- **UX, dostępność i bezpieczeństwo**:
  - Intuicyjny formularz 
  - Wyraźne oznaczenie statusu generowania
  - Licznik znaków w polu tekstowym
  - Możliwość zachowania stanu w przypadku opuszczenia strony
  - Zabezpieczenie przed wielokrotnym wysłaniem tego samego tekstu
  - Komunikaty o błędach API
  - Responsywność
  - Czytelne komunikaty i inline komunikaty o błędach

### 2.4. Lista fiszek
- **Ścieżka widoku**: `/flashcards`
- **Główny cel**: Zarządzanie istniejącymi fiszkami
- **Kluczowe informacje**: Lista fiszek z podziałem na kolumny według statusu, możliwość filtrowania i sortowania
- **Kluczowe komponenty**:
  - Tabela/lista z fiszkami
  - Kolorowe oznaczenia źródeł fiszek:
    - Zielony: manual
    - Niebieski: ai-full
    - Fioletowy: ai-edited
  - Przyciski do edycji i usuwania fiszek
  - Panel filtrowania
  - Paginacja (20 elementów na stronę)
  - Przycisk dodawania nowej fiszki ręcznie
- **UX, dostępność i bezpieczeństwa**:
  - Potwierdzenie przed usunięciem
  - Szybki dostęp do często używanych akcji
  - Przystosowanie do obsługi klawiatury

### 2.5. Modal edycji fiszki
- **Ścieżka widoku**: Jako komponent w obrębie `/flashcards`
- **Główny cel**: Edycja istniejącej fiszki lub tworzenie nowej
- **Kluczowe informacje**: Aktualne dane fiszki (przód/tył)
- **Kluczowe komponenty**:
  - Formularz z polami na przód i tył fiszki
  - Przyciski zapisu/anulowania
  - Wskaźnik statusu zapisu
- **UX, dostępność i bezpieczeństwo**:
  - Autofocus na pierwszym polu
  - Przejrzyste komunikaty o błędach walidacji
  - Możliwość zamknięcia przez Escape lub kliknięcie poza obszarem
  - Zachowanie zmian przy przypadkowym zamknięciu

### 2.6. Panel użytkownika
- **Ścieżka widoku**: `/profile`
- **Główny cel**: Zarządzanie kontem użytkownika
- **Kluczowe informacje**: Dane użytkownika, opcje konta
- **Kluczowe komponenty**:
  - Formularz z podstawowymi danymi (email)
  - Przycisk wylogowania
  - Opcja usunięcia konta
- **UX, dostępność i bezpieczeństwo**:
  - Potwierdzenie przed wykonaniem nieodwracalnych operacji
  - Wyraźne komunikaty o konsekwencjach usunięcia konta
  - Zabezpieczenia przed przypadkowym wylogowaniem

### 2.7. Sesja nauki
- **Ścieżka widoku**: `/learning-session`
- **Główny cel**: Umożliwienie nauki z fiszek w oparciu o algorytm powtórek
- **Kluczowe informacje**: Aktualna fiszka, postęp sesji
- **Kluczowe komponenty**:
  - Karta z przednią częścią fiszki
  - Przycisk do obracania fiszki (pokazania tylnej części)
  - Przyciski oceny znajomości (po zobaczeniu tylnej części)
  - Wskaźnik postępu sesji
  - Przycisk zakończenia sesji
- **UX, dostępność i bezpieczeństwo**:
  - Intuicyjny interfejs obracania fiszki
  - Przejrzyste oznaczenia przycisków oceny
  - Możliwość obsługi za pomocą klawiatury
  - Zabezpieczenie przed przypadkowym zakończeniem sesji

## 3. Mapa podróży użytkownika

### 3.1. Przepływ nowego użytkownika
1. Strona główna → Przycisk "Zarejestruj się"
2. Widok uwierzytelniania (formularz rejestracji)
3. Po rejestracji → Dashboard
4. Dashboard → Generator fiszek
5. Generator → Wprowadzenie tekstu → Generowanie propozycji
6. Przeglądanie propozycji → Akceptacja/Edycja/Odrzucenie
7. Zbiorcze zapisanie wybranych fiszek → Lista fiszek
8. Lista fiszek → Sesja nauki

### 3.2. Przepływ istniejącego użytkownika
1. Strona główna → Przycisk "Zaloguj się"
2. Widok uwierzytelniania (formularz logowania)
3. Po logowaniu → Dashboard z podstawowymi statystykami
4. Wybór dalszej ścieżki:
   - Dashboard → Generator (tworzenie nowych fiszek)
   - Dashboard → Lista fiszek (zarządzanie istniejącymi)
   - Dashboard → Sesja nauki (nauka z fiszek)

### 3.3. Przepływ generowania fiszek
1. Generator → Wprowadzenie tekstu źródłowego (1000-10000 znaków)
2. Kliknięcie przycisku "Generuj"
3. Wyświetlenie wskaźnika ładowania
4. Otrzymanie propozycji fiszek
5. Dla każdej propozycji:
   - Akceptacja bez zmian (ai-full)
   - Edycja i akceptacja (ai-edited)
   - Odrzucenie
6. Kliknięcie "Zapisz wszystkie" lub "Zapisz zatwierdzone"
7. Przekierowanie do listy fiszek z nowo dodanymi fiszkami

### 3.4. Przepływ zarządzania fiszkami
1. Lista fiszek → Przeglądanie fiszek z opcją filtrowania i sortowania
2. Edycja fiszki → Otwarcie modala edycji → Zapisanie zmian
3. Usunięcie fiszki → Potwierdzenie → Aktualizacja listy
4. Dodanie nowej fiszki ręcznie → Otwarcie modala → Wypełnienie formularza → Zapisanie

### 3.5. Przepływ sesji nauki
1. Sesja nauki → Wyświetlenie pierwszej fiszki (przód)
2. Kliknięcie/interakcja dla pokazania tylnej części
3. Ocena znajomości (opcje zależne od algorytmu powtórek)
4. Przejście do kolejnej fiszki
5. Po zakończeniu sesji → Podsumowanie i powrót do dashboard

## 4. Układ i struktura nawigacji

### 4.1. Topbar
Stały element na górze każdej strony zawierający:
- Logo aplikacji (przekierowanie do dashboard)
- Główną nawigację:
  - Dashboard
  - Generator fiszek
  - Lista fiszek
  - Sesja nauki
- Przycisk profilu użytkownika (prowadzący do panelu użytkownika)

### 4.2. Nawigacja mobilna
Na urządzeniach mobilnych nawigacja główna zostanie zwinięta do menu hamburgerowego, które rozwija się po kliknięciu, pokazując te same opcje co w wersji desktopowej.

### 4.3. Nawigacja kontekstowa
W obrębie niektórych widoków (np. lista fiszek) dostępne będą dodatkowe przyciski nawigacyjne związane z kontekstem, np.:
- Przycisk dodawania nowej fiszki w widoku listy
- Przycisk powrotu do listy z modala edycji
- Przyciski nawigacji między statusami fiszek w widoku listy

### 4.4. Ścieżki dostępu
- Bezpośrednie URL do każdego głównego widoku
- Przekierowania zabezpieczające przed dostępem do chronionej zawartości bez uwierzytelnienia
- Logiczne ścieżki powrotu ("breadcrumbs") w złożonych widokach

## 5. Kluczowe komponenty

### 5.1. Topbar
Główny element nawigacyjny zapewniający dostęp do wszystkich kluczowych funkcji aplikacji. Widoczny na każdej stronie po zalogowaniu.

### 5.2. Karta fiszki
Komponent reprezentujący fiszkę w różnych widokach, z różnymi wariantami:
- Wariant do listy (kompaktowy)
- Wariant do sesji nauki (pełny ekran z animacją obracania)
- Wariant edycji (w modalu)

### 5.3. Modal
Wielofunkcyjny komponent używany do:
- Edycji fiszek
- Potwierdzania usunięcia
- Wyświetlania szczegółowych informacji

### 5.4. Formularz generatora
Specjalistyczny formularz do wprowadzania tekstu źródłowego i inicjowania procesu generowania, z licznikiem znaków i walidacją długości.

### 5.5. Lista z filtrowaniem
Komponent listy z zaawansowanymi opcjami filtrowania, sortowania i paginacji, wykorzystywany głównie w widoku listy fiszek.

### 5.6. Wskaźniki statusu
Zestaw komponentów wizualnych do oznaczania statusu fiszek:
- Kolorowe oznaczenia źródła (manual, ai-full, ai-edited)
- Ikony statusu (pending, accepted, rejected, custom)
- Wskaźniki postępu nauki

### 5.7. Przyciski akcji
Zestaw spójnie zaprojektowanych przycisków dla różnych akcji:
- Przycisk generowania
- Przyciski zarządzania propozycjami (akceptuj/edytuj/odrzuć)
- Przyciski oceny w sesji nauki
- Przyciski zapisu zbiorczego 
# Weryfikacja projektu z 29 października 2026

To zapis wykonanych sprawdzeń na Windows x64, Node.js 26.6.0, Playwright 1.64.1 i Chromium 156.0.8078.4. Nie jest wynikiem przyszłego uruchomienia na komputerze uczestnika. Oryginalne raporty są lokalnie w `evidence/`, a wybrane dowody w paczce dystrybucyjnej w `verification/`.

| Sprawdzenie | Wynik |
| --- | --- |
| Czysta kopia: npm ci, doctor, smoke, normalny zestaw | instalacja poprawna, smoke wykonany, 8/8 scenariuszy |
| Lint i typecheck | poprawne |
| Kontrakty HTTP oraz walidatory sond i zakresu | 16/16 testów |
| Wszystkie 8 checkpointów | typecheck oraz po 8/8 normalnych scenariuszy |
| reference-final: 4 profile × 5 powtórzeń × 8 scenariuszy, workers=4 | 160/160 |
| after-lab03: SC-03/04 w 4 profilach × 5 powtórzeń | 40/40, F-01 DETECTED |
| after-lab04: scenariusze osobno, plan zwykły i odwrotny | wszystkie poprawne |
| after-lab04: workers=4, repeat=5 | 40/40, 40 różnych workspace, nakładające się przedziały użycia, cleanup poprawny |
| F-01, F-02, F-03, F-04 | normalny sukces i DETECTED właściwą wyrocznią |
| Przeniesienie SC-04: after-lab05 i after-lab06 | normalny sukces i F-01 DETECTED w obu implementacjach |
| LAB-07: dwa stosowalne diffy na oddzielnych kopiach | unsafe: MISSING_DETECTION, safe: DETECTED |
| Kontrakt startera | normalny sukces, potwierdzone dokładne symptomy D-01/D-03 |
| Bariera synchronizacji | pending i zamknięta bariera, odczyt 250,00 zł, po zwolnieniu 225,00 zł |
| Lokalny kontrakt CI | .only i celowa awaria asercji odrzucone na kontrolowanych kopiach |
| LAB-03–LAB-08 | automatyczne sprawdzenia zaliczone na odpowiednich checkpointach |
| Interfejs: szerokość 1365 i 390 px | sprawdzony wizualnie, bez przepełnienia poziomego |

Baseline `before` oraz `after` obejmuje po jednej osobnej rozgrzewce i pięć zachowanych prób. Zebrano wersje, commit/dirty state, zakres, profil, seed, workers i retry. W czasie części pomiarów trwały inne kontrole na tym samym komputerze. Te czasy służą sprawdzeniu działania narzędzia i nie uzasadniają deklaracji poprawy wydajności. Przejście na przygotowanie danych przez API jest dodatkową zmianą ścieżki setupu, wymagającą interpretacji.

Workflow GitHub Actions jest przygotowany, lecz nie został uruchomiony na GitHubie. Ochronę gałęzi ustawia właściciel repozytorium. Nie wykonano pełnego dnia próbnego z grupą ani instalacji na każdym systemie uczestników. Przed konferencją pozostaje próba prowadzenia, projektor i przygotowanie zależności oraz przeglądarki do pracy offline, zgodnie z instrukcją trenera.

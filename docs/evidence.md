# Czytanie dowodów uruchomienia

Raporty powstają lokalnie i są ignorowane przez Git. Nie dołączaj sekretów ani storage state do rozwiązania. W opisie PR wstaw runId, warunki i ścieżkę istniejącego wyniku.

| Ścieżka | Zawartość |
| --- | --- |
| evidence/LAB-00/environment.json | ostatni doctor: wersje, tożsamość serwera, problemy środowiska |
| evidence/runs/&lt;timestamp-label&gt;/ | niezmienne wyniki jednego uruchomienia |
| results.json | statusy wykonanych testów, ID, implementacje, asercje i załączniki |
| environment.json | commit/dirty state, wersje, profil, seed, workers, repeat, retry i oczekiwane ID |
| summary.json | kod procesu, problemy zakresu, observedWorkers, czas, wykonane ID i runId |
| runner.log, html/, traces/ | log, raport HTML oraz ślady nieudanych testów |
| evidence/latest/run.json | wskaźnik na ostatnie wykonanie; nie jest historią |
| evidence/probes/ | klasyfikacje sond i odnośniki normal/fault |
| evidence/before/baseline.json | baseline dla label=before: rozgrzewka i wszystkie próby |
| evidence/comparisons/ | porównania warunków i wyników |
| evidence/matrix/, isolation/ | macierze profili i dowody izolacji |
| evidence/demo/, migration/, labs/, release/ | dowody demo, porównań migracji i sprawdzeń etapów |

Po nowym uruchomieniu użyj ścieżki wypisanej przez CLI. `latest` zmienia się również w trakcie sondy i macierzy. Wskaż konkretny katalog w `runs/`, aby zachować powiązanie z opisem zmiany. Raport HTML można otworzyć poleceniem `npm run report`.

Baseline odmawia nadpisania istniejącego label. Użyj nowej etykiety, np. `before-selector`, zamiast usuwać pomiary. Raport obejmuje wszystkie próby oraz osobno czasy udanych przebiegów. Czas obejmuje uruchomienie runnera; nie jest samym czasem aplikacji. Mała próba nie dowodzi zerowej flakiness.

Sonda wymaga normalnego sukcesu, faktycznej aktywacji defektu i właściwej wyroczni. Otwórz raport obu przebiegów. ENVIRONMENT_ERROR lub WRONG_FAILURE oznacza brak wystarczającego dowodu, nawet gdy proces E2E zakończył się niezerowo.

`lab verify` sprawdza automatyczną część zadania. Nie ocenia jakości diagnozy, minimalności diffu, notatki, samodzielności pracy ani peer review. Wynik automatu nie zastępuje karty LAB.

`test:release` materializuje **reference-final**, a następnie sprawdza cztery profile i F-01–F-04. To próba materiałów referencyjnych. Zmiany w bieżącym drzewie uczestnika sprawdzaj osobno przez `test:current`, `matrix`, `probe` i `lab verify`.

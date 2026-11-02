# Checkpointy i stany ćwiczeń

Repozytorium uczestnika zawiera tylko źródła `start` i `after-lab02`. Rozwiązania `after-lab03`–`after-lab07` oraz `reference-final` są u trenera w ignorowanym `trainer-private/checkpoints/`. Karty LAB opisują nazwy kolejnych stanów: dochodzisz do nich, wykonując zadania we własnym projekcie. Do uruchamiania i weryfikacji własnej pracy nie są potrzebne prywatne rozwiązania.

Checkpoint to źródła z kumulatywnie nałożonym rozwiązaniem wcześniejszych zadań. Powstaje w **nowym katalogu**. Polecenie nie resetuje bieżącego drzewa, nie przełącza gałęzi i nie nadpisuje pracy.

```sh
npm run lab -- list
npm run lab -- checkpoint start --dest ../refactoring-start
```

Katalog docelowy nie może istnieć. W nowej kopii wykonaj `npm ci`, `npm run doctor` oraz sprawdzenia właściwego etapu. Sam checkpoint nie jest pełnym środowiskiem offline.

`lab list` pokazuje nazwy etapów, również prywatnych. Utworzenie późniejszego checkpointu wymaga wszystkich jego nakładek. Uczestnik bez plików trenera otrzyma komunikat o niedostępnym stanie. Trener może nadal tworzyć pełne stany z własnych plików; kopia nie zawiera całego katalogu `trainer-private`, prywatnej instrukcji ani prezentacji. Sposób udostępniania takich kopii do dogonienia grupy pozostaje do osobnego ustalenia — nie dodano automatycznego pobierania, importu ani dystrybucji.

| Nazwa | Stan | Dołączenie do |
| --- | --- | --- |
| start | D-01/D-02/D-03 i duplikacja | LAB-00–02 |
| after-lab02 | zabezpieczony kontrakt, baseline pozostaje własnym pomiarem | LAB-03 |
| after-lab03 | stabilne SKU i asercje ponawiane, nadal D-03 | LAB-04 |
| after-lab04 | własny workspace i sesja testu | LAB-05 |
| after-lab05 | małe moduły UI/setupu | LAB-06 |
| after-lab06 | migracja SC-04, jedno active na ID | LAB-07 |
| after-lab07 | bezpieczny mały refactor | LAB-08 |
| reference-final | przykładowe wydzielenie SC-07 | porównanie po LAB-08 |

Checkpoint nie zawiera Twoich wyników. Baseline, sondy i opis PR tworzysz samodzielnie. Zanotuj, z jakiego stanu kontynuujesz i czego nie wykonałeś sam.

## Zachowanie pracy

Najpierw zapisz pliki i notatki. Jeśli używasz Gita, obejrzyj `git status` oraz diff i świadomie zapisz commit albo patch. Nie używaj `reset --hard` ani usuwania katalogu do doganiania grupy.

## Nazwy tagów na slajdach

Prezentacja proponuje `workshop/v0.1/start`, `workshop/v0.1/after-lab02` itd. Mechanizm katalogów udostępnia równoważne materiały, ale nie tworzy tagów i historii Git. Sprawdź przed użyciem polecenia ze slajdu:

```sh
git tag --list "workshop/v0.1/*"
```

Jeśli właściciel przygotował prawdziwe i zweryfikowane tagi, można utworzyć osobne worktree z wolną nazwą gałęzi i katalogu. Udostępnienie tagu z rozwiązaniem udostępnia również jego kod. Bez tagów materializacja wymaga lokalnie dostępnych nakładek; w repozytorium uczestnika dostępne są `start` i `after-lab02`.

Po dołączeniu sprawdź osiem ID, normalny zestaw i sondę zadania. Do LAB-04 zależność SC-03 → SC-04 pozostaje znanym etapem. Po LAB-04 sprawdź SC-04 samodzielnie, obie kolejności i współbieżność.

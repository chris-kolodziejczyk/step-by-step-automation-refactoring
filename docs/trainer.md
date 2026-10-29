# Instrukcja prowadzącego

Warsztat jest przeznaczony do pracy na istniejącej automatyzacji. Uczestnicy nie implementują sklepu ani nowego frameworka. Mają przygotować małe zmiany z zachowaną zdolnością wykrywania błędów. Każdy blok wraca do diagnozy, zabezpieczenia, zmiany, weryfikacji i wdrożenia.

## Przed konferencją

1. Przeczytaj [plan dnia](agenda.md), [kontrakt](contract.md), [checkpointy](checkpoints.md) i wszystkie karty LAB. Porównaj treść z finalnym PPTX. Źródłowa mapa ma status historyczny i nie jest raportem repozytorium.
2. Na czystym katalogu zrób `npm ci` i instalację Chromium. Sprawdź wspierane wersje Node oraz systemy uczestników. Przypnij rzeczywisty lockfile; nie aktualizuj zależności w dniu sali.
3. Wykonaj poniższą próbę i zachowaj rzeczywiste raporty. Przygotuj lokalne kopie potrzebnych checkpointów razem z działającym środowiskiem na komputerze prowadzącego.
4. Sprawdź start aplikacji bez internetu, skalowanie kodu na projektorze, rozmiar tekstu terminala i zapasową parę. Rozdanie samych źródeł nie zapewnia instalacji offline.
5. Prawdziwe tagi Git są opcjonalnym sposobem dystrybucji. Jeśli mają być pokazywane na slajdach, właściciel musi je utworzyć i zweryfikować. Bez tagów używaj materializacji katalogów.

## Próba generalna

```sh
npm run doctor
npm run lint
npm run typecheck
npm run test:contracts
npm run test:smoke
npm run test:current
npm run test:starter-contract
npm run test:ci-contract
npm run baseline -- capture --label rehearsal-start --repetitions 5
npm run demo:sync
npm run test:release
```

`test:release` sprawdza referencyjny finał w nowej kopii: cztery profile, po pięć powtórzeń i wszystkie cztery sondy. Nie zatwierdza automatycznie własnego, bieżącego rozwiązania. Jego wynik jest dowodem z konkretnego komputera i warunków, nie gwarancją każdego środowiska.

Dodatkowo materializuj każdy checkpoint do nowego katalogu i przejdź odpowiadające karty. Sprawdź starter: normalne osiem ID, samodzielny SC-04 (znany D-03), wybór innego SKU po layout-shift, bariera i zachowane wyrocznie. Nie wymagaj przypadkowej awarii starego sleep przy każdym planowaniu CPU.

Na `after-lab03` sprawdź parę SC-03 → SC-04 w czterech profilach i F-01. Na `after-lab04` uruchom `npm run lab -- verify LAB-04`: solo, oba plany kolejności, rzeczywistą współbieżność i osobne workspace. Na `after-lab05/06` porównaj migrację SC-04. Na `after-lab06` sprawdź stosowalność obu diffów AI w oddzielnych kopiach. Unsafe ma stracić detekcję F-01, safe ją zachować.

`test:starter-contract` sprawdza dokładnie opisane problemy materiału startowego. `test:ci-contract` wykonuje kontrolowane przypadki odrzucenia wadliwego zestawu. Przeczytaj rzeczywisty raport i zakres wykonanego sprawdzenia. W oddzielnej kopii sprawdź też, że zero testów, brak ID, `.only`, nieoczekiwany skip i celowa awaria nie dają sukcesu. Zachowaj raport również przy błędzie. Gałęzie GitHub i wymagane checki konfiguruje właściciel; plik YAML sam nie ustanawia ochrony.

Po próbie wpisz datę, wersje, commit/dirty state, wyniki i ograniczenia do [szablonu próby](rehearsal-template.md). Nie zamieniaj planowanej tabeli w pozorny pomiar i nie wpisuj na slajdzie zmyślonej poprawy czasu.

## Prowadzenie i tempo

- LAB-00: zapytaj, czego zielony smoke nie potwierdza. Przy blokadzie komputera praca w parze z jawną notatką.
- LAB-01: wymagaj dowodu przed wzorcem. Minimum 5 obserwacji, 3 priorytety, 1 krok.
- LAB-02: każ grupie wskazać aktywację F-01 i właściwą asercję. Awaria środowiska nie zalicza sondy.
- LAB-03: przed lunchem zwolnij barierę i zamknij demo, po lunchu utwórz nowe dane. Nie zwiększaj timeoutów.
- LAB-04: poproś o workspaceId i obserwowanych workerów. Same osobne browser context nie wystarczą.
- LAB-05: akceptuj funkcje i klasy. W razie opóźnienia wspólne demo zamiast usunięcia weryfikacji.
- LAB-06: porównuj ID i role active/shadow. Omów krótki PR i logiczne wycofanie.
- LAB-07: najpierw diff, potem wyjaśnienie. Konta AI są opcjonalne.
- LAB-08: zachowaj 10 minut peer review, F-03 i jawny order-total. Referencja nie jest wzorcem do odtworzenia jeden do jednego.

Przerwy materiałów są propozycją. Uzgodnij je z organizacją. Nie doliczaj osobnego czasu na slajdy do czasu ćwiczenia.

## Plan awaryjny

Zapisz pracę uczestnika i utwórz nowy katalog checkpointu; nie nadpisuj jego drzewa. Bez internetu pracuj na przygotowanym komputerze lub w parze. Zapis trace z próby generalnej oznacz jako **zapis**, nie bieżące wykonanie. Jeżeli nie można zebrać dowodu, zapisz ograniczenie zamiast deklaracji sukcesu.

W podsumowaniu poproś o jeden problem z własnego projektu, pierwszy eksperyment i kryterium sukcesu. Infrastruktura namespace/manifest/probe jest narzędziem dydaktycznym; nie musi być kopiowana w całości do każdego projektu.

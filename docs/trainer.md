# Instrukcja prowadzącego

Warsztat dotyczy istniejącej automatyzacji. Uczestnicy przygotowują małe zmiany i sprawdzają, czy testy nadal wykrywają właściwe błędy. W każdym bloku wracaj do diagnozy, zabezpieczenia, zmiany, weryfikacji i wdrożenia. Szczegółowe polecenia, podpowiedzi i artefakty znajdują się w [kartach LAB](labs/); pełny przebieg w [planie dnia](agenda.md).

## Ściąga na salę

4 listopada 2026, 09:30–17:30, czas warszawski. Lunch 12:00–13:00; dwie 15-minutowe przerwy są propozycją do uzgodnienia z organizatorem. Czas bloku obejmuje slajdy, pracę i omówienie. Praca w parach: kierowca wykonuje zmianę, recenzent pilnuje zakresu i dowodów; po zadaniu zamiana ról.

| Godzina | Blok i slajdy | Start | Przed przejściem dalej |
| --- | --- | --- | --- |
| 09:30–09:45 | Otwarcie, 1–6 | — | Kontrakt, domena i sposób pracy są jasne. |
| 09:45–10:05 | LAB-00, 5–7 | `start` | Doctor, smoke i aktualny raport ośmiu ID. |
| 10:05–10:40 | LAB-01, 8–11 | `start` | 5 obserwacji, 3 priorytety, 1 uzasadniony krok. |
| 10:40–11:25 | LAB-02, 12–15 | `start` | Baseline i F-01 wykryty właściwą asercją. |
| 11:25–11:40 | Przerwa | — | |
| 11:40–12:00 | LAB-03 A, 16–20 | `after-lab02` | Zapisane obserwacje, zwolniona bariera, zamknięte demo. |
| 12:00–13:00 | Lunch | — | |
| 13:00–13:35 | LAB-03 B, 16–21 | `after-lab02` | Cztery profile, po pięć prób, oraz F-01. |
| 13:35–14:15 | LAB-04, 22–24 | `after-lab03` | Solo, obie kolejności, współbieżność i własne workspace. |
| 14:15–14:55 | LAB-05, 25–27 | `after-lab04` | SC-05/06, aktywny zestaw i F-02. |
| 14:55–15:10 | Przerwa | — | |
| 15:10–15:55 | LAB-06, 28–32 | `after-lab05` | Jedno active na ID, F-01, CI i plan wycofania. |
| 15:55–16:30 | LAB-07, 33–35 | `after-lab06` | Review diffu i porównanie F-01 na osobnych kopiach. |
| 16:30–17:15 | LAB-08, 36–38 | `after-lab07` | SC-07 i F-03 przed/po, aktywny zestaw, peer review. |
| 17:15–17:30 | Podsumowanie, 39–44 | — | Rzeczywiste wyniki i jeden następny krok. |

Przy opóźnieniu ogranicz bonusy albo poprowadź LAB-05 jako wspólne demo. Zachowaj sprawdzenie wartości testu, izolację i 10 minut peer review. Jeśli dowodu nie udało się zebrać, zapisz ograniczenie; nie deklaruj zaliczenia.

## Przebieg i wskazówki

### Otwarcie — 09:30–09:45, slajdy 1–6

**Powiedz i zapytaj:** pracujemy na istniejącym projekcie, nie budujemy nowego frameworka. Co zabiera więcej czasu: dopisanie testu czy ustalenie przyczyny jego awarii? Zbierz dwa przykłady.

**Sprawdź:** uczestnicy rozumieją role w parze, pięć etapów pracy i kontrakt CART-A: 250,00 zł, SAVE10, rabat 25,00 zł, razem 225,00 zł. Oczekiwane kwoty nie pochodzą z algorytmu aplikacji. Osiem ID i sens asercji pozostają jawne.

### LAB-00 — uruchomienie, 09:45–10:05, slajdy 5–7

**Start:** `start`; [karta LAB-00](labs/LAB-00.md). 5 minut wprowadzenia, 10 pracy, 5 omówienia.

**Powiedz i zapytaj:** najpierw oddzielamy problem środowiska od problemu testu. Co potwierdza zielony smoke, a czego nie potwierdza?

**Obserwuj i sprawdź:** `npm run doctor`, `npm run test:smoke` i `npm run test:current`; świeże raporty, faktycznie wykonany smoke oraz SC-01–SC-08 w trybie startowym. Starter pracuje z jednym workerem i SC-03 przed SC-04. Nie wystarczy sam kod wyjścia ani stary raport.

**Gdy blokuje środowisko:** sprawdź katalog, wersje, Chromium, `/healthz` i właściciela portu; nie zabijaj obcego procesu. Połącz uczestnika w parę i zanotuj, na którym komputerze wykonano sprawdzenie.

### LAB-01 — audyt, 10:05–10:40, slajdy 8–11

**Start:** `start`; [karta LAB-01](labs/LAB-01.md). 5 minut wprowadzenia, 20 pracy, 10 omówienia.

**Powiedz i zapytaj:** najpierw obserwacja i dowód, potem wzorzec. Jak nazwalibyście usunięcie wadliwego `sleep`, a jak dodanie brakującej asercji?

**Obserwuj i sprawdź:** co najmniej 5 obserwacji z dowodami, 3 uzasadnione priorytety i 1 pierwszy eksperyment z kryterium sukcesu. Poproś o odtworzenie zależności SC-03 → SC-04 lub o sprawdzenie wybranego SKU w `layout-shift`. Samo `serial` nie dowodzi zależności.

**Gdy brakuje czasu:** pomiń bonus dzielenia pomysłu na dwa PR. Zachowaj konkretny dowód i uzasadnienie pierwszego kroku; nie przebudowujcie frameworka.

### LAB-02 — baseline i F-01, 10:40–11:25, slajdy 12–15

**Start:** `start`; [karta LAB-02](labs/LAB-02.md). 10 minut wprowadzenia, 25 pracy, 10 omówienia.

**Powiedz i zapytaj:** która asercja wykryje zastosowany kupon bez rabatu? Dlaczego czerwony proces testu z defektem może oznaczać poprawnie wykrytą sondę?

**Obserwuj i sprawdź:** baseline to rozgrzewka i pięć zapisanych prób, również nieudanych, z warunkami i rzeczywistym zakresem. `npm run probe -- --scenario SC-04 --fault F-01` wymaga normalnego sukcesu, potwierdzonej aktywacji defektu i właściwej asercji rabatu lub kwoty z expected/actual. Starter jawnie uruchamia SC-03 przed SC-04 w obu świeżych workspace. Po sondzie potwierdź normalny przebieg.

**Gdy sonda nie daje dowodu:** `BASELINE_FAILED`, niewłaściwa asercja lub błąd środowiska wymagają diagnozy; nie traktuj dowolnej czerwieni jako `DETECTED`. Bonus F-02 można pominąć.

### LAB-03 — selektory i synchronizacja, 11:40–12:00 oraz 13:00–13:35, slajdy 16–21

**Start:** `after-lab02`; [karta LAB-03](labs/LAB-03.md). Przed lunchem 20 minut demo i diagnozy; po lunchu 25 minut pracy i 10 omówienia.

**Przed lunchem:** uruchom `npm run demo:sync`. Wskaż `coupon:pending`, zamkniętą barierę i przedwczesny odczyt; pokaż poprawny wynik po zwolnieniu. Barierę zwolnij w `finally`, zapisz obserwacje i zamknij demo.

**Po lunchu:** utwórz nowe dane. Poproś o wybór produktu po SKU i ponawiane asercje stanu biznesowego zamiast sleep. Zapytaj, który profil był rozstrzygający i czy zachowano wyrocznię.

**Sprawdź:** para SC-03 → SC-04 w profilach `normal`, `slow-coupon`, `layout-shift`, `combined`, po pięć prób, retry 0 oraz F-01 `DETECTED`. `npm run lab -- verify LAB-03` sprawdza etap; pełną macierz pięciu prób uruchom zgodnie z kartą LAB. Nie zwiększaj timeoutów. Samodzielny SC-04 może nadal zawodzić przez D-03, temat LAB-04.

**Gdy demo zawodzi:** użyj oznaczonego zapisu z próby jako zapisu, nie jako dowodu bieżącego uruchomienia. Nie wymagaj, by stary sleep zawodził losowo przy każdym uruchomieniu.

### LAB-04 — izolacja, 13:35–14:15, slajdy 22–24

**Start:** `after-lab03`; [karta LAB-04](labs/LAB-04.md). 5 minut wprowadzenia, 25 pracy, 10 omówienia.

**Powiedz i zapytaj:** osobny browser context nie izoluje danych backendu. Co przygotowuje koszyk dla samodzielnego SC-04? Czy przeniesienie setupu do API omija zachowanie nadal sprawdzane w innym scenariuszu?

**Obserwuj i sprawdź:** workspace i sesja dla testu, cleanup własnych zasobów w `finally`, bez globalnego resetu. `npm run lab -- verify LAB-04` oraz macierz z `workers=4` i `repeat=5`: każdy scenariusz solo, obie kolejności, rzeczywista współbieżność, różne `workspaceId` i zaobserwowani workerzy. SC-04 działa sam, a F-01 pozostaje wykryty.

**Gdy grupa utknie:** wskaż cykl create → use → delete i identyfikatory w raporcie. Bonus sprawdzenia, czy usunięcie A nie narusza B, można pominąć; zachowaj dowód izolacji.

### LAB-05 — odpowiedzialności, 14:15–14:55, slajdy 25–27

**Start:** `after-lab04`; [karta LAB-05](labs/LAB-05.md). 5 minut wprowadzenia, 25 pracy, 10 omówienia.

**Powiedz i zapytaj:** wybierz jedną duplikację i nazwij jej odpowiedzialność. Co stało się łatwiejsze do zmiany, a co tylko krótsze?

**Obserwuj i sprawdź:** mały helper, funkcja lub obiekt; klasy nie są wymagane. Oczekiwane reguły pozostają czytelne. SC-05 i SC-06 oraz aktywny zestaw przechodzą, F-02 pozostaje wykryty. Zmianę setupu UI → API nazwij wprost.

**Gdy brakuje czasu:** poprowadź wspólne demo jednego wydzielenia, ale pokaż odpowiednie sprawdzenia i sondę. Nie budujcie dużego `utils` ani nowego frameworka.

### LAB-06 — migracja i CI, 15:10–15:55, slajdy 28–32

**Start:** `after-lab05`; [karta LAB-06](labs/LAB-06.md). 10 minut wprowadzenia, 25 pracy, 10 omówienia.

**Powiedz i zapytaj:** shadow jest dodatkowym wykonaniem SC-04, nie dziewiątym scenariuszem. Co ma się stać, gdy discovery znajdzie zero testów? Czy recenzent znajdzie dowód bez rozmowy z autorem?

**Obserwuj i sprawdź:** porównanie active/shadow na osobnych danych, z tą samą wyrocznią i F-01; po przełączeniu jedno active na każde z ośmiu ID i stara wersja poza discovery. Manifest i faktyczny raport muszą się zgadzać. CI blokuje błędy i zachowuje raporty także przy porażce. Opis PR zawiera istniejące dowody i logiczny plan wycofania kodu oraz manifestu.

**Gdy nie ma dostępu do CI:** zbierz lokalne dowody i odnotuj ograniczenie. Wadliwe przypadki i próbę revert sprawdzaj na osobnej kopii lub gałęzi. YAML sam nie ustawia ochrony gałęzi.

### LAB-07 — review propozycji AI, 15:55–16:30, slajdy 33–35

**Start:** `after-lab06`; [karta LAB-07](labs/LAB-07.md). 5 minut wprowadzenia, 20 pracy, 10 omówienia.

**Powiedz i zapytaj:** najpierw przeczytaj diff, potem wyjaśnienie. Które zmiany są użyteczne, ryzykowne lub niedopuszczalne? Przykłady są syntetyczne; konto AI i sieć nie są wymagane.

**Obserwuj i sprawdź:** porównanie asercji, `catch` i retry; oba znane diffy na osobnych kopiach `after-lab06`. Unsafe: normalny SC-04 i sonda pokazują utratę detekcji F-01 (`MISSING_DETECTION`). Safe: normalny sukces i F-01 `DETECTED`. Uczestnicy zapisują faktyczne wyniki i decyzję.

**Gdy brakuje internetu:** pracuj na przygotowanych diffach. Nie uruchamiaj nieznanych skryptów z propozycji asystenta.

### LAB-08 — zadanie końcowe, 16:30–17:15, slajdy 36–38

**Start:** `after-lab07`; [karta LAB-08](labs/LAB-08.md). 5 minut briefu, 25 pracy, 10 peer review, 5 omówienia.

**Powiedz i zapytaj:** wybierz jeden fragment SC-07 i zachowaj numer, pozycje, ilości oraz zapisany `order-total` 225,00 zł. Czy recenzent zaakceptowałby ten PR we własnym zespole?

**Obserwuj i sprawdź:** normalny SC-07 oraz F-03 przed zmianą i po niej; właściwa asercja wykrywa zmianę kwoty zamówienia, a nie ponownie odczytuje koszyk. Po zmianie wykonaj aktywny normalny zestaw i sprawdź osiem ID. Zachowaj mały diff, rzeczywiste raporty i plan wycofania.

**Peer review:** najpierw twarde warunki: F-03, brak utraty scenariusza i maskowania awarii. Następnie sześć kryteriów po 0–2 punkty; orientacyjne 9/12 nie kompensuje niespełnienia twardego warunku. Poproś o jeden komentarz do poprawy, jeden element do zachowania i następny mały krok autora.

**Gdy brakuje czasu:** ogranicz zakres diffu i pomiń pełną macierz jako bonus. Zachowaj sondę, normalne uruchomienia, aktywny zestaw i peer review. Publikacja PR nie jest wymagana, a `reference-final` to tylko jedno z poprawnych rozwiązań.

### Podsumowanie — 17:15–17:30, slajdy 39–44

Poproś o rzeczywiste raporty: te same ID, normalny wynik i właściwą sondę, warunki porównania oraz wszystkie próby, także nieudane. Nie dopisuj procentów ani nie przypisuj całej zmiany czasu refaktoryzacji, gdy warunki się różniły. Pięć zielonych przebiegów nie dowodzi braku niestabilności.

Każda osoba zapisuje jeden problem z własnego projektu, pierwszy eksperyment i kryterium sukcesu. Infrastruktura namespace/manifest/probe służy ćwiczeniom; nie trzeba kopiować jej w całości. Zostaw czas na pytania i kontakt.

## Gdy coś nie działa

| Objaw | Pierwsze sprawdzenie | Kontynuacja |
| --- | --- | --- |
| Doctor lub smoke nie startuje | Katalog, Node, lockfile, Chromium, `/healthz` i właściciel portu. | Nie zatrzymuj obcego procesu. Praca w parze lub na przygotowanym komputerze; zapisz blokadę i źródło raportu. |
| SC-04 nie działa sam przed LAB-04 | Czy starter dostał koszyk z SC-03? | To znany D-03. W LAB-02 sonda używa jawnego prerequisite; nie maskuj zależności. |
| Sonda jest czerwona lub nie ma aktywacji | Normalny baseline, zdarzenie aktywacji, właściwa asercja i expected/actual. | Błąd środowiska albo inna awaria nie są detekcją. Zapisz wynik i przyczynę, jeśli znana. |
| Uczestnik został w tyle | Zapisz pliki i notatki; sprawdź `git status` i diff. | Utwórz checkpoint w nowym katalogu, np. `npm run lab -- checkpoint after-lab03 --dest ../refactoring-lab04`. Nie nadpisuj pracy ani nie używaj `reset --hard`. |
| Brak internetu | Czy są zainstalowane zależności, przeglądarka i dostępna lokalna aplikacja? | Użyj przygotowanego środowiska lub pracy w parze. Sam ZIP źródeł nie zapewnia instalacji offline. |
| Demo lub CI nie działa | Ustal, co faktycznie wykonano i zachowaj raport błędu. | Zapis trace oznacz jako zapis z próby; przy braku CI zbierz lokalne dowody i odnotuj brak weryfikacji CI. |
| Brak AI | Dostępne przygotowane diffy i rubryka? | Wariant offline jest pełnoprawny. |

Checkpoint tworzy źródła w nowym, nieistniejącym katalogu; nie przenosi wyników uczestnika. W nowej kopii potrzebne są `npm ci`, `npm run doctor` i sprawdzenia etapu. Materiał na slajdach pokazuje też tagi `workshop/v0.1/...` oraz `git worktree`: używaj ich wyłącznie, gdy właściciel wcześniej utworzył i zweryfikował rzeczywiste tagi oraz wolne nazwy. W przeciwnym razie użyj materializacji katalogu. Szczegóły i mapa stanów: [checkpointy](checkpoints.md).

## Przed konferencją

1. Przeczytaj [plan dnia](agenda.md), [kontrakt](contract.md), [checkpointy](checkpoints.md) i karty LAB; porównaj je z finalnym PPTX. Źródłowa mapa ma status historyczny i nie jest raportem repozytorium.
2. W czystym katalogu wykonaj `npm ci` i `npx playwright install chromium`. Sprawdź wspierane wersje Node i systemy uczestników; korzystaj z rzeczywistego lockfile i nie aktualizuj zależności w dniu sali.
3. Wykonaj próbę poniżej i zachowaj rzeczywiste raporty. Przygotuj lokalne kopie checkpointów wraz z działającym środowiskiem na komputerze prowadzącego.
4. Sprawdź aplikację bez internetu, czytelność kodu i terminala na projektorze oraz zapasową parę. Uzgodnij przerwy z organizatorem.
5. Jeśli zamierzasz pokazywać tagi ze slajdów, upewnij się, że właściciel je utworzył i zweryfikował. W przeciwnym razie wyjaśnij uczestnikom materializację katalogów.

## Próba generalna prowadzącego

Uruchom w odpowiednio przygotowanym środowisku; zachowaj wyniki i przeczytaj raporty, również po błędzie:

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

`test:release` sprawdza referencyjny finał w nowej kopii: cztery profile, po pięć powtórzeń i wszystkie cztery sondy. Nie zatwierdza automatycznie bieżącego rozwiązania uczestnika. Wynik dotyczy konkretnego komputera i warunków.

Materializuj każdy checkpoint do nowego katalogu i przejdź odpowiadające karty. W starterze sprawdź osiem ID, samodzielny SC-04 jako znany D-03, wybór innego SKU po `layout-shift`, barierę i zachowane wyrocznie. Na `after-lab03` sprawdź parę SC-03 → SC-04 w czterech profilach i F-01; na `after-lab04` wykonaj `npm run lab -- verify LAB-04` i sprawdź solo, obie kolejności, rzeczywistą współbieżność oraz workspace. Na `after-lab05/06` porównaj migrację SC-04, a na osobnych kopiach `after-lab06` sprawdź oba diffy AI: unsafe traci detekcję F-01, safe ją zachowuje.

`test:starter-contract` sprawdza opisane problemy startera; `test:ci-contract` wykonuje kontrolowane przypadki odrzucenia wadliwego zestawu. W oddzielnej kopii sprawdź, że zero testów, brak ID, `.only`, nieoczekiwany skip i celowa awaria nie dają sukcesu. Wymagane checki i ochronę gałęzi konfiguruje właściciel repozytorium.

Po próbie wpisz datę, wersje, commit/dirty state, wyniki i ograniczenia do [szablonu próby](rehearsal-template.md). Nie zamieniaj planowanej tabeli w pozorny pomiar.

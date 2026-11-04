# Uruchamianie projektu i przygotowanie środowiska

Wszystkie polecenia wykonuj w terminalu w **głównym katalogu swojej kopii projektu**, tam gdzie są `package.json`, `package-lock.json`, `app/` i `tests/`. Jeśli pobrałeś ZIP, najpierw go rozpakuj i wejdź do właściwego katalogu.

- [Chcę otworzyć sklep w przeglądarce](#ręczne-uruchomienie-sklepu).
- [Instaluję projekt pierwszy raz](#pierwsza-instalacja).
- [Chcę uruchomić testy lub sprawdzić zadanie](#uruchamianie-testów-i-weryfikacja-zadania).
- [Chcę zobaczyć raport](#raporty).
- [Coś nie działa](#rozwiązywanie-problemów).

## Najczęstsze polecenia

| Chcę… | Polecenie |
| --- | --- |
| Otworzyć sklep ręcznie | `npm start`, potem adres z terminala, domyślnie `http://127.0.0.1:3100`. |
| Sprawdzić środowisko | `npm run doctor` |
| Wykonać mały test startowy | `npm run test:smoke` |
| Uruchomić cały aktywny normalny zestaw | `npm run test:current` |
| Uruchomić wybrany scenariusz, np. zamówienie | `npm run test:current -- --scenario SC-07` |
| Sprawdzić własny kod po zadaniu, np. LAB-03 | `npm run lab -- verify LAB-03` |
| Otworzyć ostatni raport HTML | `npm run report` |

Instalację wykonaj przed warsztatem, z dostępem do internetu. W czasie pracy wracasz do powyższych poleceń; nie trzeba ponawiać instalacji przy każdym uruchomieniu.

## Ręczne uruchomienie sklepu

Jeśli zależności nie są jeszcze zainstalowane, zacznij od [pierwszej instalacji](#pierwsza-instalacja).

1. Otwórz terminal w głównym katalogu projektu i wykonaj:

   ```sh
   npm start
   ```

2. Pozostaw terminal uruchomiony. Powinien wypisać:

   ```text
   QualityCart: http://127.0.0.1:3100
   ```

3. Otwórz [lokalny sklep QualityCart](http://127.0.0.1:3100) w przeglądarce. Jeśli ustawiłeś inny port, użyj adresu wypisanego w swoim terminalu.
4. Przy pierwszym wejściu kliknij **„Nowa przestrzeń”**. Utworzy to Twój demonstracyjny workspace, czyli oddzielne dane koszyka i zamówień. Formularz uzupełni się danymi demonstracyjnymi.
5. Kliknij **„Zaloguj”**. Dane konta są również pokazane na stronie:

   | Pole | Wartość |
   | --- | --- |
   | E-mail | `qa@example.test` |
   | Hasło | `Workshop123!` |

6. Możesz dodawać produkty, stosować kupon i składać demonstracyjne zamówienie. CART-A to dwie książki i jeden kubek: razem 250 zł, z kuponem `SAVE10` rabat 25 zł i razem 225 zł.
7. Aby zatrzymać aplikację, wróć do terminala z serwerem i naciśnij **Ctrl+C**. Po ponownym `npm start` znów otwórz stronę.

Dane są przechowywane w pamięci procesu serwera. Restart usuwa workspace, sesje, koszyki i zamówienia. Po restarcie odśwież stronę i w razie potrzeby ponownie kliknij „Nowa przestrzeń”. Jeśli przeglądarka nadal korzysta z nieaktualnych cookies, usuń dane witryny `127.0.0.1` lub otwórz sklep w nowym oknie prywatnym i utwórz nową przestrzeń.

Ręcznie oglądany koszyk ma własne dane. Polecenia testowe tworzą osobny serwer i workspace'y; zmiany w koszyku otwartym ręcznie nie przygotowują danych dla testów.

### Gdy port 3100 jest zajęty

Sprawdź, czy aplikacja nie działa już w innym Twoim terminalu. Nie zatrzymuj obcego procesu. Ręczny serwer obsługuje zmienną `PORT`, więc możesz wybrać np. 3101.

PowerShell:

```powershell
$env:PORT = '3101'
npm start
```

Linux / macOS:

```sh
PORT=3101 npm start
```

Wtedy sklep otwierasz pod [adresem z portem 3101](http://127.0.0.1:3101). Ustawienie dotyczy samodzielnego serwera; runner warsztatowy sam wybiera wolny port. Aby wrócić do ustawień domyślnych, możesz otworzyć nowy terminal.

## Pierwsza instalacja

### Wymagania

- **Node.js 24.x albo 26.x** i npm. Właśnie te główne wersje sprawdza `doctor`. Plik [.node-version](../.node-version) wskazuje wersję używaną przy przygotowaniu projektu.
- Git oraz edytor z obsługą TypeScript.
- Windows, macOS lub Linux obsługiwany przez zainstalowaną wersję Playwright.
- Uprawnienia do uruchomienia lokalnego serwera i Chromium.

### Instalacja i pierwszy test

W głównym katalogu projektu sprawdź narzędzia, a następnie zainstaluj zależności:

```sh
node --version
npm --version
git --version
npm ci
npx playwright install --with-deps chromium
```

`npm ci` odtwarza zależności z lockfile. Polecenie Playwright pobiera Chromium właściwe dla wersji z projektu oraz instaluje obsługiwane zależności systemowe. Zwłaszcza na Linuxie instalacja bibliotek systemowych może wymagać uprawnień administratora. Gdy te biblioteki są już dostępne, samą przeglądarkę możesz pobrać przez `npx playwright install chromium`.

Następnie wykonaj kolejno:

```sh
npm run doctor
npm run test:smoke
npm run test:current
```

- `doctor` sprawdza wersje, manifest, uruchomienie Chromium i tożsamość lokalnej aplikacji. Zapisuje `evidence/LAB-00/environment.json`.
- `test:smoke` sprawdza odpowiedź aplikacji i formularz logowania. Nie potwierdza wszystkich reguł koszyka.
- `test:current` wykonuje aktywny normalny zakres SC-01–SC-08. Sprawdź wykonane ID i statusy w świeżym raporcie.

Te polecenia **uruchamiają i zatrzymują własny serwer automatycznie**. Nie musisz wcześniej wykonywać `npm start` ani ręcznie klikać „Nowa przestrzeń”. Testy same przygotowują potrzebne przestrzenie i sesje.

Po zmianie wersji bibliotek może być potrzebne ponowne pobranie zgodnej przeglądarki. Podczas warsztatu korzystaj z dostarczonego lockfile; aktualizację zależności traktuj jako osobną zmianę środowiska.

## Uruchamianie testów i weryfikacja zadania

Pracuj w swoim katalogu od LAB-u do LAB-u. Poniższe polecenia sprawdzają **Twój bieżący kod** i nie wymagają prywatnych rozwiązań trenera.

```sh
npm run test:current
npm run test:current -- --scenario SC-07
```

Normalny starter ma jednego workera i SC-03 przed SC-04. Samodzielny SC-04 na starterze zawodzi z powodu brakującego koszyka przygotowywanego przez SC-03. To znany problem D-03, usuwany w LAB-04. Do sprawdzenia początkowej instalacji użyj całego normalnego zestawu.

Po danym ćwiczeniu wybierz właściwe polecenie:

| Zadanie | Weryfikacja |
| --- | --- |
| LAB-00 | `npm run lab -- verify LAB-00` |
| LAB-01 | `npm run lab -- verify LAB-01` |
| LAB-02 | `npm run lab -- verify LAB-02` |
| LAB-03 | `npm run lab -- verify LAB-03` |
| LAB-04 | `npm run lab -- verify LAB-04` |
| LAB-05 | `npm run lab -- verify LAB-05` |
| LAB-06 | `npm run lab -- verify LAB-06` |
| LAB-07 | `npm run lab -- verify LAB-07` |
| LAB-08 | `npm run lab -- verify LAB-08` |

`lab verify` sprawdza automatyczną część zadania. Odpowiedzi pisemne, dowody przed/po, jakość diffu i peer review omawiasz z prowadzącym według [kart LAB](labs/). LAB-06/07 również korzystają z własnego kodu, bez pobierania wzorcowych checkpointów. W LAB-07 eksperymenty unsafe/safe i review dokumentujesz osobno.

Na potrzeby odpowiednich ćwiczeń dostępne są także:

```sh
npm run probe -- --scenario SC-04 --fault F-01
npm run probe -- --scenario SC-07 --fault F-03
npm run matrix -- --repeat 5 --workers 1
npm run matrix -- --full --repeat 5 --workers 4
npm run demo:sync
```

Sonda sprawdza normalny przebieg i wykrycie konkretnego defektu. Macierz domyślnie obejmuje SC-03/04 w czterech profilach; `--full` obejmuje osiem ID. Zmieniony układ i wolne przeliczanie mogą ujawnić celowe problemy startera przed LAB-03. Pełna macierz nie jest podstawowym sprawdzeniem samej instalacji.

`demo:sync` automatycznie wykonuje demonstrację w tle i wypisuje wynik w terminalu; nie otwiera widocznego okna przeglądarki. Do samodzielnego klikania w sklepie służy `npm start`.

## Raporty

Po wykonaniu testów, w terminalu w tym samym projekcie uruchom:

```sh
npm run report
```

Polecenie udostępnia ostatni raport HTML i wypisuje jego adres. Otwórz go w przeglądarce, jeśli nie otworzy się automatycznie. Pozostaw terminal raportu uruchomiony na czas oglądania; zakończ przez **Ctrl+C**. Przed pierwszym raportem trzeba wykonać np. `npm run test:smoke` lub `npm run test:current`.

Każde wykonanie ma własny katalog `evidence/runs/<timestamp-label>/`. CLI wypisuje ścieżkę. W środku znajdziesz m.in.:

| Plik / katalog | Zawartość |
| --- | --- |
| `summary.json` | Wynik uruchomienia, wykonane ID, problemy zakresu, czas, runId i warunki. |
| `results.json` | Poszczególne testy, statusy, asercje i załączniki. |
| `environment.json` | Wersje, commit/dirty state, profil, seed, workers, retry i oczekiwany zakres. |
| `runner.log` | Szczegółowy log. |
| `html/` | Raport HTML danego wykonania. |
| `traces/` | Artefakty nieudanych testów, np. trace i screenshot. |

`evidence/latest/run.json` wskazuje ostatnie wykonanie. Przy sondzie, macierzy albo `lab verify` może ono być tylko jednym z wielu składowych przebiegów. Ostatni raport po sondzie może być czerwony, bo przedstawia test z celowym defektem; status całej sondy jest w wypisanym podsumowaniu i `evidence/probes/`. Bieżące wyniki weryfikacji LAB-ów są w `evidence/labs/`.

Zapisuj ścieżki konkretnych uruchomień zamiast polegać wyłącznie na zmieniającym się `latest`. Szablony notatek są w [labs/answers](labs/answers/), a szczegóły w [instrukcji czytania dowodów](evidence.md). Raporty `evidence/` i pliki stanu sesji są ignorowane przez Git.

## Nowy katalog i checkpointy

Gdy zaczynasz pracę w nowej kopii projektu, przygotuj w niej zależności i uruchom `doctor`. Samo skopiowanie źródeł nie instaluje `node_modules`.

Repozytorium uczestnika zawiera checkpointy `start` i `after-lab02`. Nazwy późniejszych etapów w kartach oznaczają stan po Twoich poprzednich zadaniach. Ich wzorcowe źródła są u trenera. `lab list` może wymienić wszystkie nazwy, ale nie oznacza to, że wszystkie pliki są dostępne w Twojej kopii.

Do zwykłej pracy nie przełączasz się po każdym LAB-ie na gotowe rozwiązanie — zmieniasz i weryfikujesz własny kod. Jeżeli utkniesz, zachowaj pracę i zgłoś się do prowadzącego. Szczegóły dostępnych kopii: [checkpointy](checkpoints.md).

## Rozwiązywanie problemów

| Objaw | Co zrobić |
| --- | --- |
| Brak `package.json` lub npm nie znajduje projektu | Otwórz terminal w rozpakowanym/sklonowanym katalogu z `package.json`. |
| `node`, `npm` albo `git` nie są rozpoznawane | Sprawdź instalację narzędzia i otwórz nowy terminal po instalacji. |
| Nieobsługiwany Node | Wybierz Node 24 lub 26, ponów `npm ci` i `doctor`. |
| Brak zależności projektu | Wykonaj `npm ci` w tej kopii projektu. |
| Brak Chromium | Wykonaj `npx playwright install --with-deps chromium` z tego projektu. |
| Chromium nie startuje | Zachowaj log; sprawdź biblioteki systemowe i polityki komputera. To błąd środowiska, nie detekcja F-01. |
| Strona sklepu się nie otwiera | Sprawdź, czy `npm start` nadal działa, oraz użyj dokładnego adresu i portu z terminala. |
| Ręczny serwer zgłasza zajęty port | Sprawdź własne terminale albo wybierz `PORT=3101` zgodnie z instrukcją powyżej. Nie zatrzymuj obcego procesu. |
| Logowanie zgłasza brak workspace / przestrzeni | Kliknij „Nowa przestrzeń”. Po restarcie serwera odśwież stronę; w razie nieaktualnych cookies usuń dane witryny lub użyj nowego okna prywatnego. |
| Sklep działa ręcznie, lecz testy nie widzą mojego koszyka | Testy mają własny serwer i dane. Przygotowanie danych wykonuje fixture/setup scenariusza. |
| Samodzielny SC-04 zawodzi na starterze | To znany D-03. Do sprawdzenia instalacji wykonaj pełny normalny zestaw. |
| Błąd przy `layout-shift`, `slow-coupon` albo `combined` | Sprawdź SKU i etap przeliczania. To materiał LAB-03, ale każdą awarię oceń na podstawie raportu. |
| `npm run report` nie znajduje wyniku | Uruchom testy w tym projekcie i ponów polecenie w tym samym katalogu. |
| Raport nie odpowiada ostatniej edycji kodu | Wykonaj sprawdzenie ponownie i otwórz nową wypisaną ścieżkę. |
| Późniejszy checkpoint jest niedostępny | Kontynuuj własne rozwiązanie lub zgłoś się do trenera; nie nadpisuj swojej pracy. |

Nie naprawiaj środowiska przez usuwanie asercji, `skip`, retry lub większy timeout. Przy blokadzie komputera pracuj w parze i zapisz, na którym komputerze wykonano sprawdzenie.

## Praca bez internetu

Przed warsztatem sprawdź uruchomienie po odłączeniu sieci. Na tym samym komputerze muszą już być zależności projektu, pasujący Chromium i biblioteki systemowe. Sam ZIP, lockfile ani cache npm nie gwarantują kompletnej instalacji offline.

Po przygotowaniu środowiska lokalny sklep i testy nie potrzebują zewnętrznej usługi sklepowej. Nowy katalog wymaga osobnego przygotowania zależności. LAB-07 działa na dostarczonych diffach i nie wymaga konta AI.

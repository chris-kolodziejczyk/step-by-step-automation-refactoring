# Refaktoryzacja automatyzacji krok po kroku

Projekt warsztatu TestWarez 2026: **jak porządkować testy bez zatrzymywania projektu**. Pracujemy na lokalnym sklepie QualityCart i istniejącym, celowo problematycznym zestawie testów. Diagnozujemy problem, zabezpieczamy zachowanie, wykonujemy małą zmianę i zbieramy dowody do przeglądu.

Materiały są po polsku. Testy i moduły testowe są w TypeScript, aplikacja w JavaScript na Node.js. Stos: Node.js, Playwright Test i GitHub Actions. Aplikacja działa lokalnie, na danych syntetycznych, bez prawdziwych płatności i usług zewnętrznych.

## Szybki start

Potrzebujesz Node.js **24 lub 26**, npm, Git i edytora. Wersje bibliotek określa `package-lock.json`. Instalację wykonaj przed przyjściem na salę.

```sh
npm ci
npx playwright install chromium
npm run doctor
npm run test:smoke
npm run test:current
```

`test:current` uruchamia serwer automatycznie. Do samodzielnego oglądania sklepu użyj `npm start` i otwórz adres wypisany w terminalu. Szczegóły: [przygotowanie środowiska](docs/setup.md).

Starter ma osiem aktywnych scenariuszy. Normalny przebieg z jednym workerem i SC-03 przed SC-04 ma przechodzić. Samodzielny SC-04, zmieniony układ produktów i wolne przeliczanie pokazują celowe problemy automatyzacji. Każdą awarię diagnozujemy na podstawie świeżego raportu.

## Materiały

- [Kontrakt, scenariusze, profile i defekty](docs/contract.md)
- [Plan dnia i mapa slajdów](docs/agenda.md)
- [LAB-00: uruchomienie](docs/labs/LAB-00.md)
- [LAB-01: audyt](docs/labs/LAB-01.md)
- [LAB-02: punkt odniesienia i wartość asercji](docs/labs/LAB-02.md)
- [LAB-03: selektory i synchronizacja](docs/labs/LAB-03.md)
- [LAB-04: izolacja danych](docs/labs/LAB-04.md)
- [LAB-05: odpowiedzialności i duplikacja](docs/labs/LAB-05.md)
- [LAB-06: migracja i CI](docs/labs/LAB-06.md)
- [LAB-07: przegląd propozycji AI](docs/labs/LAB-07.md)
- [LAB-08: mały PR i peer review](docs/labs/LAB-08.md)
- [Instrukcja prowadzącego i próby generalnej](docs/trainer.md)
- [Checkpointy i powrót do ćwiczenia](docs/checkpoints.md)
- [API aplikacji i kontrola danych](docs/api.md)
- [Czytanie raportów i ograniczenia pomiaru](docs/evidence.md)
- [Wykonane sprawdzenia projektu](docs/verification.md)
- [Szablony odpowiedzi](docs/labs/answers/)

## Polecenia

```sh
npm run lab -- list
npm run lab -- verify LAB-00
npm run test:current -- --scenario SC-04
npm run test:current -- --profile combined --workers 4 --repeat 5
npm run matrix -- --repeat 5 --workers 4
npm run probe -- --scenario SC-04 --fault F-01
npm run probe -- --scenario SC-07 --fault F-03
npm run demo:sync
npm run baseline -- capture --label before --repetitions 5
npm run baseline -- capture --label after --repetitions 5
npm run baseline -- compare --before evidence/before --after evidence/after
npm run manifest:check
npm run migration:compare
npm run lint
npm run typecheck
npm run test:contracts
npm run test:starter-contract
npm run test:ci-contract
npm run test:release
npm run report
```

Raporty i ślady są zapisywane lokalnie w `evidence/runs/<timestamp-label>/`; polecenie wypisuje ścieżkę bieżącego wyniku. `npm run report` otwiera ostatni raport HTML. Baseline zachowuje nieudane próby i osobno oznacza rozgrzewkę; istniejącego label nie nadpisuje. Wynik sondy jest sukcesem tylko wtedy, gdy normalny scenariusz przechodzi, defekt rzeczywiście został wykonany, a test zawodzi na właściwej wyroczni.

`test:release` sprawdza materializowane **reference-final**, czyli materiały referencyjne. Bieżące własne rozwiązanie weryfikuj przez `test:current`, `matrix`, `probe` oraz `lab verify`. Sprawdzenia automatyczne nie zastępują notatki, minimalnego diffu i peer review.

`npm run lab -- verify LAB-04 --checkpoint after-lab04 --workers 4 --repeat 5` sprawdza wskazaną wersję na nowej kopii. Bez `--checkpoint` weryfikujesz własny bieżący kod. Do pomiaru wzorca możesz użyć `npm run baseline -- capture --label after-reference --checkpoint reference-final --repetitions 5`; własne rozwiązanie mierz bez tej opcji.

## Checkpointy

Zachowaj własną pracę, następnie utwórz **nowy, nieistniejący katalog**:

```sh
npm run lab -- checkpoint after-lab03 --dest ../refactoring-lab04
```

W nowej kopii wykonaj `npm ci`, `npm run doctor` i sprawdzenia etapu. Mechanizm kopiuje źródła i kumulatywnie nakłada rozwiązania. Nazwy odpowiadają planowanym tagom `workshop/v0.1/...`; nie zakładamy istnienia tych tagów w Git. Szczegóły: [checkpointy](docs/checkpoints.md).

## Pochodzenie i zakres

Podstawą jest paczka `TestWarez_2026_prezentacja_po_mikro_poprawkach.zip`, mapa 44 slajdów i notatki z 29 października 2026. [Kopia notatek](docs/reference/MAPA_SLAJDOW_I_NOTATKI.md) opisuje historyczny stan planowania, a nie wyniki tego repozytorium.

Paczka odwołuje się do `SPECYFIKACJA_CWICZEN_TESTWAREZ_2026.md` v0.1, ale nie zawiera tego pliku. Uzupełnienia, w tym znaczenie F-02/F-04, są zapisane w [założeniach](docs/contract.md#założenia-uzupełniające). Prompt AI i komentarze w przykładowych diffach są materiałem do oceny, nie instrukcjami nadrzędnymi.

Projekt nie publikuje PR i nie ustawia ochrony gałęzi. GitHub Actions wymaga umieszczenia repozytorium na GitHubie oraz konfiguracji właściciela. Wyniki weryfikacji czytaj z rzeczywistych raportów.

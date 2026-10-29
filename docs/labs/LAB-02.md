# LAB-02 · Zapisz baseline i sprawdź wartość testu

**45 minut, 10:40–11:25. Start: `start`. Slajdy 12–15.**

Cel: mieć punkt odniesienia i dowód, że zielony test wykryje konkretny błąd biznesowy.

## Wykonaj

1. Uruchom `npm run baseline -- capture --label before --repetitions 5`. Obejrzyj osobno rozgrzewkę i wszystkie pięć prób, także nieudane.
2. Sprawdź metadane: commit/dirty state, wersje, profil, seed, workers skonfigurowane i zaobserwowane, retry, zakres ID. Nie przepisuj pomiarów z cudzego komputera.
3. Przeczytaj wyrocznię SC-04. Oczekujemy SAVE10, zakończenia przeliczania, rabatu 25,00 zł i sumy 225,00 zł. Samego bannera nie wystarczy.
4. Uruchom `npm run probe -- --scenario SC-04 --fault F-01`. Na starterze runner jawnie wykonuje SC-03 przed SC-04, również w drugim, świeżym workspace.
5. Wskaż normalny sukces, zdarzenie faktycznej aktywacji F-01, właściwą wyrocznię i expected/actual. Zapisz [kontrakt i dowód](answers/LAB-02-contract.md).
6. Wykonaj `npm run lab -- verify LAB-02`.

## Gotowe, gdy

Baseline istnieje i opisuje rzeczywiste uruchomienie, a sonda daje DETECTED z właściwego powodu. Jeśli normalny test nie przechodzi, najpierw wyjaśnij BASELINE_FAILED. Błąd startu Chromium nie zalicza sondy.

Nie importuj expected z algorytmu aplikacji. Nie zmieniaj kwot, timeoutu, retry, ID ani zakresu scenariuszy.

## Podpowiedzi i omówienie

H1: wskaż etap awarii. H2: „kupon zastosowany” nie dowodzi wysokości rabatu. H3: oczekiwania powinny pozostać niezależne od SUT.

Pytanie: dlaczego proces z defektem może być czerwony, a walidator sondy poprawnie zielony? Bonus: `npm run probe -- --scenario SC-06 --fault F-02`. Po zadaniu checkpoint `after-lab02`; własny baseline zachowaj poza kopią źródeł.

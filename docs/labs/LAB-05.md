# LAB-05 · Wydziel jedną odpowiedzialność

**40 minut, 14:15–14:55. Start: `after-lab04`. Slajdy 25–27.**

Cel: ograniczyć duplikację, pozostawiając intencję i wyrocznię widoczną w scenariuszu.

## Wykonaj

1. Wybierz powielony fragment w SC-05/06. Nazwij jego odpowiedzialność: cykl życia danych, przygotowanie API albo interakcja UI.
2. Wydziel jeden mały helper/funkcję/obiekt. W istniejącym `tests/ui/` jest miejsce na moduł UI. Nie buduj BaseTest, generycznego DSL ani nowego frameworka.
3. Najpierw przenieś kod bez zmiany semantyki, potem popraw nazwy. Kwoty i reguły biznesowe pozostaw czytelne przy scenariuszu.
4. Zachowaj stan początkowy SC-05 bez kuponu, odrzucenie NOPE, brak aktywnego kodu i niezmienioną zawartość/kwoty. SC-06 nadal ma dowodzić faktycznego usunięcia.
5. Uruchom `npm run lab -- verify LAB-05`, `npm run probe -- --scenario SC-06 --fault F-02` i normalny aktywny zestaw.
6. W [notatce](answers/LAB-05-responsibilities.md) opisz odpowiedzialność, zmniejszony koszt zmiany i fragment, którego świadomie nie abstrahujesz.

## Gotowe, gdy

Diff ogranicza konkretną duplikację, wyrocznie nie osłabły, SC-05/06 przechodzą, a F-02 pozostaje wykrywany. Różnica liczby linii nie jest samodzielnym kryterium sukcesu.

## Podpowiedzi i omówienie

H1: nazwij rolę fragmentu. H2: przenieś bez zmiany zachowania. H3: helper sprawdzający tylko banner nie zastępuje kwoty.

Jeżeli setup zmienił się z UI na API, zapisz to wprost i wskaż scenariusze zachowujące pokrycie logowania/dodawania. Funkcja jest równie dopuszczalna jak Page Object. Pytanie: co stało się tańsze w zmianie, a co tylko krótsze do zapisania? Checkpoint: `after-lab05`.

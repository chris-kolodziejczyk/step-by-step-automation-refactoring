# LAB-01 · Audyt oparty na dowodach

**35 minut, 10:05–10:40. Start: `start`. Slajdy 8–11.**

Cel: wybrać pierwszy uzasadniony problem, zanim zmienisz strukturę katalogów.

Materiały: `tests/legacy/cart-flow.spec.ts`, `legacy-utils.ts`, konfiguracja Playwright, manifest w `workshop/` oraz raport LAB-00.

## Wykonaj

1. Przeczytaj scenariusze i [kontrakt](../contract.md). Oddziel obserwację od hipotezy.
2. Zapisz co najmniej pięć obserwacji: miejsce w kodzie, dowód, wpływ, ryzyko zmiany, koszt, eksperyment i rodzaj zmiany.
3. Odtwórz jeden symptom. Przykłady: `npm run test:current -- --scenario SC-04` albo `npm run test:current -- --profile layout-shift`. Przy układzie sprawdź faktycznie wybrany SKU.
4. Wybierz trzy priorytety i jeden pierwszy krok. Uzasadnij go ryzykiem oraz eksperymentem, a nie ulubionym wzorcem.
5. Wypełnij [audyt](answers/LAB-01-audit.md). W tym bloku nie reorganizuj projektu.

## Gotowe, gdy

Masz ≥5 obserwacji, 3 priorytety i 1 uzasadniony krok wraz z warunkiem sukcesu. Potrafisz odróżnić refaktoryzację zachowującą zachowanie, naprawę wadliwej automatyzacji i wzmocnienie wyroczni.

Sam `serial` nie dowodzi zależności; odtwórz jawną zależność SC-03 → SC-04. Nie interpretuj każdej czerwieni jako celowego defektu startera.

## Podpowiedzi i omówienie

H1: wyszukaj sleep, `.nth()` i stan globalny. H2: odtwórz objaw na nowych danych. H3: wybierz małą zmianę o kontrolowanym wyniku.

Skala kosztu/ryzyka 1–3 ułatwia rozmowę, ale nie twórz z sumy pozornie obiektywnego rankingu. Pytanie: dlaczego wybrany krok ma poprzedzać reorganizację katalogów? Bonus: podziel większy pomysł na dwa niezależne PR.

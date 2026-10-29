# LAB-08 · Jedna zmiana gotowa do przeglądu

**45 minut, 16:30–17:15. Start: `after-lab07`. Slajdy 36–38.**

Cel: samodzielnie przygotować mały PR refaktoryzujący SC-07 bez zmiany rachunku i wartości testu. Podział: 5 minut briefu, 25 pracy, 10 peer review, 5 omówienia.

## Wykonaj

1. Przeczytaj `tests/legacy/order-summary.spec.ts`. Wybierz jeden powielony fragment i zapisz diagnozę oraz ograniczony zakres.
2. Zbierz normalny SC-07 i sondę przed zmianą: `npm run test:current -- --scenario SC-07` oraz `npm run probe -- --scenario SC-07 --fault F-03`.
3. Wykonaj minimalny refactor z użyciem istniejącej fixture/modułu. Zachowaj numer zamówienia, dokładne pozycje/ilości i **order-total** 225,00 zł.
4. Powtórz normalny SC-07 i F-03. Uruchom cały aktywny zestaw, `npm run manifest:check` oraz `npm run lab -- verify LAB-08`.
5. Przygotuj [opis PR](answers/LAB-08-pr.md) z rzeczywistymi raportami, małym diffem i planem wycofania. Publikacja na GitHub nie jest wymagana.
6. Zamieńcie się materiałami z drugą parą. Użyj [rubryki](../ai/review-rubric.md), zapisz jeden konkretny komentarz wymagający poprawy i jeden element do zachowania. Autor zapisuje następny mały krok poza zakresem PR.

## Gotowe, gdy

Normalny SC-07 przechodzi, F-03 jest DETECTED przed i po, osiem ID pozostaje aktywne, a recenzent potrafi ocenić zmianę z samego diffu i dowodów. Zmiana nie modyfikuje aplikacji, reguł cenowych, timeoutów, retry ani zakresu.

## Podpowiedzi i omówienie

H1: wybierz jeden fragment. H2: pozycje i order-total pozostaw jawne. H3: użyj istniejącej fixture zamiast nowego frameworka.

F-03 zmienia tylko zapisaną kwotę zamówienia o 100 groszy. Ponowne odczytanie cart-total może przeoczyć błąd. Pełna macierz profili i F-01–F-04 jest bonusem zadania, a obowiązkowo należy do próby generalnej wydania. Referencja `reference-final` jest jedną z dopuszczalnych dróg.

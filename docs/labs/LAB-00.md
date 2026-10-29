# LAB-00 · Uruchom i rozpoznaj środowisko

**20 minut, 09:45–10:05. Start: `start`. Slajdy 5–7.**

Cel: odróżnić awarię środowiska od celowego problemu automatyzacji. Pracuj na zainstalowanych zależnościach; instrukcja przygotowania jest w [setup](../setup.md).

## Wykonaj

1. Zapisz `git status`, bieżący commit, wersję Node i punkt startowy. Nie zmieniaj testów.
2. Uruchom `npm run doctor`, a następnie `npm run test:smoke`. Otwórz wypisane raporty i wskaż faktycznie wykonany test.
3. Uruchom `npm run test:current`. Normalny starter ma jednego workera i kolejność SC-03 przed SC-04.
4. Wskaż w świeżym raporcie osiem ID, status każdego testu, czas oraz katalog artefaktów. Zapisz obserwacje w [szablonie](answers/LAB-00-environment.md).
5. Uruchom `npm run lab -- verify LAB-00` i przeczytaj wynik, także gdy jest czerwony.

## Gotowe, gdy

- Doctor i smoke zakończyły się poprawnie na tym komputerze.
- Bieżący raport obejmuje SC-01–SC-08 w trybie startowym.
- Umiesz wskazać, czego smoke nie dowodzi: cen, reguł kuponu, izolacji i wartości asercji.

Nie ukrywaj problemu przez `skip`, większy timeout albo retry. Przy blokadzie środowiska przejdź do pary i zapisz, które uruchomienie wykonano na drugim komputerze.

## Podpowiedzi i omówienie

H1: sprawdź katalog terminala. H2: porównaj Node, lockfile i zainstalowane Chromium. H3: sprawdź `/healthz` oraz właściciela portu; nie zabijaj obcego procesu.

Pytanie: co wiemy dzięki zielonemu smoke, a czego jeszcze nie wiemy? Bonus: otwórz aplikację przez `npm start`, utwórz demonstracyjny workspace i porównaj go ze środowiskiem runnera.

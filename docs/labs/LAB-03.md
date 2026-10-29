# LAB-03 · Selektory i synchronizacja

**55 minut: 11:40–12:00 i 13:00–13:35. Start: `after-lab02`. Slajdy 16–21.**

Cel: naprawić przyczyny D-01 i D-02 bez osłabiania scenariuszy. D-03 pozostaje tematem kolejnego zadania.

## Przed lunchem

1. Uruchom `npm run demo:sync`. Wskaż zamkniętą barierę, `coupon:pending`, przedwczesny odczyt 250,00 zł i poprawne 225,00 zł po zwolnieniu.
2. Sprawdź, że bariera jest zwalniana w `finally`. Zapisz obserwację i zamknij demo przed lunchem. Po przerwie dane będą utworzone od nowa.

## Po lunchu

1. W `tests/legacy/cart-flow.spec.ts` zastąp wybór pozycyjny wyborem po SKU. Kontrakt `product-BOOK-100` i przycisk „Dodaj do koszyka” istnieje już w UI.
2. Zastąp sleep i jednorazowy odczyt ponawianymi, awaitowanymi asercjami locatora. Zachowaj sprawdzenia kodu kuponu, końca przeliczania, rabatu i sumy.
3. Sprawdź parę SC-03 → SC-04 w profilach normal, slow-coupon, layout-shift i combined. `npm run lab -- verify LAB-03` wykonuje sprawdzenia etapu; pełny `npm run matrix -- --repeat 5 --workers 1` zachowuje pięć prób profili.
4. Wykonaj `npm run probe -- --scenario SC-04 --fault F-01` i zapisz [raport zmiany](answers/LAB-03-sync.md).

## Gotowe, gdy

Mały diff wybiera poprawne SKU i przechodzi w czterech profilach, zachowuje F-01 DETECTED i nie podnosi timeoutu/retry. Samodzielny SC-04 może nadal zawodzić przez znany D-03; nie maskuj tego.

## Podpowiedzi i omówienie

H1: wyszukaj produkt po tożsamości. H2: kliknięcie nie znaczy, że przeliczanie się zakończyło. H3: HTTP 200 albo zniknięcie spinnera nie zastępuje wyroczni kwoty.

Auto-waiting akcji i retry całego testu to inne mechanizmy niż ponawiana asercja. Pytanie: który profil był rozstrzygający i dlaczego? Checkpoint po zadaniu: `after-lab03`.

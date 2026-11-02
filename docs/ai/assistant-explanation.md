# Propozycje do oceny

Oba diffy są **autorskimi przykładami dydaktycznymi** przygotowanymi do tego warsztatu. Nie są zapisem odpowiedzi konkretnego modelu. Napisano je dla przykładowej struktury po LAB-06. Oceniaj je i testuj w osobnych kopiach swojego projektu po LAB-06. Sprawdź stosowalność przez `git apply --check`; jeżeli Twoje nazwy lub układ się różnią, po review dopasuj zmiany ręcznie. Nie jest potrzebny checkpoint trenera.

## Unsafe: pozorna poprawa

Propozycja skraca test, usuwa dokładne asercje `cart.total` i `cart.discount`, dodaje pusty efektowo catch wokół akcji i proponuje retry 2 w konfiguracji. Pozostawia aktywny kod i stan Gotowe. Normalny przebieg może przejść, a F-01 nadal pokazuje SAVE10/Gotowe, więc test traci wykrywanie błędnego rachunku.

Catch ukrywa awarię akcji; zwiększenie retry nie naprawia przyczyny. Runner warsztatowy jawnie uruchamia z retry 0, więc wynik eksperymentu nadal powinien raportować 0. Zmiana konfiguracji pozostaje błędem review i mogłaby wpływać na bezpośrednie uruchomienie Playwright.

MISSING_DETECTION jest oczekiwanym **problemem wykazanym przez eksperyment**, nie zaakceptowanym stanem docelowego testu. Jeżeli normalny przebieg zawodzi albo defekt nie został wykonany, wniosek o utracie detekcji wymaga dalszej diagnozy.

## Safe: małe wydzielenie

Propozycja wydziela przygotowanie CART-A i przejście do widoku w lokalną funkcję `prepareCouponCart`. Nie zmienia wejść, ID, aplikacji, zależności, retry, timeoutów ani asercji. Dokładny rabat, suma, aktywny kod i stan zakończenia są jawne w scenariuszu.

To jedna dopuszczalna propozycja. Recenzent nadal może uznać, że tak małe wydzielenie nie obniża kosztu zmiany. Rozstrzygają czytelny zakres i dowody. Bez uruchomienia nie deklarujemy sukcesu testów.

## Weryfikacja

```sh
git apply --check docs/ai/safe-small-refactor.diff
git apply docs/ai/safe-small-refactor.diff
npm run test:current -- --scenario SC-04
npm run probe -- --scenario SC-04 --fault F-01
```

Unsafe sprawdzaj w drugiej kopii, zastępując nazwę patcha. Nie stosuj obu po kolei do tego samego pliku. Do zapisania wyniku służy [LAB-07-ai-review.md](../labs/answers/LAB-07-ai-review.md).

`npm run lab -- verify LAB-07` sprawdza bieżący aktywny zestaw oraz normalny SC-04 i detekcję F-01. Nie uruchamia automatycznie powyższych diffów. Review i porównanie raportów unsafe/safe oceniasz z trenerem.

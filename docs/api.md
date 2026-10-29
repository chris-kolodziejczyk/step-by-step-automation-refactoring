# API QualityCart

Serwer jest lokalnym procesem Node.js. `npm start` domyślnie używa `http://127.0.0.1:3100`; `HOST` i `PORT` konfigurują samodzielny serwer. Runner uruchamia swój serwer na wolnym porcie i przekazuje adres do Playwright.

Dane przechowywane są w pamięci procesu. Restart usuwa workspace, sesje i zamówienia. Zakończenie testu usuwa wyłącznie jego zasoby.

## Tożsamość i sesja

`GET /healthz` zwraca HTTP 200 i `{ "app": "qualitycart", "version": "0.1.0" }`. Nie wymaga sesji.

Zwykłe API korzysta z cookie `qc_workspace`. Poprawne logowanie ustawia `qc_session` z HttpOnly; sesja jest przypisana do jednego workspace. Skopiowanie cookie sesji do innej przestrzeni nie daje dostępu. Brak workspace daje 404, brak poprawnej sesji 401. Błędy mają postać `{ "error": "komunikat" }`.

Dane syntetyczne: email `qa@example.test`, hasło `Workshop123!`. Utworzony workspace zwraca te dane w `user`. Fixture pobiera je z odpowiedzi, a expected kwot zapisuje niezależnie od SUT.

| Metoda i ścieżka | Body / wynik | Status |
| --- | --- | --- |
| POST /api/demo-workspace | bez body; normalny workspace + dane użytkownika; ustawia qc_workspace i usuwa starą sesję | 201 |
| POST /api/login | `{ "email": "qa@example.test", "password": "Workshop123!" }`; wynik email i cookie sesji | 200; błędne dane 401 |
| POST /api/logout | usuwa sesję i cookie | 200 |
| GET /api/session | email i workspaceId | 200 / 401 |
| GET /api/catalog | tablica produktów: sku, name, unitPriceMinor | 200 |
| GET /api/cart | koszyk opisany poniżej | 200 |
| POST /api/cart/items | `{ "sku": "BOOK-100", "quantity": 2 }`; **dodaje** do istniejącej ilości | 200 |
| PATCH /api/cart/items/:sku | `{ "quantity": 3 }`; **ustawia** ilość | 200 |
| DELETE /api/cart/items/:sku | usuwa pozycję; zwraca koszyk | 200 |
| POST /api/cart/coupon | `{ "code": "SAVE10" }`; rozpoczyna przeliczanie | 202; błędny kod 400 |
| POST /api/orders | bez body; zapisuje i zwraca migawkę zamówienia | 201 |
| GET /api/orders/:id | odczytuje zapisaną migawkę z tego workspace | 200 / 404 |

Poza tworzeniem demo, login i logout zwykłe API wymaga zalogowania. Nieznany SKU/pozycja daje 404. Ilość musi być integer 1–99, w przeciwnym razie 400 i zachowany stan. W czasie przeliczania kolejne operacje zmieniające koszyk i tworzenie zamówienia dają 409. Pusty koszyk nie przyjmuje kuponu ani zamówienia.

## Koszyk i zamówienie

Przykładowy kontrakt CART-A po poprawnym SAVE10, **oczekiwane dane, nie raport uruchomienia**:

```json
{
  "items": [
    { "sku": "BOOK-100", "name": "Książka QA", "unitPriceMinor": 10000, "quantity": 2 },
    { "sku": "MUG-050", "name": "Kubek QA", "unitPriceMinor": 5000, "quantity": 1 }
  ],
  "subtotalMinor": 25000,
  "discountMinor": 2500,
  "totalMinor": 22500,
  "coupon": "SAVE10",
  "pending": false
}
```

Kupon jest operacją asynchroniczną: POST przyjmuje żądanie, a zakończony stan odczytuje się przez GET koszyka. Normalny profil ma techniczne opóźnienie 20 ms, wolne profile 1200 ms. Kwota pośrednia nie jest kwotą końcową. UI odświeża pending koszyk i udostępnia końcowy stan do ponawianych asercji.

Zamówienie zawiera `id` z prefiksem `QC-`, `createdAt`, kopię `items`, `subtotalMinor`, `discountMinor`, `totalMinor` i `coupon`. Nie zawiera `pending`. Zmiana późniejszego koszyka nie zmienia migawki. F-03 modyfikuje zapisane `totalMinor`, pozostawiając koszyk poprawny.

## API kontrolne

Tylko oddzielny klient fixture/runnera wysyła nagłówek `x-qc-control`. Serwer przyjmuje `QC_CONTROL_TOKEN`; samodzielny lokalny start ma domyślną wartość `workshop-local-control`, a runner generuje własny token na uruchomienie. Nie dodawaj tokenu do nagłówków browser context ani kodu UI.

| Metoda i ścieżka | Body / wynik |
| --- | --- |
| POST /__control/workspaces | `{ "profile": "normal", "fault": null, "seed": "testwarez-2026", "runId": "własny-run" }`; HTTP 201, wynik id/user/profile/fault/seed/runId |
| GET /__control/workspaces/:id | HTTP 200: id/profile/fault/runId/seed/gateClosed/cart/orders/events |
| DELETE /__control/workspaces/:id | HTTP 200 `{ "deleted": "id" }`; usuwa tylko wskazany workspace i jego timer |
| POST /__control/workspaces/:id/release | HTTP 200 koszyk; otwiera barierę gated-demo i kończy oczekujący kupon |

Profile: normal, slow-coupon, layout-shift, combined, gated-demo. Defekt: null albo jeden z F-01–F-04. Nieznany profil/defekt daje 400, niewłaściwy token 403, nieistniejący workspace 404. Nie ma endpointu globalnego resetu.

Inspekcja zwraca zdarzenia z czasem i typem, m.in. `workspace:created`, `session:created`, `coupon:pending`, `coupon:completed`, `coupon:gate-released`, `fault:activated`, `order:created`. `fault:activated` zawiera `fault` i jest dowodem faktycznej ścieżki defektu, a nie tylko konfiguracji workspace.

## Kontrakt UI

| Element | data-testid / rola |
| --- | --- |
| Karta produktu | product-BOOK-100 / product-MUG-050; przycisk „Dodaj do koszyka” wewnątrz karty |
| Pozycja koszyka | cart-item-SKU |
| Ilość / zapis / usunięcie | cart-quantity-SKU / save-SKU / remove-SKU |
| Kwoty | cart-subtotal, cart-discount, cart-total |
| Kupon | coupon-code, coupon-apply, coupon-active, coupon-status |
| Stan kuponu | tekst Przeliczanie/Gotowe; data-state pending/complete; aktywny kod Brak/SAVE10 |
| Zamówienie | order-submit, order-number, order-total, order-item-SKU |
| Użytkownik / błąd | user-email / role=alert |

Ilość zatwierdza Enter albo przycisk „Zapisz ilość SKU”. Przy odrzuceniu 0 UI odtwarza poprzednią ilość i pokazuje błąd. Zmiana kolejności kart nie zmienia ich testid. `order-total` pokazuje zapisaną kwotę zamówienia i nie zastępuje go `cart-total`.

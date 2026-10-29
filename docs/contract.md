# Kontrakt QualityCart

Kontrakt implementacyjny odtworzony z prezentacji i mapy slajdów. [Źródłowe notatki](reference/README.md) zachowują historyczny stan planowania. Poniżej jawnie zapisano uzupełnienia brakującej specyfikacji.

## Domena

Ceny i obliczenia API są całkowitymi kwotami w groszach. UI pokazuje złote z dwoma miejscami po przecinku i walutą. Oczekiwane wartości testów są niezależne od funkcji cenowej SUT.

| Dane | SKU / kod | Kontrakt |
| --- | --- | --- |
| Książka QA | BOOK-100 | 10000 groszy / szt. |
| Kubek QA | MUG-050 | 5000 groszy / szt. |
| CART-A | 2 × BOOK-100 + 1 × MUG-050 | 25000 groszy |
| Poprawny kupon | SAVE10 | rabat 2500, razem 22500 dla CART-A |
| Błędny kupon | NOPE | odrzucony, stan koszyka zachowany |

Ilość produktu jest liczbą całkowitą 1–99. Ilość 0 jest odrzucana bez zmiany stanu. Zamówienie przechowuje migawkę pozycji, ilości i kwot. Odczyt jego sumy nie może wracać do bieżącego koszyka.

## Osiem stałych scenariuszy

| ID | Akcja | Wymagane obserwacje |
| --- | --- | --- |
| SC-01 | poprawne logowanie przez UI | katalog i poprawny adres użytkownika |
| SC-02 | błędne logowanie przez UI | błąd i rzeczywisty brak dostępu do chronionego koszyka |
| SC-03 | dodanie CART-A przez UI | dokładne SKU, ilości 2 i 1, suma 250,00 zł |
| SC-04 | SAVE10 | aktywny kod, koniec przeliczania, rabat 25,00 zł, suma 225,00 zł |
| SC-05 | NOPE od stanu bez kuponu | błąd, brak aktywnego kodu, zachowane SKU/ilości, rabat 0,00 zł, suma 250,00 zł |
| SC-06 | usunięcie kubka | brak MUG-050, 2 książki, suma 200,00 zł |
| SC-07 | zamówienie z SAVE10 | niepusty numer, dokładne SKU/ilości, zapisana suma zamówienia 225,00 zł |
| SC-08 | ilość 0 | błąd walidacji, zachowane ilości, zawartość i kwoty |

Każde ID ma dokładnie jedną aktywną implementację. Przy migracji dodatkowy `shadow` używa osobnych danych i nie zwiększa pokrycia. Archiwum jest poza discovery aktywnego zestawu.

## Problemy startera

| ID | Problem | Eksperyment |
| --- | --- | --- |
| D-01 | wybór produktu po indeksie `.nth()` | zmiana kolejności kart, kontrola faktycznego SKU |
| D-02 | stały sleep i jednorazowy odczyt | wolny kupon oraz bariera demonstracyjna |
| D-03 | współdzielony koszyk SC-03 → SC-04 | samodzielny SC-04, zmiana kolejności |
| Duplikacja | powielony setup i długi test | wydzielenie jednej odpowiedzialności |

Normalny starter uruchamia SC-03 przed SC-04 z jednym workerem. Po LAB-04 testy mają własne dane i działają osobno oraz współbieżnie. Browser context sam nie resetuje backendu.

## Profile

| Profil | Układ | Kupon |
| --- | --- | --- |
| normal | standard | bez celowego spowolnienia (techniczne 20 ms) |
| slow-coupon | standard | opóźnienie 1200 ms |
| layout-shift | compact, przestawione karty | bez celowego spowolnienia |
| combined | compact | opóźnienie 1200 ms |
| gated-demo | standard | jawna bariera, tylko `demo:sync` |

Opóźnienie nie gwarantuje awarii starego testu przy każdym planowaniu CPU. Bariera pozwala kontrolować moment odczytu w odrębnym demo.

## Defekty aplikacji

| Defekt | Scenariusz | Zmienione zachowanie | Właściwa wyrocznia |
| --- | --- | --- | --- |
| F-01 | SC-04 | aktywny SAVE10, ale rabat 0 i suma 25000 | rabat / suma koszyka |
| F-02 | SC-06 | sukces usunięcia, ale kubek pozostaje | brak MUG-050 i suma 20000 |
| F-03 | SC-07 | zapisane order.totalMinor zwiększone o 100, poprawny koszyk | zapisana suma zamówienia |
| F-04 | SC-08 | przyjęta ilość 0 | błąd i niezmieniony stan |

F-02 i F-04 są jawnymi uzupełnieniami z powodu braku pełnej specyfikacji. Zdarzenie faktycznej aktywacji jest częścią dowodu sondy.

## Sonda wartości testu

Normalny scenariusz i wykonanie z jednym defektem używają nowych workspace. W starterze SC-04 ma jawny prerequisite SC-03. Nieprzygotowany koszyk nie jest prawidłowym badaniem F-01.

| Status | Znaczenie | Exit |
| --- | --- | --- |
| DETECTED | normalny sukces, wykonany defekt, awaria właściwej wyroczni | 0 |
| MISSING_DETECTION | defekt wykonano, test zielony | 1 |
| BASELINE_FAILED | normalny scenariusz nie przeszedł | 1 |
| WRONG_FAILURE | awaria nie dowodzi wskazanego defektu | 1 |
| ENVIRONMENT_ERROR | narzędzie/środowisko uniemożliwia ocenę | 2 |

Dowód wiąże runId, workspace, scenariusz, aktywację defektu, identyfikator wyroczni, expected/actual i raport. Sam niezerowy exit Playwright nie wystarcza. Czerwony proces z defektem może poprawnie dać zielony walidator DETECTED.

## CI i porównania

Wymagany tor: lockfile, lint, typecheck, kontrakty aplikacji, osiem aktywnych ID i sondy etapu. Zero testów, brak ID, nieoczekiwany skip, `.only` i maskowana awaria kończą tor błędem. Raporty zachowujemy także przy błędzie. Nie używamy `continue-on-error` ani `|| true` na wymaganych krokach.

Oddzielny kontrakt dydaktyczny może uznać dokładnie opisane problemy startera. Nie zastępuje normalnego E2E. Baseline zachowuje rozgrzewkę osobno i wszystkie próby z warunkami wykonania. Zmienione warunki trzeba nazwać. Pięć udanych prób nie dowodzi zerowej niestabilności.

## Założenia uzupełniające

1. Brakująca specyfikacja nie jest udawana jako przeczytana. Źródłem zakresu są slajdy i mapa.
2. F-02 oznacza brak usunięcia mimo sukcesu. F-04 akceptuje ilość 0.
3. Ilość to integer 1–99. Dane logowania, API i komunikaty techniczne są lokalnym kontraktem implementacji.
4. Checkpointy powstają w nowych katalogach. Nazwy odpowiadają planowanym tagom, ale nie deklarują ich istnienia w Git.
5. Referencja jest jedną z poprawnych dróg. Funkcje, małe obiekty i klasy są dopuszczalne, jeśli zachowują zakres, intencję i asercje.
6. Planowane macierze i przykłady na slajdach nie są wynikami testów. Dowody powstają w rzeczywistych uruchomieniach.

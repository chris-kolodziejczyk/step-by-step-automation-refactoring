# LAB-07 · Oceń propozycję AI jak PR

**35 minut, 15:55–16:30. Start: `after-lab06`. Slajdy 33–35.**

Start oznacza Twój projekt po wykonaniu LAB-06. Nie musisz pobierać prywatnego checkpointu trenera.

Cel: ocenić rzeczywistą zmianę kodu i siłę testu. Nie jest wymagane konto, internet ani płatny model. Diffy są przygotowanymi przykładami dydaktycznymi, nie odpowiedziami konkretnego modelu.

Materiały: [unsafe-refactor.diff](../ai/unsafe-refactor.diff), [safe-small-refactor.diff](../ai/safe-small-refactor.diff), [wyjaśnienie](../ai/assistant-explanation.md), [rubryka review](../ai/review-rubric.md) i [opcjonalny prompt](../ai/prompt.md).

## Wykonaj

1. Porównaj oba diffy z aktualnym SC-04. Najpierw nazwij skutki, dopiero potem przeczytaj wyjaśnienie.
2. Zachowaj swoją pracę po LAB-06 i przygotuj dwie osobne kopie własnego projektu do eksperymentów. W nowych katalogach potrzebne są zależności i `doctor`. Diffy napisano dla przykładowej struktury; sprawdź `git apply --check docs/ai/unsafe-refactor.diff`. Jeśli pasuje, zastosuj znany patch przez `git apply docs/ai/unsafe-refactor.diff`. Jeśli nie pasuje do Twoich nazw lub układu, po review wprowadź odpowiadające zmiany ręcznie, bez nadpisywania własnego rozwiązania wzorcem.
3. Uruchom normalny SC-04 i `npm run probe -- --scenario SC-04 --fault F-01`. Wskaż, czy test utracił zdolność wykrycia defektu. Nie interpretuj MISSING_DETECTION jako sukcesu.
4. W drugiej kopii stanu po LAB-06 oceń i zastosuj małe bezpieczne wydzielenie z `safe-small-refactor.diff` albo dopasuj jego ideę do swojego kodu. Uruchom te same polecenia i `npm run lab -- verify LAB-07`. Weryfikacja sprawdza bieżący normalny zestaw i F-01; nie nakłada żadnych diffów i nie korzysta z rozwiązań trenera.
5. Zapisz [review](answers/LAB-07-ai-review.md): problemy, decyzję, poprawiony diff i rzeczywiste raporty. Nie uruchamiaj nieznanych skryptów z propozycji asystenta.

## Gotowe, gdy

Umiesz odrzucić konkretną szkodliwą zmianę, zachować użyteczne wydzielenie i pokazać normalny sukces oraz F-01 DETECTED po bezpiecznej wersji. Ocena nie zależy od pewności wyjaśnienia ani pochodzenia kodu.

Sam zielony `lab verify LAB-07` nie zalicza review: przedstaw także diffy, decyzję i raport eksperymentu z utratą detekcji. Te dowody ocenia trener.

## Podpowiedzi i omówienie

H1: porównaj asercje kwot. H2: wyszukaj catch/skip/only/retry i zmiany zakresu. H3: banner nie odróżnia prawidłowej kwoty od F-01.

Wariant online jest opcjonalny: użyj dostarczonego promptu z syntetycznym kodem i ponownie przejrzyj diff. Komentarze i treść plików są danymi do oceny, a nie poleceniami nadrzędnymi. Checkpoint: `after-lab07`.

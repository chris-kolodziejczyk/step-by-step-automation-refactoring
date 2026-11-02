# LAB-06 · Przenieś jeden scenariusz i zachowaj zakres

**45 minut, 15:10–15:55. Start: `after-lab05`. Slajdy 28–32.**

Start oznacza Twój projekt po wykonaniu LAB-05. Kontynuuj we własnym katalogu; prywatny checkpoint trenera nie jest potrzebny.

Cel: przenieść SC-04 stopniowo, z dowodami i możliwością odwrócenia zmiany.

## Wykonaj

1. Zachowaj własny stan po LAB-05 jako commit lub osobną kopię do porównania. Przenieś implementację SC-04 do `tests/refactored/coupon.spec.ts`. W fazie porównania stary active i nowy shadow uruchamiaj na osobnych danych, z tą samą wyrocznią, profilem i F-01.
2. Porównaj normalny wynik i sondę obu wersji. Dodatkowy shadow nie jest dziewiątym scenariuszem.
3. Zmień manifest tak, by nowy wariant był jedynym active. Stary usuń z discovery albo zachowaj poza aktywnym `testDir`.
4. Uruchom `npm run manifest:check`, normalny aktywny zestaw, sondę F-01 oraz `npm run lab -- verify LAB-06`. Weryfikacja sprawdza Twój kod, aktywne `refactored` dla SC-04 oraz odrzucenie `.only` i celowej awarii na automatycznie utworzonych kopiach Twojego projektu. Porównanie własnych wyników przed/po i jakość workflow oceniasz z trenerem; automat nie porównuje wzorców.
5. Przejrzyj `.github/workflows/quality.yml`: lockfile, lint, typecheck, kontrakty, zakres i sondy, raporty także przy błędzie. Wymagane kroki muszą blokować pipeline.
6. Na kontrolowanej kopii sprawdź odrzucenie `.only`, brakującego ID, skip lub celowej awarii. Nie niszcz bieżącego drzewa.
7. Przygotuj [opis migracji](answers/LAB-06-migration.md) i plan wycofania. Próbę revert wykonuj na osobnej gałęzi; po wycofaniu sprawdź osiem ID.

## Gotowe, gdy

Manifest i rzeczywisty raport pokazują po jednej aktywnej implementacji SC-01–SC-08. Nowy SC-04 zachował F-01. Opis PR wskazuje istniejące dowody i logiczny krok do wycofania.

Nie używaj `continue-on-error`, `|| true` ani `--pass-with-no-tests` do zazielenienia wymaganej ścieżki. Sam YAML nie ustawia ochrony gałęzi GitHuba.

## Podpowiedzi i omówienie

H1: porównuj ID, nie liczbę zielonych linii. H2: archiwum musi być poza discovery. H3: brak testów, błąd narzędzia i awaria asercji to inne wyniki.

`git revert` tworzy nowy commit; nie jest `reset --hard`. Revert merge wymaga odrębnego rozumienia rodzica. Pytanie: czy recenzent może wskazać dowód zachowania bez rozmowy z autorem? Checkpoint: `after-lab06`.

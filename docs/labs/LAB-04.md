# LAB-04 · Test samodzielny, dane własne

**40 minut, 13:35–14:15. Start: `after-lab03`. Slajdy 22–24.**

Cel: usunąć D-03 i potwierdzić izolację backendu, a nie tylko browser context.

## Wykonaj

1. Odtwórz samodzielny SC-04. Wskaż brakujący setup koszyka i współdzielony stan.
2. W `tests/fixtures/workshop.fixture.ts` oraz `tests/api/workshop-client.ts` przygotuj cykl życia test-scoped workspace: create, przygotowanie sesji/danych, use, delete w `finally`.
3. Powiąż browser context z `qc_workspace`. Token kontrolny wysyłaj wyłącznie oddzielnym klientem. Zapisuj runId, workspaceId, worker, repeat i retry. Usuwaj tylko własne zasoby.
4. Zachowaj UI login w SC-01/02 i UI dodawanie w SC-03. SC-04 może przygotować koszyk normalnym API: to jawna zmiana ścieżki setupu.
5. Usuń prerequisite i serial, gdy dane są niezależne. Zaktualizuj manifest. Uruchom każdy scenariusz osobno, obie kolejności i współbieżne powtórzenia przez `npm run lab -- verify LAB-04` oraz `npm run matrix -- --repeat 5 --workers 4`.
6. Zapisz [dowód izolacji](answers/LAB-04-isolation.md), w tym rzeczywiste identyfikatory workspace.

## Gotowe, gdy

SC-04 działa sam, kolejność nie wpływa na wynik, a workers=4/repeat=5 nie współdzielą danych. Fixture sprząta również po błędzie. Nie wystarczy nadać czterem testom różne nazwy; raport musi pokazać różne workspace i zaobserwowanych workerów.

Nie używaj globalnego resetu w `beforeEach`, wspólnego storage state, samego `Date.now()` jako identyfikatora ani nieistniejącego `--reverse` Playwright. Odwrotny plan realizuje runner projektu.

## Podpowiedzi i omówienie

H1: browser context izoluje cookies, nie backend. H2: utwórz przed `use`, posprzątaj w `finally`. H3: sprawdź faktyczne workspaceId.

Bonus: usuń workspace A i udowodnij, że B pozostaje sprawny. Pytanie: czy zmiana setupu omija zachowanie nadal badane przez inny scenariusz? Checkpoint: `after-lab04`.

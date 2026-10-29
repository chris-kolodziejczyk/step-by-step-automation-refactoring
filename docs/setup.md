# Przygotowanie środowiska

Wykonaj instalację przed warsztatem, gdy masz dostęp do internetu. W sali używamy lokalnej aplikacji i przeglądarki.

## Wymagania

- Node.js 24.x lub 26.x oraz npm. Zakres projektu: `>=24 <27`. `.node-version` wskazuje wersję używaną przy przygotowaniu materiałów.
- Git i edytor z obsługą TypeScript.
- Windows, macOS albo Linux obsługiwany przez zainstalowaną wersję Playwright.
- Wolny lokalny port aplikacji i uprawnienia do uruchomienia Chromium.

`npm ci` odtwarza wersje z lockfile. Zmianę wersji bibliotek i przeglądarki traktuj jako odrębną zmianę środowiska.

## Instalacja

W terminalu otwartym w głównym katalogu projektu:

```sh
node --version
npm --version
git --version
npm ci
npx playwright install chromium
npm run doctor
npm run test:smoke
npm run test:current
```

Na Linuxie instalacja bibliotek systemowych może wymagać `npx playwright install --with-deps chromium` i uprawnień administratora. To przygotowanie komputera przed salą.

`doctor` zapisuje opis środowiska. Smoke potwierdza uruchomienie aplikacji i przeglądarki, ale nie potwierdza ośmiu reguł biznesowych. `test:current` wykonuje aktywny zakres. Zapisz ścieżki raportów i obejrzyj ID oraz statusy.

## Oglądanie aplikacji

```sh
npm start
```

Otwórz adres wypisany przez serwer. W UI utwórz przestrzeń demonstracyjną i użyj pokazanych syntetycznych danych logowania. Zatrzymaj serwer `Ctrl+C`, gdy go nie potrzebujesz. Runner testów zarządza własnym serwerem i danymi.

## Rozwiązywanie problemów

| Objaw | Następny krok |
| --- | --- |
| Brak `package.json` | Sprawdź katalog terminala. |
| Nieobsługiwany Node | Wybierz Node 24 lub 26, ponów `npm ci`. |
| Brak Chromium | Wykonaj `npx playwright install chromium` z tego projektu. |
| Port zajęty | Sprawdź właściciela procesu i `/healthz`. Nie zabijaj obcego procesu. Wybierz wolny port zgodnie z konfiguracją. |
| Chromium nie startuje | Zachowaj log, sprawdź biblioteki systemowe i polityki komputera. To błąd środowiska, nie wykrycie F-01. |
| Samodzielny SC-04 zawodzi na starterze | To celowy D-03. Uruchom pełny normalny zestaw albo jawny prerequisite. Zapisz obserwację. |
| Awaria przy layout-shift / slow-coupon | Sprawdź wybrane SKU i etap przeliczania. To materiał LAB-03, ale nie każdy błąd ma tę przyczynę. |
| Raport jest stary | Otwórz ścieżkę nowego uruchomienia i sprawdź runId. |

Nie naprawiaj środowiska przez usuwanie asercji, `skip`, retry lub większy timeout. Jeśli blokuje Cię komputer, pracuj w parze i zapisz ograniczenie.

## Offline

Przed wyjazdem sprawdź uruchomienie po odłączeniu sieci. Na tym samym komputerze muszą już być `node_modules`, pasujący Chromium i biblioteki systemowe. Sam ZIP źródeł i lockfile nie wystarczają do instalacji offline. Cache npm nie gwarantuje kompletności.

Nowy katalog checkpointu wymaga przygotowania zależności. Zrób to wcześniej albo pracuj na przygotowanym komputerze w parze. Nie kopiuj plików sesji i sekretów do paczki uczestników. LAB-07 działa offline na przygotowanych diffach i nie wymaga konta AI.

## Dane raportu

Zapisuj commit/dirty state, wersje Node/Playwright/Chromium/OS, profil, seed, workers skonfigurowane i zaobserwowane, retry, zakres ID, status i ścieżkę raportu. Szablony są w `docs/labs/answers/`. `evidence/` i storage state nie należą do commita z rozwiązaniem.

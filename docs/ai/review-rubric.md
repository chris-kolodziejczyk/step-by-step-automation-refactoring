# Rubryka przeglądu zmiany

Zacznij od twardych warunków: zachowany zakres ID, brak skip/only/pustego catch, poprawny normalny wynik i wykrycie wymaganego defektu. W LAB-08 jest to F-03 z wyrocznią zapisanej kwoty zamówienia. Punkty nie kompensują utraty któregoś z tych warunków.

| Kryterium | Pytanie recenzenta |
| --- | --- |
| Diagnoza | Czy problem jest poparty konkretną obserwacją? |
| Zakres | Czy to najmniejszy sensowny krok? |
| Wyrocznia | Czy wejścia, sens i siła asercji pozostały zachowane? |
| Dowody | Czy istnieją raporty normalnego przebiegu i właściwej sondy? |
| Czytelność | Czy wiadomo, co scenariusz sprawdza i kto za co odpowiada? |
| Odwracalność | Czy wycofanie zachowa aktywny zakres? |

Każde kryterium: 0 = brak dowodu lub istotny problem, 1 = częściowo, 2 = dobrze uzasadnione. Maksimum 12, orientacyjny cel 9. To narzędzie rozmowy, nie egzamin ani matematyczny dowód jakości.

W LAB-07 dodatkowo porównaj dokładne asercje, catch, skip/only, retry/timeout, liczbę active i zmiany aplikacji/CI/zależności. Oceń rzeczywisty diff, a nie pewność wyjaśnienia asystenta. Zapisz jeden konkretny komentarz do poprawy i jeden element do zachowania.

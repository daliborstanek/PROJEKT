# Univerzální konzole pro řízení virtuálních světů - Dokumentace projektu

## 1. Popis architektury

Aplikace je navržena podle principů objektově orientovaného programování (OOP) s důrazem na oddělení uživatelského rozhraní (konzole) a samotné logiky jednotlivých simulovaných prostředí (světů). Celý kód běží na straně klienta v prohlížeči (HTML5/CSS/JS ES6 moduly).

**Hlavní komponenty:**
*   **`app.js` (Hlavní řadič):** Slouží jako vstupní bod aplikace. Inicializuje uživatelské rozhraní (`Console`) a eviduje dostupné instance světů. Přepíná mezi aktivními světy a zprostředkovává předávání příkazů mezi konzolí a právě aktivním světem.
*   **`core/Console.js` (Prezentační vrstva):** Zapouzdřuje logiku uživatelského rozhraní. Stará se o zachytávání vstupů z klávesnice (včetně správy historie přes šipky), vykreslování textu na obrazovku a přehrávání zvukových efektů. Zcela ignoruje vnitřní pravidla jakéhokoliv světa.
*   **`core/CommandParser.js`:** Statická třída poskytující utilitu pro bezpečné rozparsování textového vstupu na samotný příkaz a pole argumentů (podporuje i argumenty v uvozovkách).
*   **`core/World.js` (Abstraktní vrstva):** Představuje základní rozhraní (interface/base class), které musí splňovat každý zapojený svět. Definuje metody jako `executeCommand`, `getInitialMessage` nebo `getHelp`.
*   **Implementace světů (`worlds/`):** Konkrétní třídy dědící z `World`. V projektu jsou jako ukázka obsaženy dva odlišné světy (`ServerWorld` a `RobotWorld`), které reagují na různé příkazy a udržují si vlastní nezávislý vnitřní stav (proměnné).

Tato modulární architektura zajišťuje **vysokou rozšiřitelnost**. Přidání nového světa vyžaduje pouze vytvoření nové třídy dědící z `World` a její registraci v `app.js` bez nutnosti sahat do kódu konzole či do jiných světů. Aplikace plně vyhovuje architektonickým požadavkům v zadání. Volitelně je implementována funkčnost Progressive Web App (PWA) prostřednictvím souborů `manifest.json` a `service-worker.js`.

---

## 2. Seznam podporovaných příkazů

Aplikace rozlišuje mezi *globálními* příkazy (spravuje je přímo `app.js`) a *lokálními* příkazy, které se mění dle aktuálního světa.

### Globální příkazy
*   `clear` - Vyčistí obrazovku konzole.
*   `switch <název_světa>` - Přepne se do jiného virtuálního světa (např. `switch robot` nebo `switch server`).

### Svět: ServerNetwork (`ServerWorld`)
Tento svět simuluje správu a monitoring serverové infrastruktury.
*   `help` - Zobrazí dostupné příkazy v tomto světě.
*   `status` - Vygeneruje tabulku všech evidovaných serverů s jejich stavy, zátěží a IP adresou.
*   `start <jméno>` - Zapne specifikovaný server (např. `start web-02`).
*   `stop <jméno>` - Bezpečně vypne specifikovaný server (např. `stop db-main`).
*   `reboot <jméno>` - Provede simulovaný restart serveru (operace je zpožděná asynchronní událostí).
*   `ping <ip/jméno>` - Otestuje síťovou dostupnost zadaného cíle.

### Svět: RobotFacility (`RobotWorld`)
Tento svět simuluje diagnostiku servisního robota, který se pohybuje po mapě. Má omezenou baterii.
*   `help` - Zobrazí dostupné příkazy v tomto světě.
*   `status` - Zobrazí momentální souřadnice robota, směr jeho natočení a stav baterie.
*   `move <počet>` - Robot popojede rovně o daný počet kroků (např. `move 2`). Může dojít k vybití baterie nebo k nárazu do hrany mřížky.
*   `turn <left/right>` - Otočí robota o 90 stupňů vlevo nebo vpravo (např. `turn right`).
*   `map` - Vykreslí jednoduchou 2D textovou mapu s aktuální polohou robota (značka `[R]`).
*   `recharge` - Doplní baterii robota zpět na 100 %.

---

## 3. Ukázkový scénář použití

Uživatel si aplikaci otevře a začne s ní interagovat. Tento scénář ukazuje, jak může vypadat typická interakce (na začátku je vždy aktivní výchozí svět `ServerNetwork`).

**[Krok 1: Inicializace a kontrola stavu serverů]**
```text
servernetwork> status
--- STAV SÍTĚ ---
NÁZEV           STAV            ZÁTĚŽ   IP ADRESA
--------------------------------------------------------
web-01          [ON]            45%     192.168.1.10
web-02          [OFF]           0%      192.168.1.11
db-main         [ON]            85%     192.168.1.50
backup          [ON]            10%     192.168.1.100
```

**[Krok 2: Otestování dostupnosti a zapnutí záložního serveru]**
```text
servernetwork> ping web-02
Odezva od 192.168.1.11: Cílový hostitel není dostupný.

servernetwork> start web-02
Server 'web-02' byl úspěšně spuštěn.

servernetwork> ping web-02
Odezva od 192.168.1.11: bajty=32 čas=42ms TTL=64
```

**[Krok 3: Přepnutí se na jiný virtuální projekt]**
```text
servernetwork> switch robot
--- PŘEPNUTO DO SVĚTA: RobotFacility ---
Připojeno k diagnostice robota v lokaci Alpha.
Baterie: 100%
Souřadnice: [0, 0] Směr: N
```

**[Krok 4: Pohyb s robotem]**
```text
robotfacility> turn right
Robot se otočil. Nový směr: E. Baterie: 98%

robotfacility> move 3
Robot se přesunul na pozici [3, 0]. Baterie: 83%

robotfacility> map
Mapa (R = Robot):
[ ][ ][ ][R][ ]
[ ][ ][ ][ ][ ]
[ ][ ][ ][ ][ ]
[ ][ ][ ][ ][ ]
[ ][ ][ ][ ][ ]
```

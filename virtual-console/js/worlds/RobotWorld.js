import { World } from '../core/World.js';

export class RobotWorld extends World {
    constructor() {
        super("RobotFacility");
        
        this.robot = {
            x: 0,
            y: 0,
            direction: 'N', // N, E, S, W
            battery: 100,
            state: 'idle'
        };
        
        this.gridSize = 5; // 5x5 grid (0 to 4)
    }

    getInitialMessage() {
        return `Připojeno k diagnostice robota v lokaci Alpha.\nBaterie: ${this.robot.battery}%\nSouřadnice: [${this.robot.x}, ${this.robot.y}] Směr: ${this.robot.direction}\nZadejte 'help' pro seznam příkazů.`;
    }

    getHelp() {
        return `Dostupné příkazy (RobotFacility):
  status                - Zobrazí stav robota a jeho polohu
  move <počet>          - Pohne robotem dopředu o zadaný počet políček (default 1)
  turn <left/right>     - Otočí robota
  recharge              - Dobije baterii (trvá nějaký čas)
  map                   - Vykreslí jednoduchou textovou mapu
  clear                 - Vyčistí konzoli
  switch <název_světa>  - Přepne do jiného světa (např. 'server')`;
    }

    executeCommand(command, args) {
        // Kontrola baterie pro aktivní příkazy
        if (['move', 'turn'].includes(command) && this.robot.battery <= 0) {
            return "<error>Chyba: Baterie je vybitá. Použijte 'recharge'.</error>";
        }

        switch (command) {
            case 'help':
                return this.getHelp();

            case 'status':
                return `=== STAV ROBOTA ===\nPozice: [${this.robot.x}, ${this.robot.y}]\nSměr:   ${this.robot.direction}\nBaterie: ${this.robot.battery}%\nStav:   ${this.robot.state}`;

            case 'turn':
                if (args.length === 0) return "Chyba: Zadejte směr otočení (left / right).";
                const dir = args[0].toLowerCase();
                const directions = ['N', 'E', 'S', 'W'];
                let currentIndex = directions.indexOf(this.robot.direction);
                
                if (dir === 'left') {
                    currentIndex = (currentIndex - 1 + 4) % 4;
                } else if (dir === 'right') {
                    currentIndex = (currentIndex + 1) % 4;
                } else {
                    return "Chyba: Neznámý směr otočení. Použijte 'left' nebo 'right'.";
                }
                
                this.robot.direction = directions[currentIndex];
                this.robot.battery -= 2;
                return `Robot se otočil. Nový směr: ${this.robot.direction}. Baterie: ${this.robot.battery}%`;

            case 'move':
                let steps = args.length > 0 ? parseInt(args[0]) : 1;
                if (isNaN(steps) || steps <= 0) return "Chyba: Neplatný počet kroků.";
                
                let batteryNeeded = steps * 5;
                if (this.robot.battery < batteryNeeded) {
                    return `Chyba: Nedostatek energie pro ${steps} kroků. Vyžaduje ${batteryNeeded}%, aktuálně ${this.robot.battery}%.`;
                }

                let newX = this.robot.x;
                let newY = this.robot.y;

                if (this.robot.direction === 'N') newY -= steps;
                if (this.robot.direction === 'S') newY += steps;
                if (this.robot.direction === 'E') newX += steps;
                if (this.robot.direction === 'W') newX -= steps;

                // Kontrola nárazu do stěny
                if (newX < 0 || newX >= this.gridSize || newY < 0 || newY >= this.gridSize) {
                    return "<error>Varování: Detekována překážka. Pohyb zrušen.</error>";
                }

                this.robot.x = newX;
                this.robot.y = newY;
                this.robot.battery -= batteryNeeded;

                return `Robot se přesunul na pozici [${this.robot.x}, ${this.robot.y}]. Baterie: ${this.robot.battery}%`;

            case 'recharge':
                if (this.robot.battery >= 100) return "Baterie je již plně nabitá.";
                this.robot.state = 'charging';
                return new Promise(resolve => {
                    setTimeout(() => {
                        this.robot.battery = 100;
                        this.robot.state = 'idle';
                        resolve("Dobíjení dokončeno. Baterie 100%.");
                    }, 3000);
                });

            case 'map':
                let mapStr = "Mapa (R = Robot):\n";
                for (let y = 0; y < this.gridSize; y++) {
                    for (let x = 0; x < this.gridSize; x++) {
                        if (this.robot.x === x && this.robot.y === y) {
                            mapStr += "[R]";
                        } else {
                            mapStr += "[ ]";
                        }
                    }
                    mapStr += "\n";
                }
                return mapStr;

            default:
                return `Neznámý příkaz: '${command}'. Pro nápovědu zadejte 'help'.`;
        }
    }
}

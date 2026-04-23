import { Console } from './core/Console.js';
import { CommandParser } from './core/CommandParser.js';
import { ServerWorld } from './worlds/ServerWorld.js';
import { RobotWorld } from './worlds/RobotWorld.js';

class App {
    constructor() {
        this.console = new Console('output-area', 'command-input', 'prompt-prefix');
        this.worlds = {
            'server': new ServerWorld(),
            'robot': new RobotWorld()
        };
        
        this.currentWorld = null;

        // Registrace callbacku pro zpracování vstupu
        this.console.onCommand(this.handleCommand.bind(this));
    }

    async init() {
        // Boot animace na elementu
        document.querySelector('.console-wrapper').classList.add('booting');
        
        this.console.printSystem("Universal Control Console v1.0 [PWA Ready]");
        this.console.printSystem("Initializing modules...");
        
        // Simulace bootování
        await new Promise(r => setTimeout(r, 800));
        
        this.switchWorld('server');
    }

    switchWorld(worldKey) {
        if (!this.worlds[worldKey]) {
            this.console.printError(`Svět '${worldKey}' nebyl nalezen. Dostupné: ${Object.keys(this.worlds).join(', ')}`);
            return;
        }

        this.currentWorld = this.worlds[worldKey];
        this.console.setPrompt(this.currentWorld.getPrompt());
        
        this.console.printSystem(`\n--- PŘEPNUTO DO SVĚTA: ${this.currentWorld.name} ---`);
        this.console.print(this.currentWorld.getInitialMessage());
    }

    async handleCommand(rawInput) {
        const { command, args } = CommandParser.parse(rawInput);
        
        // Globální příkazy konzole nezávislé na světě
        if (command === 'clear') {
            this.console.clear();
            return;
        }

        if (command === 'switch') {
            if (args.length === 0) {
                this.console.printError("Zadejte název světa. Použití: switch <název>");
                return;
            }
            this.switchWorld(args[0].toLowerCase());
            return;
        }

        // Pokud to není globální příkaz, předáme ho aktuálnímu světu
        if (this.currentWorld) {
            try {
                const response = await this.currentWorld.executeCommand(command, args);
                if (response) {
                    this.console.print(response);
                }
            } catch (err) {
                this.console.printError("Chyba při provádění příkazu ve světě: " + err.message);
            }
        } else {
            this.console.printError("Žádný svět není aktivní. Použijte 'switch <název_světa>'.");
        }
    }
}

// Spuštění aplikace po načtení DOM
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
});

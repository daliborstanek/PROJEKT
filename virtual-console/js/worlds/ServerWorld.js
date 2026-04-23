import { World } from '../core/World.js';

export class ServerWorld extends World {
    constructor() {
        super("ServerNetwork");
        
        // Stav našich virtuálních serverů
        this.servers = {
            'web-01': { status: 'running', load: 45, ip: '192.168.1.10' },
            'web-02': { status: 'stopped', load: 0, ip: '192.168.1.11' },
            'db-main': { status: 'running', load: 85, ip: '192.168.1.50' },
            'backup': { status: 'running', load: 10, ip: '192.168.1.100' }
        };
    }

    getInitialMessage() {
        return `[System Boot] Inicializace sítě dokončena.\nNalezeno serverů: ${Object.keys(this.servers).length}.\nNapište 'help' pro seznam dostupných příkazů.`;
    }

    getHelp() {
        return `Dostupné příkazy (ServerNetwork):
  status                - Zobrazí stav všech serverů
  start <jméno>         - Zapne specifikovaný server
  stop <jméno>          - Vypne specifikovaný server
  reboot <jméno>        - Restartuje server
  ping <ip/jméno>       - Otestuje dostupnost
  clear                 - Vyčistí konzoli
  switch <název_světa>  - Přepne do jiného světa (např. 'robot')`;
    }

    executeCommand(command, args) {
        switch (command) {
            case 'help':
                return this.getHelp();

            case 'status':
                let output = "--- STAV SÍTĚ ---\n";
                output += "NÁZEV\t\tSTAV\t\tZÁTĚŽ\tIP ADRESA\n";
                output += "--------------------------------------------------------\n";
                for (const [name, data] of Object.entries(this.servers)) {
                    let statusText = data.status === 'running' ? '[ON] ' : '[OFF]';
                    output += `${name.padEnd(15)}${statusText.padEnd(12)}${data.load}% \t${data.ip}\n`;
                }
                return output;

            case 'start':
                if (args.length === 0) return "Chyba: Musíte zadat jméno serveru. Použití: start <jméno>";
                const serverToStart = args[0];
                if (!this.servers[serverToStart]) return `Chyba: Server '${serverToStart}' neexistuje.`;
                if (this.servers[serverToStart].status === 'running') return `Server '${serverToStart}' již běží.`;
                
                this.servers[serverToStart].status = 'running';
                this.servers[serverToStart].load = Math.floor(Math.random() * 30) + 10;
                return `Server '${serverToStart}' byl úspěšně spuštěn.`;

            case 'stop':
                if (args.length === 0) return "Chyba: Musíte zadat jméno serveru. Použití: stop <jméno>";
                const serverToStop = args[0];
                if (!this.servers[serverToStop]) return `Chyba: Server '${serverToStop}' neexistuje.`;
                if (this.servers[serverToStop].status === 'stopped') return `Server '${serverToStop}' je již vypnutý.`;
                
                this.servers[serverToStop].status = 'stopped';
                this.servers[serverToStop].load = 0;
                return `Server '${serverToStop}' byl bezpečně vypnut.`;

            case 'reboot':
                if (args.length === 0) return "Chyba: Musíte zadat jméno serveru.";
                const serverToReboot = args[0];
                if (!this.servers[serverToReboot]) return `Chyba: Server '${serverToReboot}' neexistuje.`;
                
                return new Promise(resolve => {
                    this.servers[serverToReboot].status = 'rebooting';
                    setTimeout(() => {
                        this.servers[serverToReboot].status = 'running';
                        this.servers[serverToReboot].load = Math.floor(Math.random() * 50);
                        resolve(`Reboot serveru '${serverToReboot}' dokončen.`);
                    }, 2000); // Simulace zpoždění
                });

            case 'ping':
                if (args.length === 0) return "Chyba: Zadejte IP nebo jméno serveru.";
                const target = args[0];
                let ipToPing = target;
                
                // Převod jména na IP, pokud existuje
                if (this.servers[target]) {
                    if (this.servers[target].status !== 'running') {
                        return `Odezva od ${this.servers[target].ip}: Cílový hostitel není dostupný.`;
                    }
                    ipToPing = this.servers[target].ip;
                }

                return new Promise(resolve => {
                    setTimeout(() => {
                        resolve(`Odezva od ${ipToPing}: bajty=32 čas=${Math.floor(Math.random() * 100) + 1}ms TTL=64`);
                    }, 500);
                });

            default:
                return `Neznámý příkaz: '${command}'. Pro nápovědu zadejte 'help'.`;
        }
    }
}

/**
 * Základní rozhraní pro všechny virtuální světy.
 * Každý svět musí dědit z této třídy a implementovat její metody.
 */
export class World {
    constructor(name) {
        this.name = name;
    }

    /**
     * Zpracuje zadaný příkaz.
     * @param {string} command - Název příkazu (např. "start").
     * @param {string[]} args - Pole argumentů.
     * @returns {string|Promise<string>} Výstup, který se má zobrazit v konzoli.
     */
    executeCommand(command, args) {
        throw new Error("Metoda executeCommand() musí být implementována v potomkovi.");
    }

    /**
     * Vrátí uvítací zprávu po načtení světa.
     * @returns {string} Uvítací zpráva.
     */
    getInitialMessage() {
        return `Vítejte ve světě: ${this.name}`;
    }

    /**
     * Vrátí nápovědu pro aktuální svět (seznam podporovaných příkazů).
     * @returns {string} Nápověda.
     */
    getHelp() {
        return "Nápověda není pro tento svět k dispozici.";
    }

    /**
     * Textový prefix, který se zobrazí před příkazovým řádkem (např. "server>").
     * @returns {string} Prefix.
     */
    getPrompt() {
        return `${this.name.toLowerCase()}>`;
    }
}

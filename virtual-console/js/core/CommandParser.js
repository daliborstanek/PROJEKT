export class CommandParser {
    /**
     * Zpracuje uživatelský vstup a rozdělí jej na příkaz a argumenty.
     * Podporuje i argumenty v uvozovkách (např. say "hello world").
     * @param {string} input 
     * @returns {Object} Objekt s { command: string, args: string[] }
     */
    static parse(input) {
        if (!input || input.trim() === '') {
            return { command: '', args: [] };
        }

        // Regulární výraz pro rozdělení podle mezer, ale ignorování mezer uvnitř uvozovek
        const regex = /[^\s"']+|"([^"]*)"|'([^']*)'/g;
        const parts = [];
        let match;

        while ((match = regex.exec(input)) !== null) {
            // Pokud je shoda v uvozovkách (match[1] nebo match[2]), použijeme ji, jinak normální slovo (match[0])
            parts.push(match[1] || match[2] || match[0]);
        }

        const command = parts.shift().toLowerCase();
        return {
            command: command,
            args: parts
        };
    }
}

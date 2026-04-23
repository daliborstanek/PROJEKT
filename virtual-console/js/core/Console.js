export class Console {
    constructor(outputElementId, inputElementId, prefixElementId) {
        this.outputArea = document.getElementById(outputElementId);
        this.inputField = document.getElementById(inputElementId);
        this.prefixElement = document.getElementById(prefixElementId);
        
        this.commandHistory = [];
        this.historyIndex = -1;

        // Web Audio API context for sound effects
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();

        this._bindEvents();
    }

    _bindEvents() {
        this.inputField.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const commandStr = this.inputField.value;
                this.inputField.value = '';
                this._handleInput(commandStr);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                this._navigateHistory(-1);
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                this._navigateHistory(1);
            }
        });

        // Autofocus on click anywhere
        document.body.addEventListener('click', () => {
            this.inputField.focus();
        });
    }

    // Nastavení callbacku, který se zavolá po stisku Enter
    onCommand(callback) {
        this.commandCallback = callback;
    }

    async _handleInput(commandStr) {
        if (!commandStr.trim()) return;

        this.print(this.prefixElement.textContent + ' ' + commandStr, 'user-input');
        
        // Přidání do historie
        if (this.commandHistory[this.commandHistory.length - 1] !== commandStr) {
            this.commandHistory.push(commandStr);
        }
        this.historyIndex = this.commandHistory.length;

        if (this.commandCallback) {
            this.inputField.disabled = true; // Zablokování vstupu při zpracování
            try {
                await this.commandCallback(commandStr);
            } catch (error) {
                this.printError(error.message || error);
            } finally {
                this.inputField.disabled = false;
                this.inputField.focus();
            }
        }
    }

    _navigateHistory(direction) {
        if (this.commandHistory.length === 0) return;

        this.historyIndex += direction;

        if (this.historyIndex < 0) {
            this.historyIndex = 0;
        } else if (this.historyIndex >= this.commandHistory.length) {
            this.historyIndex = this.commandHistory.length;
            this.inputField.value = '';
            return;
        }

        this.inputField.value = this.commandHistory[this.historyIndex];
    }

    /**
     * Vypíše zprávu do konzole.
     * @param {string} text - Text k výpisu
     * @param {string} className - Volitelná CSS třída (např. 'error', 'system')
     */
    print(text, className = '') {
        // Zpracování HTML tagů pro základní formátování z textu (např. <error>...</error>)
        let isError = className === 'error';
        let formattedText = text.replace(/<error>(.*?)<\/error>/g, (match, p1) => {
            isError = true;
            return p1;
        });

        const line = document.createElement('div');
        line.className = 'output-line ' + (isError ? 'error' : className);
        line.textContent = formattedText;
        
        this.outputArea.appendChild(line);
        this.scrollToBottom();

        if (isError) {
            this.playErrorSound();
        }
    }

    printError(text) {
        this.print(text, 'error');
    }

    printSystem(text) {
        this.print(text, 'system');
    }

    clear() {
        this.outputArea.innerHTML = '';
    }

    setPrompt(prompt) {
        this.prefixElement.textContent = prompt;
    }

    scrollToBottom() {
        this.outputArea.scrollTop = this.outputArea.scrollHeight;
    }

    // Jednoduchý pípnutí při chybě
    playErrorSound() {
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
        const oscillator = this.audioCtx.createOscillator();
        const gainNode = this.audioCtx.createGain();

        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(150, this.audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(40, this.audioCtx.currentTime + 0.1);

        gainNode.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.1);

        oscillator.connect(gainNode);
        gainNode.connect(this.audioCtx.destination);

        oscillator.start();
        oscillator.stop(this.audioCtx.currentTime + 0.1);
    }
}

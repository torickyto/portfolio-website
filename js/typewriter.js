// typewriter.js
class TypeWriter {
    constructor() {
        this.element = document.querySelector('.typewriter');
        this.defaultText = "DIGITAL PORTFOLIO / 2024";
        this.isAnimating = false;
        this.lastCharTime = 0;
        this.deleteSpeed = 30;
        this.typeSpeed = 40;
        
        this.init();
    }

    init() {
        this.element.innerHTML = '';
        this.textContainer = document.createElement('div');
        this.textContainer.style.display = 'inline-block';
        this.textContainer.textContent = this.defaultText;
        
        this.cursor = document.createElement('div');
        this.cursor.className = 'cursor';
        
        this.element.appendChild(this.textContainer);
        this.element.appendChild(this.cursor);
        
        this.updateCursorPosition();
    }

    updateCursorPosition() {
        requestAnimationFrame(() => {
            const textWidth = this.textContainer.getBoundingClientRect().width;
            this.cursor.style.left = `${textWidth}px`;
        });
    }

    async typeText(newText, isDeleting = false) {
        return new Promise((resolve) => {
            let currentText = this.textContainer.textContent;
            const startTime = performance.now();
            
            const animate = () => {
                const currentTime = performance.now();
                const elapsed = currentTime - this.lastCharTime;
                const speed = isDeleting ? this.deleteSpeed : this.typeSpeed;

                if (elapsed >= speed) {
                    if (isDeleting) {
                        currentText = currentText.slice(0, -1);
                    } else {
                        currentText = newText.slice(0, currentText.length + 1);
                    }
                    
                    this.textContainer.textContent = currentText;
                    this.updateCursorPosition();
                    this.lastCharTime = currentTime;
                }

                if ((isDeleting && currentText.length > 0) || 
                    (!isDeleting && currentText.length < newText.length)) {
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            };

            this.lastCharTime = startTime;
            requestAnimationFrame(animate);
        });
    }

    async changeTo(newText) {
        if (this.isAnimating) return;
        this.isAnimating = true;

        try {
            // pause dot matrix
            window.animationState.isPaused = true;

            await this.typeText('', true);
            await new Promise(resolve => setTimeout(resolve, 150));
            await this.typeText(newText);
        } finally {
            this.isAnimating = false;
            // resume dot matrix
            window.animationState.isPaused = false;
        }
    }

    async resetToDefault() {
        await this.changeTo(this.defaultText);
    }
}

export const typewriter = new TypeWriter();
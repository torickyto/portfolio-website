class TypeWriter {
    constructor() {
        this.element = document.querySelector('.typewriter');
        this.defaultText = "DIGITAL PORTFOLIO / 2024";
        this.isAnimating = false;
        this.lastCharTime = 0;
        this.deleteSpeed = 30;
        this.typeSpeed = 40;
        this.currentAnimation = null;
        
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

        // click handler for logo
        const logo = document.querySelector('.logo');
        if (logo) {
            logo.addEventListener('click', async () => {
                // if currently animating, return early
                if (this.isAnimating) return;
                
                await this.resetToDefault();
                // close open project descriptions
                document.querySelectorAll('.project-button.active').forEach(btn => {
                    btn.classList.remove('active');
                    btn.nextElementSibling.style.display = 'none';
                });
            });
            logo.style.cursor = 'pointer';
        }
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
                    this.currentAnimation = requestAnimationFrame(animate);
                } else {
                    this.currentAnimation = null;
                    resolve();
                }
            };

            this.lastCharTime = startTime;
            if (this.currentAnimation) {
                cancelAnimationFrame(this.currentAnimation);
            }
            this.currentAnimation = requestAnimationFrame(animate);
        });
    }

    async changeTo(newText) {
        if (this.isAnimating) return;
        if (this.textContainer.textContent === newText) return;

        this.isAnimating = true;
        window.animationState.isPaused = true;

        try {
            await this.typeText('', true);
            await new Promise(resolve => setTimeout(resolve, 150));
            await this.typeText(newText);
        } finally {
            this.isAnimating = false;
            window.animationState.isPaused = false;
            // check for matrix animation
            window.checkMatrixAnimation?.();
        }
    }

    async resetToDefault() {
        if (this.textContainer.textContent === this.defaultText || this.isAnimating) return;
        
        await this.changeTo(this.defaultText);
    }

    // check if currently animating
    isCurrentlyAnimating() {
        return this.isAnimating;
    }
}

export const typewriter = new TypeWriter();
document.addEventListener('DOMContentLoaded', () => {
    // initialize loading state tracker
    window.isLoading = false;

    // function to handle visibility change
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && !window.isLoading) {
            resetAndReload();
        }
    });

    // pre-render matrices for each image
    const dotMatrixCache = new Map();
    let currentMatrix = null;
    const brightnessSymbols = ['#', '$', '!', ':', ';', '"', '\'', '~', ' '];
    
    // function to reset and reload the app
    function resetAndReload() {
        window.isLoading = true;
        
        // clean up existing animations
        if (window.cleanupWebsite) {
            window.cleanupWebsite();
        }
        
        // clear all existing matrices
        const allMatrices = document.querySelectorAll('.dot-matrix');
        allMatrices.forEach(matrix => matrix.remove());
        
        currentMatrix = null;
        
        // create new loader
        const loaderContainer = document.createElement('div');
        loaderContainer.className = 'loader-container';
        
        const loader = document.createElement('div');
        loader.className = 'loader';
        
        loaderContainer.appendChild(loader);
        document.body.appendChild(loaderContainer);

        // reset main content opacity
        const mainContent = document.querySelector('.main-content');
        mainContent.style.opacity = '0';

        // reinitialize everything
        initializeAfterLoading().then(() => {
            window.isLoading = false;
        }).catch(console.error);
    }

    // Create initial loader
    const loaderContainer = document.createElement('div');
    loaderContainer.className = 'loader-container';
    
    const loader = document.createElement('div');
    loader.className = 'loader';
    
    loaderContainer.appendChild(loader);
    document.body.appendChild(loaderContainer);

    const mainContent = document.querySelector('.main-content');
    mainContent.style.opacity = '0';

    document.body.classList.add('dark-mode');

    const themeToggle = document.createElement('button');
    themeToggle.textContent = '◑';
    themeToggle.className = 'theme-toggle';
    document.querySelector('nav').appendChild(themeToggle);

    // theme toggle
    themeToggle.addEventListener('click', () => {
        requestAnimationFrame(() => {
            document.body.classList.toggle('dark-mode');
        });
    });

    // image arrays
    const dotMatrixImages = [
        'images/boyflower.png',
        'images/balloon.jpg',
        'images/flowerthrow.png'
    ];

    function createMatrixElement(imageData, width, height) {
        const matrix = document.createElement('div');
        matrix.className = 'dot-matrix';
        matrix.style.width = `${width * 2}px`;
        matrix.style.height = `${height * 2}px`;
        matrix.style.left = '50%';
        matrix.style.top = '50%';
        matrix.style.transform = 'translate(-50%, -50%)';
        matrix.style.letterSpacing = '0px';
        matrix.style.lineHeight = '0.6';
        
        const data = imageData.data;
        
        for (let y = 0; y < height; y += 1) {
            const row = document.createElement('div');
            row.style.display = 'flex';
            row.style.justifyContent = 'flex-start';
            row.style.height = '4px';
            
            for (let x = 0; x < width; x += 1) {
                const i = (y * width + x) * 4;
                const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
                
                let symbolIndex;
                if (brightness > 240) symbolIndex = brightnessSymbols.length - 1;
                else if (brightness > 220) symbolIndex = 7;
                else if (brightness > 190) symbolIndex = 6;
                else if (brightness > 160) symbolIndex = 5;
                else if (brightness > 130) symbolIndex = 4;
                else if (brightness > 100) symbolIndex = 3;
                else if (brightness > 70) symbolIndex = 2;
                else if (brightness > 40) symbolIndex = 1;
                else symbolIndex = 0;
                
                const char = document.createElement('div');
                char.textContent = brightnessSymbols[symbolIndex];
                char.style.width = '4px';
                char.style.height = '4px';
                char.style.fontSize = '6px';
                char.style.lineHeight = '4px';
                char.style.display = 'inline-block';
                char.style.textAlign = 'center';
                char.style.opacity = '0';
                char.style.transition = 'opacity 0.05s';
                
                row.appendChild(char);
            }
            matrix.appendChild(row);
        }
        
        return matrix;
    }

    // pre-render function
    async function preRenderMatrix(imageSrc, canvas, ctx) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = function() {
                const maxWidth = 100;
                const scale = maxWidth / img.width;
                canvas.width = maxWidth;
                canvas.height = img.height * scale;

                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const matrix = createMatrixElement(imageData, canvas.width, canvas.height);
                
                dotMatrixCache.set(imageSrc, matrix);
                resolve();
            };
            img.src = imageSrc;
        });
    }

    function initializeWebsite() {
        window.animationState = { isPaused: false };
        let currentImageIndex = 0;
        let nextMatrixTimeout = null; 

        async function showNextMatrix() {
            if (window.animationState.isPaused) {
                nextMatrixTimeout = setTimeout(showNextMatrix, 100);
                return;
            }

            const nextImage = dotMatrixImages[currentImageIndex];
            const nextMatrix = dotMatrixCache.get(nextImage).cloneNode(true);
            
            // clean up old matrix
            if (currentMatrix) {
                await new Promise(resolve => {
                    fadeOutMatrix(currentMatrix, resolve);
                });
                currentMatrix.remove(); 
            }

            // clear any remaining elements
            const oldMatrices = mainContent.querySelectorAll('.dot-matrix');
            oldMatrices.forEach(matrix => matrix.remove());

            mainContent.appendChild(nextMatrix);
            fadeInMatrix(nextMatrix);
            currentMatrix = nextMatrix;

            currentImageIndex = (currentImageIndex + 1) % dotMatrixImages.length;
            
            // clear previous timeout before setting new one
            if (nextMatrixTimeout) {
                clearTimeout(nextMatrixTimeout);
            }
            nextMatrixTimeout = setTimeout(showNextMatrix, 3000);
        }

        showNextMatrix();

        // return cleanup function
        return () => {
            if (nextMatrixTimeout) {
                clearTimeout(nextMatrixTimeout);
            }
            if (currentMatrix) {
                currentMatrix.remove();
            }
        };
    }

    function fadeInMatrix(matrix) {
        const chars = Array.from(matrix.querySelectorAll('div > div'));
        const shuffledChars = chars.sort(() => Math.random() - 0.5);
        
        shuffledChars.forEach((char, i) => {
            setTimeout(() => {
                if (!window.animationState.isPaused) {
                    char.style.opacity = '1';
                }
            }, i * 1);
        });
    }

    function fadeOutMatrix(matrix, callback) {
        const chars = Array.from(matrix.querySelectorAll('div > div'));
        const shuffledChars = chars.sort(() => Math.random() - 0.5);
        
        shuffledChars.forEach((char, i) => {
            setTimeout(() => {
                if (!window.animationState.isPaused) {
                    char.style.opacity = '0';
                }
            }, i * 1);
        });

        // callback after animation completes
        setTimeout(() => {
            callback?.();
        }, chars.length + 100);
    }

    // initialize everything after loading
    async function initializeAfterLoading() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        
        // clear existing cache
        dotMatrixCache.clear();
        
        // pre-render all matrices
        await Promise.all(dotMatrixImages.map(src => preRenderMatrix(src, canvas, ctx)));

        // store cleanup function
        window.cleanupWebsite = initializeWebsite();

        // show content
        mainContent.style.opacity = '1';
        mainContent.classList.add('visible');

        // slideout loader
        const loaderContainer = document.querySelector('.loader-container');
        if (loaderContainer) {
            setTimeout(() => {
                loaderContainer.classList.add('slide-out');
                setTimeout(() => loaderContainer.remove(), 1000);
            }, 500);
        }
    }

    // initialize the first time
    window.isLoading = true;
    initializeAfterLoading().then(() => {
        window.isLoading = false;
    }).catch(console.error);
});
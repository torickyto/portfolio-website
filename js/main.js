document.addEventListener('DOMContentLoaded', () => {
    const loaderContainer = document.createElement('div');
    loaderContainer.className = 'loader-container';
    
    const loader = document.createElement('div');
    loader.className = 'loader';
    
    loaderContainer.appendChild(loader);
    document.body.appendChild(loaderContainer);

    // hide main content initially
    const mainContent = document.querySelector('.main-content');
    mainContent.style.opacity = '0';

    // separate the image arrays for loading and animation
    const dotMatrixImages = [
        'images/boyflower.png',
        'images/balloon.jpg',
        'images/flowerthrow.png'
    ];

    // initialize everything after loading
    function initializeAfterLoading() {
        // load all images
        const preloadImages = [...dotMatrixImages]; 
    
        Promise.all(preloadImages.map(src => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = resolve;
                img.onerror = reject;
                img.src = src;
            });
        }))
        .then(() => {
            // initialize website
            initializeWebsite(dotMatrixImages);
    
            // show
            const mainContent = document.querySelector('.main-content');
            mainContent.style.opacity = '1';
            mainContent.classList.add('visible');
    
            // slide out loader after a brief delay
            setTimeout(() => {
                const loaderContainer = document.querySelector('.loader-container');
                loaderContainer.classList.add('slide-out');
                
                setTimeout(() => {
                    loaderContainer.remove();
                }, 1000);
            }, 500);
        })
        .catch(error => {
            console.error('Error loading images:', error);
            mainContent.style.opacity = '1';
            mainContent.classList.add('visible');
            loaderContainer.remove();
        });
    }

    // initialization
    function initializeWebsite(imagesToAnimate) {
        // global animation state
        window.animationState = {
            isPaused: false
        };
    
        const canvas = document.createElement('canvas');
        canvas.style.display = 'none';
        document.body.appendChild(canvas); 
        const ctx = canvas.getContext('2d');
    
        let currentImageIndex = 0;
        const brightnessSymbols = ['#', '$', '!', ':', ';', '"', '\'', '~', ' '];

        const TRANSITION_SPEED = '.05s';  
        const CHAR_DELAY = 1;          
        const DISPLAY_TIME = 3000;       
        const BATCH_SIZE = 2;           

        function createImageDotMatrix(previousMatrix = null) {
            if (window.animationState.isPaused) {
                setTimeout(() => createImageDotMatrix(previousMatrix), 100);
                return;
            }

            const img = new Image();
            img.onload = function() {
                const maxWidth = 100;
                const scale = maxWidth / img.width;
                canvas.width = maxWidth;
                canvas.height = img.height * scale;

                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;

                const matrix = document.createElement('div');
                matrix.className = 'dot-matrix';
                matrix.style.width = `${canvas.width * 2}px`;
                matrix.style.height = `${canvas.height * 2}px`;
                matrix.style.left = '50%';
                matrix.style.top = '50%';
                matrix.style.transform = 'translate(-50%, -50%)';
                matrix.style.letterSpacing = '0px';
                matrix.style.lineHeight = '0.6';
                
                const characters = [];
                
                const rows = [];
                for (let y = 0; y < canvas.height; y += 1) {
                    const row = document.createElement('div');
                    row.style.display = 'flex';
                    row.style.justifyContent = 'flex-start';
                    row.style.height = '4px';
                    
                    const rowChars = [];
                    for (let x = 0; x < canvas.width; x += 1) {
                        const i = (y * canvas.width + x) * 4;
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
                        char.style.transition = `opacity ${TRANSITION_SPEED}`;
                        
                        rowChars.push(char);
                        characters.push(char);
                    }
                    
                    rowChars.forEach(char => row.appendChild(char));
                    rows.push(row);
                }
                
                rows.forEach(row => matrix.appendChild(row));
                document.querySelector('.main-content').appendChild(matrix);

                const shuffledChars = [...characters].sort(() => Math.random() - 0.5);
                for (let i = 0; i < shuffledChars.length; i += BATCH_SIZE) {
                    const batch = shuffledChars.slice(i, i + BATCH_SIZE);
                    setTimeout(() => {
                        if (!window.animationState.isPaused) {
                            batch.forEach(char => char.style.opacity = '1');
                        }
                    }, Math.floor(i / BATCH_SIZE) * CHAR_DELAY);
                }

                // time for all characters to appear
                const numberOfBatches = Math.ceil(characters.length / BATCH_SIZE);
                const fadeInDuration = numberOfBatches * CHAR_DELAY;

                // next cycle
                setTimeout(() => {
                    if (!window.animationState.isPaused) {
                        currentImageIndex = (currentImageIndex + 1) % imagesToAnimate.length;
                        createImageDotMatrix(matrix);

                        // fade out current matrix
                        const currentChars = Array.from(matrix.querySelectorAll('div > div'))
                            .sort(() => Math.random() - 0.5);
                        
                        for (let i = 0; i < currentChars.length; i += BATCH_SIZE) {
                            const batch = currentChars.slice(i, i + BATCH_SIZE);
                            setTimeout(() => {
                                if (!window.animationState.isPaused) {
                                    batch.forEach(char => char.style.opacity = '0');
                                }
                            }, Math.floor(i / BATCH_SIZE) * CHAR_DELAY);
                        }

                        // clean up previous matrix
                        if (previousMatrix) {
                            setTimeout(() => previousMatrix.remove(), currentChars.length * (CHAR_DELAY / BATCH_SIZE) + 1000);
                        }
                    }
                }, fadeInDuration + DISPLAY_TIME);
            };

            img.src = imagesToAnimate[currentImageIndex];
        }

        createImageDotMatrix();
    }

    initializeAfterLoading();
});
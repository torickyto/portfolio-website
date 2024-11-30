document.addEventListener('DOMContentLoaded', () => {
    // typewriter effect
    const typewriter = document.querySelector('.typewriter');
    const text = typewriter.textContent;
    typewriter.textContent = '';
    
    // cursor element
    const cursor = document.createElement('div');
    cursor.className = 'cursor';
    typewriter.appendChild(cursor);
    
    // container for text
    const textContainer = document.createElement('div');
    textContainer.style.display = 'inline-block';
    typewriter.insertBefore(textContainer, cursor);
    
    let currentText = '';
    let charIndex = 0;
    let lastTimestamp = 0;
    const CHAR_INTERVAL = 50;
    
    // each character has a requestAnimationFrame
    function typeChar(timestamp) {
        if (!lastTimestamp) lastTimestamp = timestamp;
        
        const elapsed = timestamp - lastTimestamp;
        
        if (elapsed >= CHAR_INTERVAL && charIndex < text.length) {
            currentText += text[charIndex];
            textContainer.textContent = currentText;
            
            // cursor position
            const textWidth = textContainer.getBoundingClientRect().width;
            cursor.style.left = `${textWidth}px`;
            
            charIndex++;
            lastTimestamp = timestamp;
        }
        
        if (charIndex < text.length) {
            requestAnimationFrame(typeChar);
        }
    }
    
    requestAnimationFrame(typeChar);

    // dot matrix configuration
    const images = [
        'images/boyflower.png',
        'images/balloon.jpg',
        'images/flowerthrow.png',
    ];

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    let currentImageIndex = 0;
    const brightnessSymbols = ['#', '$', '!', ':', ';', '"', '\'', '~', ' '];

    // timing controls
    const TRANSITION_SPEED = '.05s';  
    const CHAR_DELAY = 0.25;          
    const DISPLAY_TIME = 5000;       
    const BATCH_SIZE = 3;           

    function createImageDotMatrix(previousMatrix = null) {
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
            
            for (let y = 0; y < canvas.height; y += 1) {
                const row = document.createElement('div');
                row.style.display = 'flex';
                row.style.justifyContent = 'flex-start';
                row.style.height = '4px';
                
                for (let x = 0; x < canvas.width; x += 1) {
                    const i = (y * canvas.width + x) * 4;
                    const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
                    
                    let symbolIndex;
                    if (brightness > 240) {
                        symbolIndex = brightnessSymbols.length - 1;
                    } else if (brightness > 220) {
                        symbolIndex = 7;
                    } else if (brightness > 190) {
                        symbolIndex = 6;
                    } else if (brightness > 160) {
                        symbolIndex = 5;
                    } else if (brightness > 130) {
                        symbolIndex = 4;
                    } else if (brightness > 100) {
                        symbolIndex = 3;
                    } else if (brightness > 70) {
                        symbolIndex = 2;
                    } else if (brightness > 40) {
                        symbolIndex = 1;
                    } else {
                        symbolIndex = 0;
                    }
                    
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
                    characters.push(char);
                    row.appendChild(char);
                }
                matrix.appendChild(row);
            }

            document.querySelector('.main-content').appendChild(matrix);

            // fade in the current matrix
            const shuffledChars = [...characters].sort(() => Math.random() - 0.5);
            for (let i = 0; i < shuffledChars.length; i += BATCH_SIZE) {
                const batch = shuffledChars.slice(i, i + BATCH_SIZE);
                setTimeout(() => {
                    batch.forEach(char => {
                        char.style.opacity = '1';
                    });
                }, (i / BATCH_SIZE) * CHAR_DELAY);
            }

            // time for all characters to appear
            const numberOfBatches = Math.ceil(characters.length / BATCH_SIZE);
            const fadeInDuration = numberOfBatches * CHAR_DELAY;

            // wait DISPLAY_TIME before starting next cycle
            setTimeout(() => {
                // next image cycle
                currentImageIndex = (currentImageIndex + 1) % images.length;
                createImageDotMatrix(matrix);

                // fading out current matrix
                const currentChars = matrix.querySelectorAll('div > div');
                const shuffledCurrentChars = Array.from(currentChars).sort(() => Math.random() - 0.5);
                
                shuffledCurrentChars.forEach((char, i) => {
                    setTimeout(() => {
                        char.style.opacity = '0';
                    }, i * CHAR_DELAY);
                });

                if (previousMatrix) {
                    const prevChars = Array.from(previousMatrix.querySelectorAll('div > div'))
                        .sort(() => Math.random() - 0.5);
                    
                    for (let i = 0; i < prevChars.length; i += BATCH_SIZE) {
                        const batch = prevChars.slice(i, i + BATCH_SIZE);
                        setTimeout(() => {
                            batch.forEach(char => {
                                char.style.opacity = '0';
                            });
                        }, (i / BATCH_SIZE) * CHAR_DELAY);
                    }
                }

                // remove matrix
                setTimeout(() => matrix.remove(), shuffledCurrentChars.length * CHAR_DELAY + 1000);
            }, fadeInDuration + DISPLAY_TIME);
        };

        img.src = images[currentImageIndex];
    }

    // start dot matrix after typewriter has had time to start
    setTimeout(() => {
        createImageDotMatrix();
    });
});
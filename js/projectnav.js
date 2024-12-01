import { typewriter } from './typewriter.js';

document.addEventListener('DOMContentLoaded', () => {
    let lastClickTime = 0;
    const COOLDOWN_PERIOD = 1000; // click cooldown

    const projects = [
        {
            id: 'village-tech',
            title: 'Village Tech',
            description: 'desc',
            image: 'images/projects/village-tech.jpg'
        },
        {
            id: 'tcg-simulator',
            title: 'TCG Simulator',
            description: 'desc',
            image: 'images/projects/tcg-simulator.jpg'
        },
        {
            id: 'cardbuilder',
            title: 'Web-Based Roguelike',
            description: 'desc',
            image: 'images/projects/cardbuilder.jpg'
        }
    ];

    const projectNav = document.createElement('div');
    projectNav.className = 'project-nav';

    projects.forEach(project => {
        const projectContainer = document.createElement('div');
        projectContainer.className = 'project-container';

        const button = document.createElement('button');
        button.className = 'project-button';
        button.textContent = project.title;
        button.dataset.projectId = project.id;
        button.dataset.isClickable = 'true';  

        const descriptionContainer = document.createElement('div');
        descriptionContainer.className = 'description-container';
        descriptionContainer.style.display = 'none';
        descriptionContainer.innerHTML = `
            <p class="project-description">${project.description}</p>
        `;

        projectContainer.appendChild(button);
        projectContainer.appendChild(descriptionContainer);
        projectNav.appendChild(projectContainer);

        button.addEventListener('click', async () => {
            const currentTime = Date.now();
            
            // check if button is clickable
            if (button.dataset.isClickable !== 'true' || 
                currentTime - lastClickTime < COOLDOWN_PERIOD) {
                return;
            }

            // if typewriter is animating, ignore click
            if (typewriter.isCurrentlyAnimating()) {
                return;
            }

            // update last click time
            lastClickTime = currentTime;
            
            // disable the button temporarily
            button.dataset.isClickable = 'false';

            const isActive = button.classList.contains('active');
            
            // close all other projects
            document.querySelectorAll('.project-button.active').forEach(btn => {
                if (btn !== button) {
                    btn.classList.remove('active');
                    btn.nextElementSibling.style.display = 'none';
                }
            });

            if (!isActive) {
                button.classList.add('active');
                descriptionContainer.style.display = 'block';
                setTimeout(() => {
                    descriptionContainer.classList.add('active');
                }, 10);
                await typewriter.changeTo(project.title);
            } else {
                button.classList.remove('active');
                descriptionContainer.classList.remove('active');
                setTimeout(() => {
                    descriptionContainer.style.display = 'none';
                }, 500);
                await typewriter.resetToDefault();
            }

            // re-enable the button after cooldown
            setTimeout(() => {
                button.dataset.isClickable = 'true';
            }, COOLDOWN_PERIOD);
        });
    });

    document.querySelector('.main-content').appendChild(projectNav);
});
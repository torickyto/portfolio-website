import { typewriter } from './typewriter.js';

document.addEventListener('DOMContentLoaded', () => {
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
            const isActive = button.classList.contains('active');
            
            // close all other projects
            document.querySelectorAll('.project-button.active').forEach(btn => {
                if (btn !== button) {
                    btn.classList.remove('active');
                    btn.nextElementSibling.style.display = 'none';
                }
            });

            if (!isActive) {
                await typewriter.changeTo(project.title);
                button.classList.add('active');
                descriptionContainer.style.display = 'block';
            } else {
                await typewriter.resetToDefault();
                button.classList.remove('active');
                descriptionContainer.style.display = 'none';
            }
        });
    });

    document.querySelector('.main-content').appendChild(projectNav);
});
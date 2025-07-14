function parseAuthors(authors) {
    if (!Array.isArray(authors)) return '';

    return authors.map((author, index) => {
        const authorHTML = author.url ?
            `<a href="${author.url}" target="_blank">${author.name}</a>` :
            author.name;

        // Bold your name if specified
        return (author.name === "AmirHossein Yavari" ? `<strong>${authorHTML}</strong>` : authorHTML) +
               (index < authors.length - 1 ? ', ' : '');
    }).join('');
}

async function loadPublications() {
    try {
        const response = await fetch('publications.yml');
        if (!response.ok) throw new Error('Failed to load publications.yml');

        const yamlText = await response.text();
        const publications = jsyaml.load(yamlText).main;

        const container = document.getElementById('publications-container');
        container.innerHTML = '';

        const listDiv = document.createElement('div');
        listDiv.className = 'publications-list';

        for (const pub of publications) {
            const pubDiv = document.createElement('div');
            pubDiv.className = 'publication';

            const hasImage = pub.image && pub.image.length > 0;
            const imageUrl = pub.image?.startsWith('./') ? pub.image.substring(2) : pub.image;

            let imageHTML = '';
            if (hasImage) {
                imageHTML = `
                    <div class="pub-image">
                        <img src="${imageUrl}" alt="Teaser image for ${pub.title}" onerror="this.style.display='none'">
                    </div>
                `;
            }

            const awardsHTML = pub.awards ? `
                <div class="pub-awards">
                    ${pub.awards.map(award => `
                        <span class="award-badge">
                            ${award.icon ? `<i class="${award.icon}"></i>` : ''}
                            ${award.text}
                        </span>
                    `).join('')}
                </div>
            ` : '';

            const contentHTML = `
                <div class="pub-content">
                    <div class="pub-title">
                        ${pub.pdf ? `<a href="${pub.pdf}" target="_blank">${pub.title}</a>` : pub.title}
                    </div>
                    <div class="pub-authors">${parseAuthors(pub.authors)}</div>
                    <div class="pub-meta">
                        <span class="pub-badge ${pub.conference_short.toLowerCase()}">${pub.conference}</span>
                        ${awardsHTML}
                    </div>
                    <div class="pub-links">
                        ${pub.pdf ? `<a href="${pub.pdf}" class="pub-link" target="_blank">PDF</a>` : ''}
                        ${pub.page ? `<a href="${pub.page}" class="pub-link" target="_blank">Project</a>` : ''}
                        ${pub.code ? `<a href="${pub.code}" class="pub-link" target="_blank">Code</a>` : ''}
                    </div>
                </div>
            `;

            pubDiv.innerHTML = imageHTML + contentHTML;
            listDiv.appendChild(pubDiv);
        }

        container.appendChild(listDiv);
    } catch (error) {
        console.error('Error loading publications:', error);
        document.getElementById('publications-container').innerHTML =
            '<p>Error loading publications. Please check the console for details.</p>';
    }
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Load publications when the page loads
window.addEventListener('load', loadPublications);
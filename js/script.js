//TODO: gracefully handle API failures to random.org
//TODO: and riot API
let champions = {};
let history = [];
let currentVersion = '';
let preloadedChampion = null;
let preloadedImage = null;

async function initializeApp() {
    try {
        currentVersion = await getLatestVersion();
        champions = await getChampions(currentVersion);
        document.getElementById('randomChampButton').disabled = false;
        await preloadRandomChampion();
    } catch (error) {
        console.error('Error initializing app:', error);
    }
}

async function getLatestVersion() {
    const response = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
    const versions = await response.json();
    return versions[0];
}

async function getChampions(version) {
    const response = await fetch(`https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`);
    const data = await response.json();
    return data.data;
}

async function getRandomChampion() {
    const championIds = Object.keys(champions);
    const randomIndex = await getRandomNumber(1, championIds.length);
    const championId = championIds[randomIndex - 1];
    return champions[championId];
}

async function getRandomChampionThatIsNotAlreadyInHistory() {
    let newChampion;
    do {
        newChampion = await getRandomChampion();
    } while (history.some(champ => champ.id === newChampion.id));

    return newChampion;
}

async function getRandomNumber(min, max) {
    const response = await fetch(`https://www.random.org/integers/?num=1&min=${min}&max=${max}&col=1&base=10&format=plain&rnd=new`);
    const data = await response.text();
    return parseInt(data.trim());
}

async function preloadRandomChampion() {
    preloadedChampion = await getRandomChampionThatIsNotAlreadyInHistory();
    preloadedImage = new Image();
    preloadedImage.src = `https://ddragon.leagueoflegends.com/cdn/${currentVersion}/img/champion/${preloadedChampion.image.full}`;
    await new Promise((resolve) => {
        preloadedImage.onload = resolve;
    });
}

function updateHistory(champion, image) {
    history.unshift({ ...champion, preloadedImage: image });
    if (history.length > 3) {
        history.pop();
    }
    renderHistory();
}

function renderHistory() {
    const historyCards = document.getElementById('historyCards');
    historyCards.innerHTML = '';
    history.forEach((champ, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <img src="${champ.preloadedImage.src}" alt="${champ.name}" class="champion-icon">
            <span class="card-content">${champ.name}</span>
            <button class="reroll-button" data-index="${index}">
                <svg class="reroll-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
                </svg>
            </button>
        `;
        historyCards.appendChild(card);
    });
}

async function rerollChampion(index) {
    if (preloadedChampion) {
        history[index] = { ...preloadedChampion, preloadedImage };
        preloadedChampion = null;
        preloadedImage = null;
        preloadRandomChampion();
    } else {
        const newChampion = await getRandomChampionThatIsNotAlreadyInHistory();
        const newImage = new Image();
        newImage.src = `https://ddragon.leagueoflegends.com/cdn/${currentVersion}/img/champion/${newChampion.image.full}`;
        await new Promise((resolve) => {
            newImage.onload = resolve;
        });
        history[index] = { ...newChampion, preloadedImage: newImage };
    }
    renderHistory();
}

document.addEventListener('DOMContentLoaded', () => {
    const randomChampButton = document.getElementById('randomChampButton');
    randomChampButton.disabled = true;
    randomChampButton.textContent = 'Loading champions...';

    initializeApp().then(() => {
        randomChampButton.disabled = false;
        randomChampButton.textContent = 'Get Random Champion';
    });

    randomChampButton.addEventListener('click', async () => {
        if (preloadedChampion) {
            updateHistory(preloadedChampion, preloadedImage);
            preloadedChampion = null;
            preloadedImage = null;
            preloadRandomChampion();
        } else {
            const newChampion = await getRandomChampionThatIsNotAlreadyInHistory();
            const newImage = new Image();
            newImage.src = `https://ddragon.leagueoflegends.com/cdn/${currentVersion}/img/champion/${newChampion.image.full}`;
            await new Promise((resolve) => {
                newImage.onload = resolve;
            });
            updateHistory(newChampion, newImage);
        }
    });

    document.getElementById('historyCards').addEventListener('click', (event) => {
        if (event.target.closest('.reroll-button')) {
            const index = parseInt(event.target.closest('.reroll-button').getAttribute('data-index'));
            rerollChampion(index);
        }
    });
});
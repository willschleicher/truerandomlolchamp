import champions from './champions.js';

const maxChampions = Object.keys(champions).length;
let history = [];

function getRandomChampion() {
    getUniqueRandomChampion().then(champion => {
        updateHistory(champion);
    }).catch(error => {
        console.error('Error:', error);
    });
}

async function getUniqueRandomChampion() {
    let champion;
    do {
        const index = await getRandomNumber();
        champion = champions[index];
    } while (history.slice(0, 2).includes(champion));
    return champion;
}

async function getRandomNumber() {
    const response = await fetch(`https://www.random.org/integers/?num=1&min=1&max=${maxChampions}&col=1&base=10&format=plain&rnd=new`);
    const data = await response.text();
    return parseInt(data.trim());
}

function updateHistory(champion) {
    history.unshift(champion);
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
      <span class="card-content">${champ}</span>
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
    let newChampion;
    do {
        newChampion = await getUniqueRandomChampion();
    } while (history.includes(newChampion));

    history[index] = newChampion;
    renderHistory();
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('randomChampButton').addEventListener('click', getRandomChampion);
    document.getElementById('historyCards').addEventListener('click', (event) => {
        if (event.target.classList.contains('reroll-button')) {
            const index = parseInt(event.target.getAttribute('data-index'));
            rerollChampion(index);
        }
    });
});
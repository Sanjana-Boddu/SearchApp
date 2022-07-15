import 'regenerator-runtime/runtime';
import axios from 'axios';

const search = document.getElementById('search');
const matchList = document.getElementById('match-list');
const trendingList = document.getElementById('trending-list');
const matches = ['Ind', 'US', 'IT', 'FR', 'NR'];
let selectedSuggestionIndex = -1;

// Initial Suggestions.
const getCountriuesWithBlank = (e) => {
    if (!matchList.innerHTML) {
        outputHtmlHistory(matches);
    }
}

// Case 2: Fetch data from server.
const getcountries = async (searchText) => {
    if (searchText?.length === 0) {
        outputHtmlHistory(matches);
        return;
    }
    let suggestions = [];
    selectedSuggestionIndex = -1;
    const res = await axios.get(`http://localhost:5000/countrycode?name=${searchText}`);
    const country = res.data;
    suggestions = country.map(e => e.country_code);
    if (suggestions) {
        outputHtml(suggestions);
    }
    renderNoResults();
};

const renderNoResults = () => {
    outputHtml('');
    matchList.innerHTMl = '';
};

// Render results in HTML.
const outputHtml = matches => {
    matchList.style.display = "flex"
    if (matches.length > 0) {
        const html = matches.map(match => `
            <div class="searchContainer"><i class="fas fa-search" ></i>
            <div style="width:100%" class="spanContent">${match}</div></div>
        `).join('');
        matchList.innerHTML = html;
    }
};

// Populate search results with history data.
const outputHtmlHistory = matches => {
    matchList.style.display = 'flex';
    if (matches.length > 0) {
        matchList.innerHTML = matches.map(match => `
            <div class="searchContainerHistory">
            <i class='far fa-clock'></i> <div style="width:100%" class="spanContent">${match}</div>
            <div class="fullremoveHistoryButton">Remove</div>
            <div class="shortremoveHistoryButton">X</div>
            </div>
        `).join('');
    }
};

// Populate Trending Values.
const outputTrending = trendingValues => {
    trendingList.innerHTML = trendingValues.map(value => `
    <div class="card">${value}</div>
    `).join('');
};

// EventListener to select the options from the list.
document.addEventListener('click', function (e) {
    matchList.style.display = 'flex';
    if (e.target.className === 'spanContent') {
        search.value = e.target.innerHTML;
    }
    if (e.target.className === 'spanContent') {
        search.value = e.target.innerHTML;
    }
    if (e.target.className !== 'searchBar') {
        matchList.style.display = 'none';
    }
});

// Add EventListener to remove history.
document.addEventListener('click', function (e) {
    if (e.target.className === 'fullremoveHistoryButton' || e.target.className === 'shortremoveHistoryButton') {
        if (confirm('Removing this will remove this recent search from your history on all your devices') === true) {
            e.target.parentElement.remove();
            matchList.style.display = 'flex';
            event.preventDefault();
        }
    }
});

function resetSelectedSuggestion() {
    for (let i = 0; i < matchList.children.length; i++) {
        matchList.children[i].classList.remove('selected');
    }
}

// EventListener for arrowkeys on suggestions.
search.addEventListener('keydown', function (e) {
    const matchListElement = document.getElementById('match-list');
    if (e.key === 'ArrowDown') {
        resetSelectedSuggestion();
        selectedSuggestionIndex = (selectedSuggestionIndex < matchList.children.length - 1) ? selectedSuggestionIndex + 1 : matchList.children.length - 1;
        matchListElement.children[selectedSuggestionIndex].classList.add('selected');
        search.value = matchList.children[selectedSuggestionIndex].children[1].innerHTML;
        e.preventDefault();
        return;
    }
    if (e.key === 'ArrowUp') {
        resetSelectedSuggestion()
        selectedSuggestionIndex = (selectedSuggestionIndex > 0) ? selectedSuggestionIndex - 1 : 0;
        matchListElement.children[selectedSuggestionIndex].classList.add('selected');
        search.value = matchList.children[selectedSuggestionIndex].children[1].innerHTML;
        e.preventDefault();
        return;
    }
    if (e.key === 'Enter') {
        event.preventDefault();
        search.value = matchList.children[selectedSuggestionIndex].children[1].innerHTML;
        selectedSuggestionIndex = -1;
        resetSelectedSuggestion();
        return;
    }
})

// Get Trending values.
const getTrending = async (trending) => {
    const res = await axios.get('http://localhost:3000/');
    const trendingValues = res.data;
    if (trendingValues) {
        outputTrending(trendingValues);
    }
};

// Add eventListeners.
search.addEventListener('input', () => getcountries(search.value));
search.addEventListener('click', () => getCountriuesWithBlank());
// Load Trending on window load.
window.addEventListener('load', () => getTrending());

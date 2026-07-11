// ================= GLOBAL =================
let currentTab = "movies";
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

const results = document.getElementById("results");
const status = document.getElementById("status");

// ================= TAB SWITCH =================
document.querySelectorAll(".tab").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".tab").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        currentTab = btn.dataset.tab;

        if (currentTab === "favorites") {
            loadFavorites();
        } else {
            loadTrending();
        }
    });
});

// ================= SEARCH =================
document.getElementById("searchBtn").addEventListener("click", search);
window.onload = loadTrending;


// ================= TRENDING =================
async function loadTrending() {
    results.innerHTML = "";
    status.innerText = "Loading...";

    try {
        if (currentTab === "movies") {
            let keywords = ["avengers", "batman", "spiderman"];

            for (let word of keywords) {
                let res = await fetch(`https://www.omdbapi.com/?s=${word}&apikey=3355abf3`);
                let data = await res.json();

                if (data.Search) {
                    for (let movie of data.Search.slice(0, 3)) {
                        let card = await createMovieCard(movie);
                        results.appendChild(card);
                    }
                }
            }
        }

        if (currentTab === "music") {
            let res = await fetch(`https://itunes.apple.com/search?term=top&limit=10`);
            let data = await res.json();

            data.results.forEach(song => {
                results.appendChild(createMusicCard(song));
            });
        }

        status.innerText = "";

    } catch {
        status.innerText = "Error loading data";
    }
}


// ================= SEARCH =================
async function search() {
    let query = document.getElementById("searchInput").value.trim();

    if (!query) {
        loadTrending();
        return;
    }

    results.innerHTML = "";
    status.innerText = "Searching...";

    try {
        if (currentTab === "movies") {
            let res = await fetch(`https://www.omdbapi.com/?s=${query}&apikey=3355abf3`);
            let data = await res.json();

            if (!data.Search) {
                status.innerText = "No results";
                return;
            }

            for (let movie of data.Search) {
                let card = await createMovieCard(movie);
                results.appendChild(card);
            }
        }

        if (currentTab === "music") {
            let res = await fetch(`https://itunes.apple.com/search?term=${query}&limit=10`);
            let data = await res.json();

            data.results.forEach(song => {
                results.appendChild(createMusicCard(song));
            });
        }

        status.innerText = "";

    } catch {
        status.innerText = "Error fetching data";
    }
}


// ================= MOVIE CARD =================
async function createMovieCard(movie) {
    let res = await fetch(`https://www.omdbapi.com/?i=${movie.imdbID}&apikey=3355abf3`);
    let data = await res.json();

    let card = document.createElement("div");
    card.className = "card";

    let isSaved = favorites.some(f => f.id === movie.imdbID);

    card.innerHTML = `
        <span class="rating">⭐ ${data.imdbRating || "—"}</span>
        <img src="${movie.Poster !== "N/A" ? movie.Poster : "https://via.placeholder.com/300"}">
        <div class="card-info">
            <p>${movie.Title}</p>
            <small>${movie.Year}</small>
        </div>
        <button>${isSaved ? "❤️ Saved" : "🤍 Save"}</button>
    `;

    // CLICK DETAILS
    card.querySelector("img").addEventListener("click", () => {
        showDetails(movie.imdbID);
    });

    // SAVE BUTTON
    card.querySelector("button").addEventListener("click", (e) => {
        e.stopPropagation();
        toggleFavorite(movie.imdbID, movie.Title, movie.Poster);
        loadTrending(); // refresh UI
    });

    return card;
}


// ================= MUSIC CARD =================
function createMusicCard(song) {
    let card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
        <img src="${song.artworkUrl100}">
        <div class="card-info">
            <p>${song.trackName}</p>
            <small>${song.artistName}</small>
        </div>
        <audio controls src="${song.previewUrl}"></audio>
    `;

    return card;
}


// ================= FAVORITES =================
function toggleFavorite(id, title, poster) {
    let index = favorites.findIndex(f => f.id === id);

    if (index > -1) {
        favorites.splice(index, 1);
    } else {
        favorites.push({ id, title, poster });
    }

    localStorage.setItem("favorites", JSON.stringify(favorites));
}


function loadFavorites() {
    results.innerHTML = "";

    if (!favorites.length) {
        status.innerText = "No favorites yet";
        return;
    }

    status.innerText = "";

    favorites.forEach(item => {
        let card = document.createElement("div");
        card.className = "card";

        card.innerHTML = `
            <img src="${item.poster}">
            <div class="card-info">
                <p>${item.title}</p>
            </div>
            <button>❌ Remove</button>
        `;

        card.querySelector("button").addEventListener("click", () => {
            toggleFavorite(item.id);
            loadFavorites();
        });

        results.appendChild(card);
    });
}


// ================= DETAILS =================
async function showDetails(id) {
    let res = await fetch(`https://www.omdbapi.com/?i=${id}&apikey=3355abf3`);
    let data = await res.json();

    let modal = document.createElement("div");
    modal.className = "modal";

    modal.innerHTML = `
        <div class="modal-content">
            <img src="${data.Poster}">
            <h2>${data.Title}</h2>
            <p><b>Year:</b> ${data.Year}</p>
            <p><b>Rating:</b> ⭐ ${data.imdbRating}</p>
            <p>${data.Plot}</p>
            <button>Close</button>
        </div>
    `;

    modal.addEventListener("click", () => modal.remove());
    modal.querySelector("button").addEventListener("click", () => modal.remove());

    document.body.appendChild(modal);
}


// ================= SLIDER =================
let slides = document.querySelectorAll(".slide");
let index = 0;

function showSlide(i) {
    slides.forEach(s => s.classList.remove("active"));
    slides[i].classList.add("active");
}

function nextSlide() {
    index = (index + 1) % slides.length;
    showSlide(index);
}

function prevSlide() {
    index = (index - 1 + slides.length) % slides.length;
    showSlide(index);
}

document.querySelector(".next").onclick = nextSlide;
document.querySelector(".prev").onclick = prevSlide;

setInterval(nextSlide, 4000);
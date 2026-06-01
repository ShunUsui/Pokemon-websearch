let timeout = null;
let currentRequestId = 0;

const searchBar = document.getElementById("searchBar");
const moveSearchBar = document.getElementById("moveSearchBar"); 
const abilitySearchBar = document.getElementById("abilitySearchBar");
const gameSelect = document.getElementById("gameSelect");
const grid = document.getElementById("grid");

if (gameSelect) {
    gameSelect.addEventListener("change", triggerSearch);
}


const sliders = [
    "hp",
    "attack",
    "defense",
    "sattack",
    "sdefense",
    "speed",
    "weight",
    "height"
];



function triggerSearch() {
    clearTimeout(timeout);
    timeout = setTimeout(fetchData, 200);
}

/* ---------------- SLIDERS ---------------- */
sliders.forEach(id => {
    const slider = document.getElementById(id);
    const label = document.getElementById(`${id}-val`);

    if (!slider || !label) return;

    slider.addEventListener("input", () => {
        label.textContent = slider.value;
        triggerSearch();
    });
});

/* ---------------- INPUTS ---------------- */
searchBar.addEventListener("input", triggerSearch);

if (moveSearchBar) {
    moveSearchBar.addEventListener("input", triggerSearch);
}

if (abilitySearchBar) {
    abilitySearchBar.addEventListener("input", triggerSearch);
}

document.querySelectorAll(
    'input[type="checkbox"], input[name="mode"]'
).forEach(el => {
    el.addEventListener("change", triggerSearch);
});

/* ---------------- FILTERS ---------------- */
function getFilters() {

    const pokemonName = searchBar.value.trim().toLowerCase();
    const move = moveSearchBar?.value.trim().toLowerCase() || "";
    const ability = abilitySearchBar?.value.trim().toLowerCase() || "";
    const game = gameSelect?.value || "";

    const checkedGens = Array.from(document.querySelectorAll(".gen-checkbox:checked"))
        .map(cb => cb.value);
    const gens = checkedGens.join(",");

    const checkedTypes = Array.from(document.querySelectorAll(".type-checkbox:checked"))
        .map(cb => cb.value);
    const types = checkedTypes.join(",");

    const checkedSpecial = Array.from(document.querySelectorAll('input[name="pokemon-category"]:checked'))
        .map(cb => cb.value);
    const special = checkedSpecial.join(",");

    const mode = document.querySelector('input[name="mode"]:checked')?.value || "any";

    const stats = Object.fromEntries(
        sliders.map(id => [id, document.getElementById(id)?.value || "0"])
    );

    return {
        pokemonName,
        move,
        ability,
        gens,
        types,
        special,
        mode,
        game,
        ...stats
    };
}

/* ---------------- API ---------------- */
function check_stat(stat, stat_name, params) {
    if (stat && stat !== "0") {
        params.append(stat_name, stat);
    }
}

async function fetchData() {
    const requestId = ++currentRequestId;

    const filters = getFilters();

    const {
        pokemonName,
        move,
        ability,
        gens,
        types,
        special,
        mode,
        game,
        ...stats
    } = filters;

    const params = new URLSearchParams({
        q: pokemonName,
        move,
        ability,
        gens,
        types,
        mode,
        special,
        game
    });

    sliders.forEach(stat => {
        check_stat(stats[stat], stat, params);
    });

    try {
        grid.innerHTML = "";

        const response = await fetch(
            `/api/pokemon?${params}`
        );

        if (!response.ok) throw new Error("Pokémon not found");

        const data = await response.json();

        if (requestId !== currentRequestId) return;

        data.forEach(pokemon => {
            const div = document.createElement("div");
            div.className = "card";

            const img = document.createElement("img");
            img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`;
            img.style.display = "block";

            const h4 = document.createElement("h4");
            h4.textContent = pokemon.name;

            const typeDiv = document.createElement("div");
            typeDiv.className = "type";
            typeDiv.textContent = Array.isArray(pokemon.types)
                ? pokemon.types.join(", ")
                : pokemon.types;

            div.appendChild(img);
            div.appendChild(h4);
            div.appendChild(typeDiv);

            grid.appendChild(div);
        });

        grid.style.display = "grid";

    } catch (error) {
        console.error(error);
    }
} 

window.addEventListener("DOMContentLoaded", () => {
    fetchData();
});
let timeout = null;

const searchBar = document.getElementById("pokemonName");

searchBar.addEventListener("input", (e) => {
    clearTimeout(timeout);
    let inp = e.target.value

    timeout = setTimeout(() => {
        console.log("Searching for:", inp);
    }, 300);

    fetchData()
});



async function fetchData() {
    const searchBar = document.getElementById("pokemonName");
    const pokemonName = searchBar.value.trim().toLowerCase();
    const imgElement = document.getElementById("pokemonSprite");
    const status = document.getElementById("status");

    imgElement.style.display = "none"; 
    status.textContent = "Loading...";

    try {
        const response = await fetch(`http://127.0.0.1:5000/api/search?q=${pokemonName}`);
        if (!response.ok) throw new Error("Pokémon not found");

        const data = await response.json();
        const pokemonId = data[0].id;
        console.log(data);

        imgElement.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`;
        imgElement.style.display = "block";
        status.textContent = ""; 
    } catch (error) {
        console.error(error);
        status.textContent = "Error: Pokémon not found!";
    }
}




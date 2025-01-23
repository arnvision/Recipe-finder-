const API_KEY = '204e1818801c4c52a540d9087e4c163a'; // Your Spoonacular API key
const BASE_URL = 'https://api.spoonacular.com/recipes/findByIngredients';

// Fetch recipes based on ingredient
async function fetchRecipes(ingredient) {
  const url = `${BASE_URL}?ingredients=${ingredient}&number=9&apiKey=${API_KEY}`;
  const response = await fetch(url);
  const data = await response.json();
  return data;
}

// Fetch detailed recipe information
async function fetchRecipeDetails(recipeId) {
  const url = `https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${API_KEY}`;
  const response = await fetch(url);
  const data = await response.json();
  return data;
}

// Display recipes on the page
function displayRecipes(recipes) {
  const recipeResults = document.getElementById('recipeResults');
  recipeResults.innerHTML = recipes.map(recipe => `
    <div class="recipe-card" data-id="${recipe.id}">
      <img src="${recipe.image}" alt="${recipe.title}">
      <h3>${recipe.title}</h3>
      <p>Missing ingredients: ${recipe.missedIngredientCount}</p>
      <button class="view-details-btn">View Details</button>
      <button class="save-btn">Save</button>
    </div>
  `).join('');
}

// Function to display recipe details in a modal
function showRecipeDetails(details) {
  // Create backdrop
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.onclick = closeModal; // Close modal when backdrop is clicked

  // Create modal
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <h2>${details.title}</h2>
    <img src="${details.image}" alt="${details.title}">
    <h3>Ingredients:</h3>
    <ul>
      ${details.extendedIngredients.map(ing => `<li>${ing.original}</li>`).join('')}
    </ul>
    <h3>Instructions:</h3>
    <p>${details.instructions || 'No instructions available.'}</p>
    <button onclick="closeModal()">Close</button>
  `;

  // Append backdrop and modal to the body
  document.body.appendChild(backdrop);
  document.body.appendChild(modal);

  // Prevent scrolling on the background page
  document.body.style.overflow = 'hidden';
}

// Function to close the modal
function closeModal() {
  const backdrop = document.querySelector('.modal-backdrop');
  const modal = document.querySelector('.modal');

  if (backdrop) backdrop.remove();
  if (modal) modal.remove();

  // Restore scrolling on the background page
  document.body.style.overflow = 'auto';
}

// Save recipe to favorites
function saveRecipe(recipe) {
  const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  if (!favorites.some(fav => fav.id === recipe.id)) {
    favorites.push(recipe);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    alert('Recipe saved to favorites!');
    displayFavorites();
  } else {
    alert('Recipe is already in favorites!');
  }
}

// Display favorite recipes
function displayFavorites() {
  const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  const favoriteRecipes = document.getElementById('favoriteRecipes');
  favoriteRecipes.innerHTML = favorites.map(recipe => `
    <div class="recipe-card" data-id="${recipe.id}">
      <img src="${recipe.image}" alt="${recipe.title}">
      <h3>${recipe.title}</h3>
      <p>Missing ingredients: ${recipe.missedIngredientCount}</p>
      <button class="view-details-btn">View Details</button>
    </div>
  `).join('');
}

// Handle form submission
document.getElementById('searchForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const ingredient = document.getElementById('ingredient').value;
  const recipes = await fetchRecipes(ingredient);
  displayRecipes(recipes);
});

// Add click events to buttons
document.addEventListener('click', async (e) => {
  if (e.target.classList.contains('view-details-btn')) {
    const recipeCard = e.target.closest('.recipe-card');
    const recipeId = recipeCard.dataset.id;
    const details = await fetchRecipeDetails(recipeId);
    showRecipeDetails(details);
  }

  if (e.target.classList.contains('save-btn')) {
    const recipeCard = e.target.closest('.recipe-card');
    const recipe = {
      id: recipeCard.dataset.id,
      title: recipeCard.querySelector('h3').innerText,
      image: recipeCard.querySelector('img').src,
      missedIngredientCount: recipeCard.querySelector('p').innerText.replace('Missing ingredients: ', ''),
    };
    saveRecipe(recipe);
  }
});

// Load favorites on page load
displayFavorites();
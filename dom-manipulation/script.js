// === Step 1: Manage Quotes Array ===
const quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "Don’t let yesterday take up too much of today.", category: "Inspiration" },
];

// === Step 2: Reference DOM Elements ===
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteButton = document.getElementById("newQuote");

// === Step 3: Function to Display a Random Quote ===
function showRandomQuote() {
  if (quotes.length === 0) {
    quoteDisplay.innerHTML = `<p>No quotes available. Please add one!</p>`;
    return;
  }

  const randomIndex = Math.floor(Math.random() * quotes.length);
  const { text, category } = quotes[randomIndex];

  // Use innerHTML to dynamically inject formatted quote text
  quoteDisplay.innerHTML = `
    <blockquote>"${text}"</blockquote>
    <p><em>— ${category}</em></p>
  `;
}

// === Step 4: Function to Dynamically Create Add-Quote Form ===
function createAddQuoteForm() {
  const formContainer = document.createElement("div");

  // Using innerHTML for structured form creation
  formContainer.innerHTML = `
    <input id="newQuoteText" type="text" placeholder="Enter a new quote" />
    <input id="newQuoteCategory" type="text" placeholder="Enter quote category" />
    <button id="addQuoteButton">Add Quote</button>
  `;

  // Append form container dynamically
  document.body.appendChild(formContainer);

  // Add event listener AFTER injecting the button dynamically
  document.getElementById("addQuoteButton").addEventListener("click", addQuote);
}

// === Step 5: Function to Add a New Quote Dynamically ===
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  const newText = textInput.value.trim();
  const newCategory = categoryInput.value.trim();

  if (!newText || !newCategory) {
    alert("Please enter both a quote and its category.");
    return;
  }

  quotes.push({ text: newText, category: newCategory });
  textInput.value = "";
  categoryInput.value = "";

  // Use innerHTML to confirm addition dynamically
  quoteDisplay.innerHTML = `
    <p style="color: green;">New quote added successfully!</p>
  `;
}

// === Step 6: Event Listeners ===
newQuoteButton.addEventListener("click", showRandomQuote);

// === Step 7: Initialize App ===
createAddQuoteForm();
showRandomQuote();

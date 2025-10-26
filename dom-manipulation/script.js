// === Step 1: Manage Quotes Array ===
const quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "Don’t let yesterday take up too much of today.", category: "Inspiration" },
];

// ---------- ADD: Web Storage keys & helpers ----------
const LS_KEY = "dynamic_quote_generator_quotes_v1";
const SESSION_KEY_LAST = "dynamic_quote_generator_lastViewed";
const FILTER_KEY = "dynamic_quote_generator_selected_category"; 

// NEW global tracker for selected category
let selectedCategory = localStorage.getItem(FILTER_KEY) || "";

function saveQuotesToLocalStorage() {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(quotes));
  } catch (err) {
    console.error("Failed to save quotes to localStorage:", err);
  }
}

function loadQuotesFromLocalStorage() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      quotes.length = 0;
      parsed.forEach(q => quotes.push(q));
    }
  } catch (err) {
    console.error("Failed to load quotes from localStorage:", err);
  }
}
// ------------------------------------------------------


// === Step 2: Reference DOM Elements ===
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteButton = document.getElementById("newQuote");

// === Step 3: Function to Display a Random Quote ===
function showRandomQuote() {
  if (quotes.length === 0) {
    quoteDisplay.textContent = "No quotes available. Please add one!";
    return;
  }

  // Filter by selectedCategory if applicable
  const filteredQuotes = selectedCategory
    ? quotes.filter(q => q.category === selectedCategory)
    : quotes;

  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = `No quotes found for category: ${selectedCategory}`;
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const { text, category } = filteredQuotes[randomIndex];

  quoteDisplay.textContent = `"${text}" — ${category}`;

  try {
    sessionStorage.setItem(SESSION_KEY_LAST, JSON.stringify({ index: randomIndex, quote: filteredQuotes[randomIndex] }));
  } catch (e) {}
}

// === Step 4: Function to Dynamically Create Add-Quote Form ===
function createAddQuoteForm() {
  const formContainer = document.createElement("div");

  const textInput = document.createElement("input");
  textInput.id = "newQuoteText";
  textInput.type = "text";
  textInput.placeholder = "Enter a new quote";

  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.type = "text";
  categoryInput.placeholder = "Enter quote category";

  const addButton = document.createElement("button");
  addButton.id = "addQuoteButton";
  addButton.textContent = "Add Quote";

  formContainer.appendChild(textInput);
  formContainer.appendChild(categoryInput);
  formContainer.appendChild(addButton);

  document.body.appendChild(formContainer);

  addButton.addEventListener("click", addQuote);
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

  saveQuotesToLocalStorage();
  textInput.value = "";
  categoryInput.value = "";

  populateCategories();
  quoteDisplay.textContent = "New quote added successfully!";
}

// === Step 6: Event Listeners ===
newQuoteButton.addEventListener("click", showRandomQuote);


// ---------- ADD: JSON export/import ----------
function exportToJsonFile() {
  try {
    const dataStr = JSON.stringify(quotes, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "quotes.json";
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      URL.revokeObjectURL(url);
      a.remove();
    }, 100);
  } catch (err) {
    console.error("Export failed:", err);
    alert("Failed to export quotes.");
  }
}

function importFromJsonFile(event) {
  const file = event.target ? event.target.files[0] : event;
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const parsed = JSON.parse(e.target.result);
      let imported = [];
      if (Array.isArray(parsed)) imported = parsed;
      else if (parsed && Array.isArray(parsed.quotes)) imported = parsed.quotes;
      else throw new Error("Invalid JSON structure.");

      const validItems = imported.filter(item => item && typeof item.text === "string" && typeof item.category === "string");
      if (validItems.length === 0) {
        alert("No valid quotes found in file.");
        return;
      }

      quotes.push(...validItems);
      saveQuotesToLocalStorage();
      populateCategories();
      alert(`Imported ${validItems.length} quotes successfully!`);
    } catch (err) {
      console.error("Import failed:", err);
      alert("Failed to import JSON file.");
    }
  };
  reader.readAsText(file);
}
// --------------------------------------------------------


// ---------- ADD: CATEGORY FILTERING SYSTEM ----------
function populateCategories() {
  let dropdown = document.getElementById("categoryFilter");

  if (!dropdown) {
    dropdown = document.createElement("select");
    dropdown.id = "categoryFilter";
    document.body.insertBefore(dropdown, quoteDisplay);
    dropdown.addEventListener("change", filterQuotes);
  }

  const categories = [...new Set(quotes.map(q => q.category))];

  dropdown.innerHTML = `<option value="">All Categories</option>` +
    categories.map(cat => `<option value="${cat}" ${cat === selectedCategory ? "selected" : ""}>${cat}</option>`).join("");
}

function filterQuotes() {
  const dropdown = document.getElementById("categoryFilter");
  selectedCategory = dropdown.value; // ✅ track category
  localStorage.setItem(FILTER_KEY, selectedCategory);

  showRandomQuote(); // ✅ update quote display immediately
}
// --------------------------------------------------------


// === Step 7: Initialize App ===
loadQuotesFromLocalStorage();
createAddQuoteForm();
populateCategories();
showRandomQuote();

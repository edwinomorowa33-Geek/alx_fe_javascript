// === Step 1: Manage Quotes Array ===
const quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "Don’t let yesterday take up too much of today.", category: "Inspiration" },
];

// === Step 2: Local Storage Keys ===
const LS_KEY = "dynamic_quote_generator_quotes_v1";
const FILTER_KEY = "dynamic_quote_generator_selected_category";
let selectedCategory = localStorage.getItem(FILTER_KEY) || "";

// === Step 3: Storage Functions ===
function saveQuotesToLocalStorage() {
  localStorage.setItem(LS_KEY, JSON.stringify(quotes));
}

function loadQuotesFromLocalStorage() {
  const raw = localStorage.getItem(LS_KEY);
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      quotes.length = 0;
      parsed.forEach(q => quotes.push(q));
    }
  } catch (err) {
    console.error("Failed to load from localStorage:", err);
  }
}

// === Step 4: DOM Elements ===
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteButton = document.getElementById("newQuote");

// === Step 5: Display Random Quote ===
function showRandomQuote() {
  const filtered = selectedCategory
    ? quotes.filter(q => q.category === selectedCategory)
    : quotes;

  if (filtered.length === 0) {
    quoteDisplay.textContent = "No quotes available.";
    return;
  }

  const random = filtered[Math.floor(Math.random() * filtered.length)];
  quoteDisplay.textContent = `"${random.text}" — ${random.category}`;
}

// === Step 6: Add New Quote ===
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (!text || !category) {
    alert("Please enter both quote and category.");
    return;
  }

  quotes.push({ text, category });
  saveQuotesToLocalStorage();
  populateCategories();
  showRandomQuote();
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  syncQuotes(); // Trigger sync after new quote added
}

// === Step 7: Category Filter ===
function populateCategories() {
  let dropdown = document.getElementById("categoryFilter");
  if (!dropdown) {
    dropdown = document.createElement("select");
    dropdown.id = "categoryFilter";
    document.body.insertBefore(dropdown, quoteDisplay);
    dropdown.addEventListener("change", filterQuotes);
  }

  const categories = [...new Set(quotes.map(q => q.category))];
  dropdown.innerHTML =
    `<option value="">All Categories</option>` +
    categories
      .map(cat => `<option value="${cat}" ${cat === selectedCategory ? "selected" : ""}>${cat}</option>`)
      .join("");
}

function filterQuotes() {
  selectedCategory = document.getElementById("categoryFilter").value;
  localStorage.setItem(FILTER_KEY, selectedCategory);
  showRandomQuote();
}

// === Step 8: JSON Export / Import ===
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "quotes.json";
  a.click();
}

function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = e => {
    try {
      const parsed = JSON.parse(e.target.result);
      const imported = Array.isArray(parsed) ? parsed : parsed.quotes || [];
      const valid = imported.filter(q => q.text && q.category);

      if (valid.length) {
        quotes.push(...valid);
        saveQuotesToLocalStorage();
        populateCategories();
        alert(`Imported ${valid.length} quotes successfully!`);
        syncQuotes();
      } else {
        alert("No valid quotes found in file.");
      }
    } catch {
      alert("Invalid JSON file.");
    }
  };
  reader.readAsText(file);
}

// === Step 9: Sync System ===
const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";

// Banner for sync status
const syncBanner = document.createElement("div");
syncBanner.style.cssText = "background:#222;color:#fff;padding:6px;text-align:center;display:none;";
document.body.prepend(syncBanner);

function showSyncMessage(msg, color = "lightgreen") {
  syncBanner.textContent = msg;
  syncBanner.style.background = color;
  syncBanner.style.display = "block";
  setTimeout(() => (syncBanner.style.display = "none"), 3000);
}

// ✅ Centralized Sync Function
async function syncQuotes() {
  try {
    // --- Step 1: Fetch server quotes ---
    const getResponse = await fetch(SERVER_URL);
    const serverData = await getResponse.json();

    const serverQuotes = serverData.slice(0, 3).map(item => ({
      text: item.title,
      category: "Server",
    }));

    // --- Step 2: Push local quotes to server ---
    const postResponse = await fetch(SERVER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quotes }),
    });

    if (!postResponse.ok) throw new Error(`POST failed: ${postResponse.status}`);

    // --- Step 3: Resolve conflicts (server wins) ---
    const serverTexts = new Set(serverQuotes.map(q => q.text));
    const combined = [...serverQuotes];
    quotes.forEach(q => {
      if (!serverTexts.has(q.text)) combined.push(q);
    });

    quotes.length = 0;
    combined.forEach(q => quotes.push(q));
    saveQuotesToLocalStorage();
    populateCategories();

    showSyncMessage("✅ Synced with server successfully");
  } catch (err) {
    console.error("Sync failed:", err);
    showSyncMessage("⚠️ Sync failed", "red");
  }
}

// === Step 10: Initialize App ===
loadQuotesFromLocalStorage();
populateCategories();
showRandomQuote();
newQuoteButton.addEventListener("click", showRandomQuote);
syncQuotes();
setInterval(syncQuotes, 30000);

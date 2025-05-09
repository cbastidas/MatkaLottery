const apiKey = "89786753132432";
const endpoint = `https://developer360.in/api/matka-result-api/maharashtra/${apiKey}`;
let allData = null;
let nextRefreshTime = new Date(Date.now() + 8 * 60 * 60 * 1000);

async function fetchMatkaResults() {
  try {
    const response = await fetch(endpoint);
    const json = await response.json();

    if (json.error) throw new Error(json.message || "API error");

    allData = {
      today: json.today_results,
      old: json.old_results
    };

    const selectedDate = document.getElementById("datePicker").value;
    showResultsByDate(selectedDate);
  } catch (error) {
    document.getElementById("matka-result").innerHTML = `<p style="color:red;">Failed to load results.</p>`;
  }
}

function showResultsByDate(dateStr) {
  const resultsToday = allData.today || [];
  const resultsOld = allData.old || [];
  const allResults = [...resultsToday, ...resultsOld];

  const filtered = allResults.filter(result => result.aankdo_date === dateStr);
  const container = document.getElementById("matka-result");
  container.innerHTML = "";

  if (filtered.length === 0) {
    container.innerHTML = `<p style="color:red;">No results for this date.</p>`;
    return;
  }

  filtered.forEach((market) => {
    const card = document.createElement("div");
    card.className = "market-card";
    card.innerHTML = `
      <h3>${market.market_name}</h3>
      <p><strong>Date:</strong> ${market.aankdo_date}</p>
      ${market.open_time_formatted ? `<p><strong>Open:</strong> ${market.open_time_formatted}</p>` : ""}
      ${market.close_time_formatted ? `<p><strong>Close:</strong> ${market.close_time_formatted}</p>` : ""}
      <p><strong>Aankdo Open:</strong> ${market.aankdo_open}</p>
      <p><strong>Aankdo Close:</strong> ${market.aankdo_close || '-'}</p>
      <p><strong>Figure Open:</strong> ${market.figure_open}</p>
      <p><strong>Figure Close:</strong> ${market.figure_close}</p>
      <p><strong>Jodi:</strong> ${market.jodi}</p>
    `;
    container.appendChild(card);
  });
}

function updateCountdownToRefresh() {
  const now = new Date();
  const diffMs = nextRefreshTime - now;

  if (diffMs <= 0) {
    document.getElementById("refresh-timer").textContent = "Refreshing now...";
    return;
  }

  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  document.getElementById("refresh-timer").textContent =
    `Time remaining to refresh: ${hours}h ${minutes.toString().padStart(2, '0')}m`;
}

document.addEventListener("DOMContentLoaded", () => {
  const todayStr = new Date().toISOString().split("T")[0];
  document.getElementById("datePicker").value = todayStr;
  fetchMatkaResults();

  setInterval(() => {
    const now = new Date();
    const hour = now.getHours();
    if (hour >= 8 && hour <= 23) {
      fetchMatkaResults();
      nextRefreshTime = new Date(Date.now() + 8 * 60 * 60 * 1000);
    }
  }, 8 * 60 * 60 * 1000);

  setInterval(updateCountdownToRefresh, 60 * 1000);
  updateCountdownToRefresh();

  document.getElementById("datePicker").addEventListener("change", (e) => {
    showResultsByDate(e.target.value);
  });
});

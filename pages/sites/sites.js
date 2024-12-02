import { sanitizeStringWithTableRows, makeOptions } from "../../utils.js";
import { API_URL, TEST_TOKEN } from "../../settings.js";
const API_ENDPOINT = `${API_URL}/sites`;

export async function initSites() {
  try {
    const response = await fetch(
      API_ENDPOINT,
      makeOptions("GET", null, true, TEST_TOKEN)
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Unknown error occurred");
    }

    const sites = await response.json();
    renderSites(sites);

    document.getElementById("searchBar").addEventListener("input", (e) => {
      const searchTerm = e.target.value.toLowerCase();
      const filteredSites = sites.filter(
        (site) =>
          site.displayName.toLowerCase().includes(searchTerm) ||
          site.webUrl.toLowerCase().includes(searchTerm)
      );
      renderSites(filteredSites);
    });
  } catch (error) {
    console.error("Error fetching sites:", error.message);
    document.getElementById("error").textContent = error.message;
  }
}

function renderSites(sites) {
  const tableRows = sites.map(
    (site) => `
      <tr>
      <td><a href="#/drives/${site.id}" class="edit-button">${site.displayName}</a></td>
      <td><a href="#/drives/${site.id}" class="edit-button">${site.webUrl}</a></td>
      <td><a href="#/drives/${site.id}" class="edit-button">Edit</a></td>
      </tr>
    `
  );
  const tableRowsAsStr = tableRows.join("");
  document.getElementById("table-rows").innerHTML =
    sanitizeStringWithTableRows(tableRowsAsStr);
}

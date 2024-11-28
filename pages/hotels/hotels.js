import { sanitizeStringWithTableRows } from "../../utils.js";
import { API_URL } from "../../settings.js";
const API_ENDPOINT = `${API_URL}/sites`;

export async function initSites() {
  const sites = await fetch(API_ENDPOINT).then((res) => res.json());
  renderSites(sites);

  document.getElementById("searchBar").addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredSites = sites.filter(
      (site) =>
        site.name.toLowerCase().includes(searchTerm) ||
        site.id.toString().includes(searchTerm)
    );
    renderSites(filteredSites);
  });
}

function renderSites(sites) {
  const tableRows = sites.map(
    (site) => `
      <tr>
      <td>${site.displayName}</td>
      <td>${site.webUrl}</td>
      <td><a href="#/site/${site.id}" class="edit-button">Edit</a></td>
      </tr>
    `
  );
  const tableRowsAsStr = tableRows.join("");
  document.getElementById("table-rows").innerHTML =
    sanitizeStringWithTableRows(tableRowsAsStr);
}

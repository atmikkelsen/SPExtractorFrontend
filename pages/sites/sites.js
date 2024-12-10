import { setupSearchBar, renderTableRows, handleFetch, makeOptions } from "../../utils/utils.js";
import { showSpinner, hideSpinner } from "../../utils/spinner.js";
import { API_URL } from "../../server/settings.js";

const API_ENDPOINT = `${API_URL}/sites`;

export async function fetchSite(siteId) {
  return handleFetch(`${API_ENDPOINT}/${siteId}`, makeOptions("GET", null, true));
}

function siteRowTemplate(site) {
  return `
    <tr>
      <td><a href="#/drives/${site.id}" class="edit-button">${site.displayName}</a></td>
      <td><a href="#/drives/${site.id}" class="edit-button">${site.webUrl}</a></td>
      <td><a href="#/drives/${site.id}" class="edit-button">Edit</a></td>
    </tr>
  `;
}

export async function initSites() {
  showSpinner();
  try {
    const sites = await handleFetch(API_ENDPOINT, makeOptions("GET", null, true));

    renderTableRows(sites, siteRowTemplate);

    setupSearchBar(
      "searchBar",
      sites,
      (term) => (site) =>
        site.displayName.toLowerCase().includes(term) ||
        site.webUrl.toLowerCase().includes(term),
      (filteredSites) => renderTableRows(filteredSites, siteRowTemplate)
    );
  } catch (error) {
    console.error("Error fetching sites:", error.message);
    document.getElementById("error").textContent = error.message;
  } finally {
    hideSpinner();
  }
}

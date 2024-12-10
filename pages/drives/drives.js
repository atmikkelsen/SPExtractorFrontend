import { setupSearchBar, renderTableRows, handleFetch, makeOptions, updateTab, formatDate } from "../../utils/utils.js";
import { showSpinner, hideSpinner } from "../../utils/spinner.js";
import { API_URL } from "../../server/settings.js";

const API_ENDPOINT = `${API_URL}/drives`;

export async function fetchDrive(driveId) {
  return handleFetch(`${API_ENDPOINT}/${driveId}`, makeOptions("GET", null, true));
}

// Row template function for drives
function driveRowTemplate(drive) {
  const formattedDate = formatDate(drive.lastModifiedDateTime);
  return `
    <tr>
      <td><a href="#/files/${drive.id}" class="edit-button">${drive.name}</a></td>
      <td><a href="#/files/${drive.id}" class="edit-button">${drive.webUrl}</a></td>
      <td>${formattedDate}</td>
      <td><a href="#/files/${drive.id}" class="edit-button">Edit</a></td>
    </tr>
  `;
}

export async function initDrives(siteId) {
  showSpinner();
  try {
    const site = await handleFetch(`${API_URL}/sites/${siteId}`, makeOptions("GET", null, true));
    updateTab("current-site-tab", site.displayName, `/drives/${siteId}`);

    const drives = await handleFetch(`${API_ENDPOINT}?siteId=${siteId}`, makeOptions("GET", null, true));
    renderTableRows(drives, driveRowTemplate);

    setupSearchBar(
      "searchBar",
      drives,
      (term) => (drive) =>
        drive.name.toLowerCase().includes(term) || drive.webUrl.toLowerCase().includes(term),
      (filteredDrives) => renderTableRows(filteredDrives, driveRowTemplate)
    );
  } catch (error) {
    console.error("Error fetching drives:", error.message);
    document.getElementById("error").textContent = error.message;
  } finally {
    hideSpinner();
  }
}
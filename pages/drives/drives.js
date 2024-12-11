import {
  setupSearchBar,
  renderTableRows,
  handleFetch,
  makeOptions,
  updateTab,
  formatDate,
} from "../../utils/utils.js";
import { showSpinner, hideSpinner } from "../../utils/spinner.js";
import { API_URL } from "../../server/settings.js";

const API_ENDPOINT = `${API_URL}/drives`;

export async function fetchDrive(driveId) {
  return handleFetch(
    `${API_ENDPOINT}/${driveId}`,
    makeOptions("GET", null, true)
  );
}

function driveRowTemplate(drive) {
  const formattedDate = formatDate(drive.lastModifiedDateTime);

  return `
    <tr>
      <td><a href="#/files/${drive.id}" class="edit-button"</a>${drive.name}</td>
      <td><a href="${drive.webUrl}" class="edit-button" target="_blank">${drive.webUrl} </a></td>
      <td>${formattedDate}</td>
      <td>
        <a href="#/files/${drive.id}" class="file-count-link" data-drive-id="${drive.id}">
          <span id="file-count-${drive.id}">Loading...</span>
        </a>
      </td>
    </tr>
  `;
}

export async function initDrives(siteId) {
  showSpinner();
  try {
    const site = await handleFetch(
      `${API_URL}/sites/${siteId}`,
      makeOptions("GET", null, true)
    );
    updateTab("current-site-tab", site.displayName, `/drives/${siteId}`);

    const drives = await handleFetch(
      `${API_ENDPOINT}?siteId=${siteId}`,
      makeOptions("GET", null, true)
    );
    renderTableRows(drives, driveRowTemplate);

    // Fetch file count for each drive
    drives.forEach((drive) => fetchFileCount(drive.id));

    setupSearchBar(
      "searchBar",
      drives,
      (term) => (drive) =>
        drive.name.toLowerCase().includes(term) ||
        drive.webUrl.toLowerCase().includes(term),
      (filteredDrives) => renderTableRows(filteredDrives, driveRowTemplate)
    );
  } catch (error) {
    console.error("Error fetching drives:", error.message);
    displayError(error.message || "Failed to load drives.");
  } finally {
    hideSpinner();
  }
}

async function fetchFileCount(driveId) {
  const fileCountCell = document.getElementById(`file-count-${driveId}`);
  fileCountCell.textContent = "Loading..."; // Show a loading state

  try {
    const files = await handleFetch(
      `${API_URL}/files?driveId=${driveId}`,
      makeOptions("GET", null, true)
    );
    fileCountCell.textContent = files.length; // Display file count
  } catch (error) {
    console.error("Error fetching drives count:", error.message);
    fileCountCell.textContent = "Error";
  }
}

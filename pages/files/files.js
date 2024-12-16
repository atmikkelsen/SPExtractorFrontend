import { setupSearchBar, renderTableRows, handleFetch, makeOptions, formatDate, updateTab } from "../../utils/utils.js";
import { showSpinner, hideSpinner } from "../../utils/spinner.js";
import { API_URL } from "../../server/settings.js";
import { fetchDrive } from "../drives/drives.js";

const API_ENDPOINT = `${API_URL}/files`;

function fileRowTemplate(file) {
  const MAX_URL_LENGTH = 100;
  const formattedDate = formatDate(file.lastModifiedDateTime);
  const fileSize = file.size ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : "N/A";
  const truncatedUrl =
    file.webUrl.length > MAX_URL_LENGTH
      ? `${file.webUrl.substring(0, MAX_URL_LENGTH)}...`
      : file.webUrl;

  return `
    <tr>
      <td>${file.name}</td>
      <td><a href="${file.webUrl}" target="_blank">${truncatedUrl}</a></td>
      <td>${fileSize}</td>
      <td>${formattedDate}</td>
      <td>${file.lastModifiedByDisplayName || "Unknown"}</td>
    </tr>
  `;
}
export async function initFiles(driveId) {
  showSpinner();
  try {
    // Fetch the drive details
    const drive = await handleFetch(`${API_URL}/drives/${driveId}`, makeOptions("GET", null, true));

    // Update the navbar tabs using siteName and driveName
    const siteName = drive.siteName || "Unknown Site"; // Fallback if siteName is null
    const driveName = drive.name || "Unknown Drive";

    updateTab("current-drive-tab", driveName, `/files/${driveId}`);
    updateTab("current-site-tab", siteName, `/drives/${drive.siteId}`);

    // Fetch the files
    const files = await handleFetch(`${API_ENDPOINT}?driveId=${driveId}`, makeOptions("GET", null, true));
    renderTableRows(files, fileRowTemplate);

    // Setup search bar functionality
    setupSearchBar(
      "searchBar",
      files,
      (term) => (file) =>
        file.name.toLowerCase().includes(term) || file.webUrl.toLowerCase().includes(term),
      (filteredFiles) => renderTableRows(filteredFiles, fileRowTemplate)
    );

    // Initialize file sorting
    initSorting(files);

  } catch (error) {
    console.error("Error fetching files:", error.message);
    document.getElementById("error").textContent = error.message;
  } finally {
    hideSpinner();
  }
}

function initSorting(files) {
  let isSizeAscending = true;
  let isDateAscending = true;

  const sizeHeader = document.getElementById("size-header");
  const dateHeader = document.getElementById("date-header");
  const sizeIndicator = document.getElementById("size-sort-indicator");
  const dateIndicator = document.getElementById("date-sort-indicator");

  function resetIndicators() {
    sizeIndicator.textContent = ""; // Clear size indicator
    dateIndicator.textContent = ""; // Clear date indicator
  }

  sizeHeader.addEventListener("click", () => {
    const sortedFiles = [...files].sort((a, b) =>
      isSizeAscending
        ? (a.size || 0) - (b.size || 0)
        : (b.size || 0) - (a.size || 0)
    );
    isSizeAscending = !isSizeAscending; // Toggle sorting order
    resetIndicators();
    sizeIndicator.textContent = isSizeAscending ? "▼" : "▲";
    renderTableRows(sortedFiles, fileRowTemplate);
  });

  dateHeader.addEventListener("click", () => {
    const sortedFiles = [...files].sort((a, b) =>
      isDateAscending
        ? new Date(a.lastModifiedDateTime) - new Date(b.lastModifiedDateTime)
        : new Date(b.lastModifiedDateTime) - new Date(a.lastModifiedDateTime)
    );
    isDateAscending = !isDateAscending; // Toggle sorting order
    resetIndicators();
    dateIndicator.textContent = isDateAscending ? "▼" : "▲";
    renderTableRows(sortedFiles, fileRowTemplate);
  });
}
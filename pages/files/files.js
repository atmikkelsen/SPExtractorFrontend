import {
  setupSearchBar,
  renderTableRows,
  handleFetch,
  makeOptions,
  formatDate,
  updateTab,
} from "../../utils/utils.js";
import { showSpinner, hideSpinner } from "../../utils/spinner.js";
import { API_URL } from "../../server/settings.js";
import { fetchDrive } from "../drives/drives.js";

const API_ENDPOINT = `${API_URL}/files`;

//Template for a row in the files table
function fileRowTemplate(file) {
  const MAX_URL_LENGTH = 100;
  const formattedDate = formatDate(file.lastModifiedDateTime);
  const fileSize = file.size
    ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
    : "N/A";
  const truncatedUrl =
    file.webUrl.length > MAX_URL_LENGTH
      ? `${file.webUrl.substring(0, MAX_URL_LENGTH)}...`
      : file.webUrl;

  return `
    <tr id="file-row-${file.id}">
      <td>${file.name}</td>
      <td><a href="${file.webUrl}" target="_blank">${truncatedUrl}</a></td>
      <td>${fileSize}</td>
      <td>${formattedDate}</td>
      <td>${file.lastModifiedByDisplayName || "Unknown"}</td>
      <td>
        <a class="delete-button" data-file-id="${file.id}" >Delete</a>
      </td>
    </tr>
  `;
}

//Initializes the display of files for a specific drive
export async function initFiles(driveId) {
  showSpinner();
  try {
    //Gets data for the specific drive
    const drive = await handleFetch(
      `${API_URL}/drives/${driveId}`,
      makeOptions("GET", null, true)
    );
    const siteName = drive.siteName || "Unknown Site";
    const driveName = drive.name || "Unknown Drive";

    updateTab("current-drive-tab", driveName, `/files/${driveId}`);
    updateTab("current-site-tab", siteName, `/drives/${drive.siteId}`);

    const files = await handleFetch(
      `${API_ENDPOINT}?driveId=${driveId}`,
      makeOptions("GET", null, true)
    );
    renderTableRows(files, fileRowTemplate);

    // Attach delete button event listeners
    document.querySelectorAll(".delete-button").forEach((button) => {
      button.addEventListener("click", async (event) => {
        const fileId = button.getAttribute("data-file-id");
        if (confirm("Are you sure you want to delete this file?")) {
          await deleteFile(fileId, driveId);
        }
      });
    });

    setupSearchBar(
      "searchBar",
      files,
      (term) => (file) =>
        file.name.toLowerCase().includes(term) ||
        file.webUrl.toLowerCase().includes(term),
      (filteredFiles) => renderTableRows(filteredFiles, fileRowTemplate)
    );

    initSorting(files);
  } catch (error) {
    console.error("Error fetching files:", error.message);
    document.getElementById("error").textContent = error.message;
  } finally {
    hideSpinner();
  }
}

//Remove a file from the drive
async function deleteFile(fileId, driveId) {
  if (!fileId) {
    console.error("File ID is undefined.");
    alert("Unable to delete file: File ID is missing.");
    return;
  }

  const deleteEndpoint = `${API_ENDPOINT}/${driveId}/items/${fileId}`;
  showSpinner();

  try {
    const response = await fetch(
      deleteEndpoint,
      makeOptions("DELETE", null, true)
    );
    if (response.ok) {
      alert("File deleted successfully.");
      document.getElementById(`file-row-${fileId}`).remove(); // Remove the row from the table
    } else {
      const error = await response.json();
      alert(`Failed to delete file: ${error.message}`);
    }
  } catch (error) {
    console.error("Error deleting file:", error.message);
    alert("An error occurred while deleting the file.");
  } finally {
    hideSpinner();
  }
}

//Initializing sorting functionality for the files table
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

  // Add event listener for sorting by size
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

  // Add event listener for sorting by date
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

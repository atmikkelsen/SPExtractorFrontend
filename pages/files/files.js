import { sanitizeStringWithTableRows, makeOptions } from "../../utils.js";
import { API_URL, TEST_TOKEN } from "../../settings.js";
const API_ENDPOINT = `${API_URL}/files`;

export async function initFiles(driveId) {
  const spinner = document.getElementById("loading-spinner");

  try {
    spinner.style.display = "block";
    // Fetch drive details
    console.log(driveId);
    const driveResponse = await fetch(
      `${API_URL}/drives/${driveId}`,
      makeOptions("GET", null, true, TEST_TOKEN)
    );
    if (!driveResponse.ok) {
      const errorData = await driveResponse.json();
      throw new Error(errorData.message || "Failed to fetch drive details");
    }
    const drive = await driveResponse.json();

    // Update the "current drive" tab
    const currentDriveTab = document.getElementById("current-drive-tab");
    currentDriveTab.style.display = "inline"; // Show the tab
    currentDriveTab.querySelector("a").textContent = drive.name;
    currentDriveTab
      .querySelector("a")
      .setAttribute("href", `/files/${driveId}`);

    const currentSiteTab = document.getElementById("current-site-tab");
    currentSiteTab.style.display = "inline"; // Show the tab
    currentSiteTab.querySelector("a").textContent = drive.siteName;
    currentSiteTab
      .querySelector("a")
      .setAttribute("href", `/drives/${drive.siteId}`);

    // Highlight the active tab
    document
      .querySelectorAll("#menu a")
      .forEach((link) => link.classList.remove("active"));
    currentDriveTab.querySelector("a").classList.add("active");
    currentSiteTab.querySelector("a").classList.add("active");

    // Fetch files for the drive
    const response = await fetch(
      `${API_ENDPOINT}?driveId=${driveId}`,
      makeOptions("GET", null, true, TEST_TOKEN)
    );
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch files");
    }
    const files = await response.json();

    renderFiles(files);
    initSorting(files);

    document.getElementById("searchBar").addEventListener("input", (e) => {
      const searchTerm = e.target.value.toLowerCase();
      const filteredFiles = files.filter(
        (file) =>
          file.name.toLowerCase().includes(searchTerm) ||
          file.webUrl.toLowerCase().includes(searchTerm)
      );
      renderFiles(filteredFiles);
    });
  } catch (error) {
    console.error("Error fetching files:", error.message);
    document.getElementById("error").textContent = error.message;
  } finally {
    spinner.style.display = "none";
  }
}

function renderFiles(files) {
  const tableBody = document.getElementById("table-rows");
  const MAX_URL_LENGTH = 100; // Define the maximum number of characters to display

  if (files.length === 0) {
    // Display "No large files found" message
    tableBody.innerHTML = `
      <tr>
        <td colspan="4" style="text-align: center; font-style: italic;">
          No large files found
        </td>
      </tr>
    `;
    return;
  }

  const tableRows = files.map((file) => {
    const formattedDate = formatDate(file.lastModifiedDateTime);
    const fileSize = file.size
      ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
      : "N/A";
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
      </tr>
    `;
  });

  tableBody.innerHTML = sanitizeStringWithTableRows(tableRows.join(""));
}

function initSorting(files) {
  let isSizeAscending = true;
  let isDateAscending = true;

  const sizeHeader = document.getElementById("size-header");
  const dateHeader = document.getElementById("date-header");
  const sizeIndicator = document.getElementById("size-sort-indicator");
  const dateIndicator = document.getElementById("date-sort-indicator");

  function resetIndicators() {
    //sizeIndicator.textContent = ""; // Clear indicators
    //dateIndicator.textContent = "";
  }

  sizeHeader.addEventListener("click", () => {
    const sortedFiles = [...files].sort((a, b) =>
      isSizeAscending
        ? (a.size || 0) - (b.size || 0)
        : (b.size || 0) - (a.size || 0)
    );
    isSizeAscending = !isSizeAscending; // Toggle sorting order

    resetIndicators(); // Reset other indicators
    sizeIndicator.textContent = isSizeAscending ? "▼" : "▲"; // Set active indicator

    renderFiles(sortedFiles);
  });

  dateHeader.addEventListener("click", () => {
    const sortedFiles = [...files].sort((a, b) =>
      isDateAscending
        ? new Date(a.lastModifiedDateTime) - new Date(b.lastModifiedDateTime)
        : new Date(b.lastModifiedDateTime) - new Date(a.lastModifiedDateTime)
    );
    isDateAscending = !isDateAscending; // Toggle sorting order

    resetIndicators(); // Reset other indicators
    dateIndicator.textContent = isDateAscending ? "▲" : "▼"; // Set active indicator

    renderFiles(sortedFiles);
  });
}

function formatDate(dateString) {
  if (!dateString) return "N/A"; // Handle missing or null dates gracefully
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.getMonth() + 1; // Months are zero-indexed
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

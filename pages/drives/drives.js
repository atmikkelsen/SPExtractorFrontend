import { sanitizeStringWithTableRows, makeOptions } from "../../utils.js";
import { API_URL, TEST_TOKEN } from "../../settings.js";
const API_ENDPOINT = `${API_URL}/drives`;

export async function initDrives(siteId) {
  const spinner = document.getElementById("loading-spinner");

  try {
    spinner.style.display = "block";

    // Fetch site details
    const siteResponse = await fetch(
      `${API_URL}/sites/${siteId}`,
      makeOptions("GET", null, true, TEST_TOKEN)
    );
    if (!siteResponse.ok) {
      const errorData = await siteResponse.json();
      throw new Error(errorData.message || "Failed to fetch site details");
    }
    const site = await siteResponse.json();

    // Update the "current site" tab
    const currentSiteTab = document.getElementById("current-site-tab");
    currentSiteTab.style.display = "inline"; // Show the tab
    currentSiteTab.querySelector("a").textContent = site.displayName;
    currentSiteTab.querySelector("a").setAttribute("href", `/drives/${siteId}`);

    // Highlight the active tab
    document
      .querySelectorAll("#menu a")
      .forEach((link) => link.classList.remove("active"));
    currentSiteTab.querySelector("a").classList.add("active");

    // Fetch drives for the site
    const response = await fetch(
      `${API_ENDPOINT}?siteId=${siteId}`,
      makeOptions("GET", null, true, TEST_TOKEN)
    );
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch drives");
    }
    const drives = await response.json();

    renderDrives(drives);

    document.getElementById("searchBar").addEventListener("input", (e) => {
      const searchTerm = e.target.value.toLowerCase();
      const filteredDrives = drives.filter(
        (drive) =>
          drive.displayName.toLowerCase().includes(searchTerm) ||
          drive.webUrl.toLowerCase().includes(searchTerm)
      );
      renderDrives(filteredDrives);
    });
  } catch (error) {
    console.error("Error fetching drives:", error.message);
    document.getElementById("error").textContent = error.message;
  } finally {
    spinner.style.display = "none";
  }
}

function renderDrives(drives) {
  const tableRows = drives.map((drive) => {
    // Convert the date to a more readable format
    const formattedDate = formatDate(drive.lastModifiedDateTime);

    return `
      <tr>
        <td><a href="#/files/${drive.id}" class="edit-button">${drive.name}</a></td>
        <td><a href="#/files/${drive.id}" class="edit-button">${drive.webUrl}</a></td>
        <td><a href="#/files/${drive.id}" class="edit-button">${formattedDate}</a></td>
        <td><a href="#/files/${drive.id}" class="edit-button">Edit</a></td>
      </tr>
    `;
  });

  const tableRowsAsStr = tableRows.join("");
  document.getElementById("table-rows").innerHTML =
    sanitizeStringWithTableRows(tableRowsAsStr);
}

function formatDate(dateString) {
  if (!dateString) return "N/A"; // Handle missing or null dates gracefully
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.getMonth() + 1; // Months are zero-indexed
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

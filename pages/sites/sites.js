import {
  setupSearchBar,
  renderTableRows,
  handleFetch,
  makeOptions,
  updateLoginStatus,
} from "../../utils/utils.js";
import { showSpinner, hideSpinner } from "../../utils/spinner.js";
import { loginAndGetToken } from "../../server/auth.js";
import { API_URL } from "../../server/settings.js";

const API_ENDPOINT = `${API_URL}/sites`;
// Fetches data for a specific site
export async function fetchSite(siteId) {
  return handleFetch(
    `${API_ENDPOINT}/${siteId}`,
    makeOptions("GET", null, true)
  );
}

// Template for a row in the sites table
function siteRowTemplate(site) {
  return `
    <tr>
      <td><a href="#/drives/${site.id}" class="edit-button">${site.displayName}</a></td>
      <td><a href="#/drives/${site.id}" class="edit-button">${site.webUrl}</a></td>
      <td>
        <a class="total-file-count-button" data-site-id="${site.id}">
          Hent antallet af filer
        </a>
        <span id="total-file-count-${site.id}"></span>
      </td>
    </tr>
  `;
}

// Initializes the display of sites
export async function initSites() {
  showSpinner();
  try {
    // Fetch all sites
    const sites = await handleFetch(
      API_ENDPOINT,
      makeOptions("GET", null, true)
    );
    renderTableRows(sites, siteRowTemplate);

    // Attach event listeners to the "Get Total File Count" buttons
    const buttons = document.querySelectorAll(".total-file-count-button");
    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        const siteId = button.getAttribute("data-site-id");
        const siteName = sites.find((site) => site.id === siteId).displayName;

        fetchTotalFileCount(siteId, siteName, button);
      });
    });
    
    // Setup search bar for filtering sites
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

    // Check if the error indicates a missing or invalid accessToken
    if (error.message.includes("token")) {
      displayOAuthLogin(); // Display the OAuth login button
    } else {
      document.getElementById("error").textContent = error.message;
    }
  } finally {
    hideSpinner();
  }
}

async function fetchTotalFileCount(siteId, siteName, button) {
  const totalFileCountSpan = document.getElementById(
    `total-file-count-${siteId}`
  );

  // Hide the button and show "Loading..." with a spinner
  button.style.display = "none";
  totalFileCountSpan.innerHTML = `
    <span class="loading-text">Loading...</span>
    <span class="tinyspinner"></span>
  `;

  try {
    const drives = await handleFetch(
      `${API_URL}/drives?siteId=${siteId}&siteName=${siteName}`,
      makeOptions("GET", null, true)
    );

    // Use Promise.all to fetch file counts for all drives concurrently
    const fileCounts = await Promise.all(
      drives.map((drive) =>
        handleFetch(
          `${API_URL}/files?driveId=${drive.id}`,
          makeOptions("GET", null, true)
        ).then((files) => files.length)
      )
    );

    // Sum up all file counts
    const totalFileCount = fileCounts.reduce((sum, count) => sum + count, 0);

    // Display the total file count
    totalFileCountSpan.textContent = totalFileCount;
  } catch (error) {
    console.error("Error fetching total file count:", error.message);
    totalFileCountSpan.textContent = "Error";
    button.style.display = "inline"; // Show the button again if there's an error
  }
}

function displayOAuthLogin() {
  const contentElement = document.getElementById("content");
  contentElement.innerHTML = `
    <div class="logged-out-container">
      <h2>Du er ikke logget ind</h2>
      <button id="login-button" class="contrast button-large">Log In</button>
    </div>
  `;

  const loginButton = document.getElementById("login-button");
  loginButton.addEventListener("click", async () => {
    try {
      const accessToken = await loginAndGetToken();
      if (accessToken) {
        updateLoginStatus(); // Update the login/logout button styles
        location.reload(); // Reload the page to reinitialize
      }
    } catch (error) {
      console.error("Login failed:", error.message);
      alert("Failed to log in. Please try again.");
    }
  });
}

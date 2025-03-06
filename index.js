import "https://unpkg.com/navigo";
import { setActiveLink, renderHtml, loadHtml, updateLoginStatus } from "./utils/utils.js";
import { loginAndGetToken, logout } from "./server/auth.js";
import { initSites, fetchSite } from "./pages/sites/sites.js";
import { initDrives, fetchDrive } from "./pages/drives/drives.js";
import { initFiles } from "./pages/files/files.js";

let siteName = ""; // Store the current site name globally
let driveName = ""; // Store the current drive name globally


// Router initialization
window.addEventListener("load", async () => {
  const templates = {
    home: await loadHtml("./pages/home/home.html"),
    sites: await loadHtml("./pages/sites/sites.html"),
    drives: await loadHtml("./pages/drives/drives.html"),
    files: await loadHtml("./pages/files/files.html"),
  };

  const router = new Navigo("/", { hash: true });

  router
    .hooks({
      before(done, match) {
        try {
          setActiveLink("menu", match.url);

          // Parse route and call updateTabs
          const route = match.url.split("/")[1];
          const siteId = match.data?.siteId || null;
          const driveId = match.data?.driveId || null; 

          updateTabs(route, siteId, driveId); // Safely pass siteId only when available
        } catch (error) {
          console.error("Error in before hook:", error.message);
          displayError("An error occurred during navigation.");
        }
        done();
      },
    })
    .on({
      "/": () => {
        try {
          renderHtml(templates.home, "content");
        } catch (error) {
          console.error("Error rendering home page:", error.message);
          displayError("Failed to load the home page.");
        }
      },
      "/sites": () => {
        try {
          renderHtml(templates.sites, "content");
          initSites();
        } catch (error) {
          console.error("Error initializing sites:", error.message);
          displayError("Failed to load sites.");
        }
      },
      "/drives/:siteId": async (match) => {
        renderHtml(templates.drives, "content");

        const siteId = match.data.siteId;
        try {
          const site = await fetchSite(siteId); // Fetch site details
          siteName = site.displayName; // Store siteName globally
          updateTabs("drives", siteId, null); // Update tabs
          initDrives(siteId); // Initialize drives for the site
        } catch (error) {
          console.error("Error fetching site:", error.message);

          // Display the error message in the UI
          displayError(error.message || "Failed to load site details.");
        }
      },
      "/files/:driveId": async (match) => {
        renderHtml(templates.files, "content");

        const driveId = match.data.driveId;
        try {
          const drive = await fetchDrive(driveId); // Fetch drive details
          driveName = drive.name; // Store drive name globally
          siteName = drive.siteName; // Store site name globally (if available)
          updateTabs("files", null, driveId);
          initFiles(driveId);
        } catch (error) {
          console.error("Error fetching drive or initializing files:", error.message);
          displayError(error.message || "Failed to load drive or file details.");
        }
      },
    })
    .notFound(() =>
      document.getElementById("content").innerHTML = "<h2>404 - Page not found</h2>"
    )
    .resolve();

    if (window.location.hash === "#/#/sites") {
      renderHtml(templates.sites, "content");
      initSites();
    }
});

// Handle login button click
document.getElementById("loginButton").addEventListener("click", async () => {
  try {
    await loginAndGetToken();
    updateLoginStatus(); 
    location.reload(); 
  } catch (error) {
    console.error("Login failed:", error.message);
    alert("Login failed. Please try again.");
  }
});

// Handle logout button click
document.getElementById("logoutButton").addEventListener("click", () => {
  try {
    logout();
    updateLoginStatus(); // Update the UI
    location.reload(); 

  } catch (error) {
    console.error("Logout failed:", error.message);
    alert("Logout failed. Please try again.");
  }
});

// Handle error messages
window.onerror = (errorMsg, url, lineNumber, column, errorObj) => {
  alert(
    `Error: ${errorMsg} Script: ${url} Line: ${lineNumber} Column: ${column} StackTrace: ${errorObj}`
  );
};

// Update login status on page load
window.addEventListener("load", () => {
  updateLoginStatus();
});

// Display error message in the UI
function displayError(message) {
  const errorElement = document.getElementById("error");
  if (errorElement) {
    console.log("Error displayed:", message); // Debug log
    errorElement.textContent = message;
    errorElement.style.display = "block"; // Ensure the error message is visible
  } else {
    console.error("Error element not found in the DOM.");
  }
}

// Update the active tab based on the route
function updateTabs(route, siteId = null, driveId = null) {
  const currentSiteTab = document.getElementById("current-site-tab");
  const currentDriveTab = document.getElementById("current-drive-tab");

  // Hide both tabs initially
  currentSiteTab.style.display = "none";
  currentDriveTab.style.display = "none";

  if (route === "sites") {
    currentSiteTab.style.display = "inline";
    currentSiteTab.querySelector("a").textContent = "Mine sider";
    currentSiteTab.querySelector("a").setAttribute("href", "#/sites");
    currentSiteTab.querySelector("a").classList.add("active");
  } else if (route === "drives" && siteId) {
    currentSiteTab.style.display = "inline";
    currentSiteTab.querySelector("a").textContent = siteName || "Site";
    currentSiteTab.querySelector("a").setAttribute("href", `#/drives/${siteId}`);
    currentSiteTab.querySelector("a").classList.add("active");
  } else if (route === "files" && driveId) {
    currentSiteTab.style.display = "inline";
    currentSiteTab.querySelector("a").textContent = siteName || "Unknown Site";
    currentSiteTab.querySelector("a").setAttribute("href", `#/drives/${siteId || ''}`);
    currentSiteTab.querySelector("a").classList.remove("active");

    currentDriveTab.style.display = "inline";
    currentDriveTab.querySelector("a").textContent = driveName || "Drive";
    currentDriveTab.querySelector("a").setAttribute("href", `#/files/${driveId}`);
    currentDriveTab.querySelector("a").classList.add("active");
  }
}



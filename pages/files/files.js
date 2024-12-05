import { sanitizeStringWithTableRows, makeOptions } from "../../utils.js";
import { API_URL, TEST_TOKEN } from "../../settings.js";
const API_ENDPOINT = `${API_URL}/files`;

export async function initFiles(driveId) {
  try {
    // Fetch drive details
    console.log(driveId);
    const driveResponse = await fetch(`${API_URL}/drives/${driveId}`, makeOptions("GET", null, true, TEST_TOKEN));
    console.log('Response status:' + driveResponse.status);
    console.log ('Response body:' + driveResponse.body);  
    if (!driveResponse.ok) {
      const errorData = await driveResponse.json();
      throw new Error(errorData.message || "Failed to fetch drive details");
    }
    const drive = await driveResponse.json();

    // Update the "current drive" tab
    const currentDriveTab = document.getElementById("current-drive-tab");
    currentDriveTab.style.display = "inline"; // Show the tab
    currentDriveTab.querySelector("a").textContent = drive.name;
    currentDriveTab.querySelector("a").setAttribute("href", `/files/${driveId}`);

    // Highlight the active tab
    document.querySelectorAll("#menu a").forEach((link) => link.classList.remove("active"));
    currentDriveTab.querySelector("a").classList.add("active");

    // Fetch files for the drive
    const response = await fetch(`${API_ENDPOINT}?driveId=${driveId}`, makeOptions("GET", null, true, TEST_TOKEN));
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch files");
    }
    const files = await response.json();

    renderFiles(files);

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
  }
}

function renderFiles(files) {
  const tableRows = files.map((file) => {
    // Convert the date to a more readable format
    const formattedDate = formatDate(file.lastModifiedDateTime);
    const fileSize = file.size ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : "N/A";

    return `
      <tr>
        <td>${file.name}</td>
        <td><a href="${file.webUrl}" target="_blank">${file.webUrl}</a></td>
        <td>${fileSize}</td>
        <td>${formattedDate}</td>
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

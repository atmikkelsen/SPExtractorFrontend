/**
 * Appends the provided template to the node with the id contentId
 * @param {*} template The HTML to render
 * @param {string} contentId
 */
export function renderHtml(template, contentId) {
  const content = document.getElementById(contentId);
  if (!content) {
    throw Error("No Element found for provided content id");
  }
  content.innerHTML = "";
  content.append(template);
}

/**
 * Loads an external file with an div with the class "template", adds it to the body of your page, and returns
 * the div
 * @param {string} page - Path to the file containing the template ('/templates/template.html')
 * @return {Promise<*>} On succesfull resolvement, the HtmlTemplate found in the file
 */
export async function loadHtml(page) {
  const resHtml = await fetch(page).then((r) => {
    if (!r.ok) {
      throw new Error(`Failed to load the page: '${page}' `);
    }
    return r.text();
  });
  const parser = new DOMParser();
  const content = parser.parseFromString(resHtml, "text/html");
  const div = content.querySelector(".template");
  if (!div) {
    throw new Error(
      `No outer div with class 'template' found in file '${page}'`
    );
  }
  return div;
}

/**
 * Sets active element on a div (or similar) containing a-tags (with data-navigo attributes ) used as a "menu"
 * Meant to be called in a before-hook with Navigo
 * @param topnav - Id for the element that contains the "navigation structure"
 * @param activeUrl - The URL which are the "active" one
 */
export function setActiveLink(topnav, activeUrl) {
  const links = document.getElementById(topnav).querySelectorAll("a");
  links.forEach((child) => {
    child.classList.remove("active");
    //remove leading '/' if any
    if (child.getAttribute("href").replace(/\//, "") === activeUrl) {
      child.classList.add("active");
    }
  });
}

/**
 * Small utility function to use in the first "then()" when fetching data from a REST API that supply error-responses as JSON
 *
 * Use like this--> const responseData = await fetch(URL,{..}).then(handleHttpErrors)
 */
export async function handleHttpErrors(res) {
  if (!res.ok) {
    const errorResponse = await res.json();
    const error = new Error(errorResponse.message);
    // @ts-ignore
    error.fullResponse = errorResponse;
    throw error;
  }
  return res.json();
}

/**
 * HINT --> USE DOMPurify.sanitize(..) to sanitize a full string of tags to be inserted
 * via innerHTML
 * Tablerows are required to be inside a table tag, so use this small utility function to
 * sanitize a string with TableRows only (made from data with map)
 * DOMPurify is available here, because it's imported in index.html, and as so available in all
 * your JavaScript files
 */
export function sanitizeStringWithTableRows(tableRows) {
  let secureRows = DOMPurify.sanitize("<table>" + tableRows + "</table>");
  secureRows = secureRows.replace("<table>", "").replace("</table>", "");
  return secureRows;
}

export function makeOptions(method, body, addToken, testToken = null) {
  const opts = {
    method: method,
    headers: {
      "Content-type": "application/json",
      Accept: "application/json",
    },
    mode: "cors",
    credentials: "include",
  };
  if (body) {
    opts.body = JSON.stringify(body);
  }
  if (addToken) {
    const accessToken = testToken || localStorage.getItem("accessToken");
    if (accessToken) {
      opts.headers.Authorization = "Bearer " + accessToken;
    } else {
      throw new Error("No token found for Authorization, please login again");
    }
  }
  return opts;
}

export function setupSearchBar(searchBarId, items, filterFn, renderFn) {
  const searchBar = document.getElementById(searchBarId);
  searchBar.addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredItems = items.filter(filterFn(searchTerm));
    renderFn(filteredItems);
  });
}

export function displayError(message) {
  const errorContainer = document.getElementById("error");
  errorContainer.textContent = message;
  errorContainer.style.display = "block";
}

export async function handleFetch(url, options) {
  const response = await fetch(url, options);

  if (!response.ok) {
    let errorMessage = "An error occurred"; // Default error message
    try {
      const errorData = await response.json(); // Parse JSON error response
      errorMessage = errorData.error || errorData.message || errorMessage; // Extract the error field
    } catch (err) {
      console.error("Failed to parse error response:", err);
    }
    throw new Error(errorMessage); // Throw the error
  }

  return await response.json(); // Return JSON if successful
}

export function renderTableRows(items, rowTemplateFn) {
  const tableBody = document.getElementById("table-rows");

  // Clear existing rows
  tableBody.innerHTML = "";

  // Render new rows
  if (items.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="3" style="text-align: center; font-style: italic;">
          Fandt ingen resultater
        </td>
      </tr>`;
    return;
  }

  const rows = items.map(rowTemplateFn).join("");
  tableBody.innerHTML = sanitizeStringWithTableRows(rows);
}

export function formatDate(dateString) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}

export function updateTab(tabId, text, href) {
  const tab = document.getElementById(tabId);
  tab.style.display = "inline";
  tab.querySelector("a").textContent = text;
  tab.querySelector("a").setAttribute("href", href);
}

export function updateLoginStatus() {
  const loginButton = document.getElementById("loginButton");
  const logoutButton = document.getElementById("logoutButton");

  const accessToken = localStorage.getItem("accessToken");

  if (accessToken) {
    // User is logged in
    loginButton.style.display = "none";
    logoutButton.style.display = "inline";
  } else {
    // User is logged out
    loginButton.style.display = "inline";
    logoutButton.style.display = "none";
  }
}
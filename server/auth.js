import { API_URL } from "./settings.js";


const msalConfig = {
  auth: {
    clientId: "88b85d58-c71c-4027-b0c3-03831789d4b8",
    authority: "https://login.microsoftonline.com/d7fe13fe-91f8-4625-826d-8b11d0d57852",
    redirectUri: "https://localhost:3000",
  },
  cache: {
    cacheLocation: "localStorage", // Recommended for SPAs
    storeAuthStateInCookie: false, // Set to true if cookies are required
  },
};


const msalInstance = new msal.PublicClientApplication(msalConfig);

/**
 * Logs in the user and retrieves the Bearer token.
 * Stores the token in `localStorage`.
 */
export async function loginAndGetToken() {
  const request = {
    scopes: ["https://graph.microsoft.com/.default"],
  };

  try {
    const loginResponse = await msalInstance.loginPopup(request);
    console.log("Login successful:", loginResponse);

    const account = msalInstance.getAllAccounts()[0];
    const tokenResponse = await msalInstance.acquireTokenSilent({
      account,
      scopes: request.scopes,
    });

    localStorage.setItem("token", tokenResponse.accessToken);
    return tokenResponse.accessToken;
  } catch (error) {
    console.error("Error during login or token acquisition:", error);

    if (error instanceof msal.InteractionRequiredAuthError) {
      const tokenResponse = await msalInstance.acquireTokenPopup(request);
      localStorage.setItem("token", tokenResponse.accessToken);
      return tokenResponse.accessToken;
    }

    throw error;
  }
}

/**
 * Logs out the user and clears the token.
 */
export function logout() {
  msalInstance.logoutPopup();
  localStorage.removeItem("token");
}
 
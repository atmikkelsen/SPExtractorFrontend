import { API_URL } from "./settings.js";

// Configuration for MSAL
const msalConfig = {
  auth: {
    clientId: "YOUR_CLIENT_ID",
    authority: "https://login.microsoftonline.com/common",
    redirectUri: window.location.origin,
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

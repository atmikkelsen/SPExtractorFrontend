import { makeOptions } from "../../utils.js";
import { API_URL } from "../../settings.js";
const API_ENDPOINT = `${API_URL}/guests`;

async function createGuest() {
  try {
    const username = document.getElementById("username").value;
    const firstName = document.getElementById("firstName").value;
    const lastName = document.getElementById("lastName").value;
    const email = document.getElementById("email").value;
    const phoneNumber = document.getElementById("phoneNumber").value;

    const data = {
      username,
      firstName,
      lastName,
      email,
      phoneNumber,
    };

    const response = await fetch(
      API_ENDPOINT,
      makeOptions("POST", data, false)
    );
    const json = await response.json();
    console.log(json);
  } catch (error) {
    console.log(error);
  }
}

export async function initAddGuest() {
  const editBtn = document.getElementById("btn-submit-guest");

  if (editBtn) {
    editBtn.addEventListener("click", async function (event) {
      event.preventDefault();
      console.log("clicked");
      try {
        await createGuest();
      } catch (error) {
        console.log(error);
      }
    });
  }
}

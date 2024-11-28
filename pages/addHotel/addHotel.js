import { makeOptions } from "../../utils.js";
import { API_URL } from "../../settings.js";
const API_ENDPOINT = `${API_URL}/hotels`;

async function createHotel() {
  try {
    const name = document.getElementById("name").value;
    const street = document.getElementById("street").value;
    const city = document.getElementById("city").value;
    const zip = document.getElementById("zip").value;
    const country = document.getElementById("country").value;

    const data = {
      name,
      street,
      city,
      zip,
      country,
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

export async function initAddHotels() {
  const editBtn = document.getElementById("btn-submit-hotel");

  if (editBtn) {
    editBtn.addEventListener("click", async function (event) {
      event.preventDefault();
      console.log("clicked");
      try {
        await createHotel();
      } catch (error) {
        console.log(error);
      }
    });
  }
}

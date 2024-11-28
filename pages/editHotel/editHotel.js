import { makeOptions } from "../../utils.js";
import { API_URL } from "../../settings.js";
import { sanitizeStringWithTableRows } from "../../utils.js";
let currentNumberOfRooms = 0;

export async function initEditHotel(match) {
  const urlParams = new URLSearchParams(window.location.search);
  const hotelId = match?.data?.hotelId || urlParams.get("hotelId");

  const rooms = await fetch(`${API_URL}/rooms/${hotelId}`).then((res) =>
    res.json()
  );
  renderRooms(rooms);
  document.getElementById("roomSearchBar").addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredRooms = rooms.filter((room) =>
      room.numberOfBeds.toString().includes(searchTerm)
    );
    renderRooms(filteredRooms);
  });

  await new Promise((resolve) => {
    const checkExist = setInterval(() => {
      const formElement = document.getElementById("editHotelForm");
      if (formElement) {
        clearInterval(checkExist);
        resolve();
      }
    }, 100); // check every 100ms
  });

  await fetchHotelDetails(hotelId);

  document
    .getElementById("editHotelForm")
    .addEventListener("submit", async function (event) {
      event.preventDefault();
      await updateHotelDetails(hotelId);
    });

  const deleteButton = document.getElementById("delete");
  if (deleteButton) {
    deleteButton.addEventListener("click", function () {
      deleteHotel(hotelId);
    });
  }

  const addRoomButton = document.getElementById("addRoomButton");
  addRoomButton.addEventListener("click", function () {
    addNewRoom(hotelId);
  });
}

async function fetchHotelDetails(hotelId) {
  const response = await fetch(`${API_URL}/hotels/${hotelId}`);
  const hotel = await response.json();
  const addressParts = hotel.address.split(",").map((part) => part.trim());

  const street = addressParts[0];
  const city = addressParts[1];
  const zip = addressParts[2];
  const country = addressParts[3];

  document.getElementById("hotelId").value = hotel.id;
  document.getElementById("hotelName").value = hotel.name;
  document.getElementById("Street").value = street;
  document.getElementById("City").value = city;
  document.getElementById("Zip").value = zip;
  document.getElementById("Country").value = country;
  currentNumberOfRooms = hotel.numberOfRooms; // Update the global variable
  document.getElementById("numberOfRooms").value = currentNumberOfRooms;
}

async function updateHotelDetails(hotelId) {
  const updatedHotel = {
    name: document.getElementById("hotelName").value,
    street: document.getElementById("Street").value,
    city: document.getElementById("City").value,
    zip: document.getElementById("Zip").value,
    country: document.getElementById("Country").value,
  };

  const options = makeOptions("PUT", updatedHotel);
  const response = await fetch(`${API_URL}/hotels/${hotelId}`, options);

  if (response.ok) {
    console.log("Hotel details updated successfully");
    // Redirect or update UI as needed
  } else {
    console.error("Failed to update hotel details", response);
    // Handle errors, show messages to user as needed
  }
}

async function deleteHotel(hotelId) {
  if (!confirm("Are you sure you want to delete this hotel?")) {
    return; // Exit if user cancels the action
  }

  const options = makeOptions("DELETE");
  const response = await fetch(`${API_URL}/hotels/${hotelId}`, options);

  if (response.ok) {
    console.log("Hotel deleted successfully");
    window.location.href = "/#/hotels";
  } else {
    console.error("Failed to delete hotel", response);
  }
}

async function addNewRoom(hotelId) {
  const newRoomDetails = {
    roomNumber: currentNumberOfRooms + 1,
    numberOfBeds: 1,
    hotelId: hotelId,
  };

  const options = makeOptions("POST", newRoomDetails);
  const response = await fetch(`${API_URL}/rooms/${hotelId}`, options);

  if (response.ok) {
    console.log("New room added successfully");
    window.location.reload();
  } else {
    console.error("Failed to add new room", response);
  }
}

function renderRooms(rooms) {
  const tableRows = rooms.map(
    (room) => `
        <tr>
        <td>${room.id}</td>
        <td>${room.roomNumber}</td>
        <td>${room.numberOfBeds}</td>
        <td>${room.price}</td>
        <td><a href="#/reservations${room.id}" class="edit-button">Reserve</a></td>
        </tr>
      `
  );
  const tableRowsAsStr = tableRows.join("");
  document.getElementById("room-table-rows").innerHTML =
    sanitizeStringWithTableRows(tableRowsAsStr);
}

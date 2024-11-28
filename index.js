import "https://unpkg.com/navigo"; //Will create the global Navigo object used below
import "https://cdnjs.cloudflare.com/ajax/libs/dompurify/2.4.0/purify.min.js";

import { setActiveLink, renderHtml, loadHtml } from "./utils.js";

import { initSites } from "./pages/hotels/hotels.js";
import { initAddHotels } from "./pages/addHotel/addHotel.js";
import { initEditHotel } from "./pages/editHotel/editHotel.js";
import { initAddGuest } from "./pages/addGuest/addGuest.js";

window.addEventListener("load", async () => {
  const templateHome = await loadHtml("./pages/home/home.html");
  const templateHotels = await loadHtml("./pages/hotels/hotels.html");
  const templateAddHotel = await loadHtml("./pages/addHotel/addHotel.html");
  const templateEditHotel = await loadHtml("./pages/editHotel/editHotel.html");
  const templateAddGuest = await loadHtml("./pages/addGuest/addGuest.html");

  const router = new Navigo("/", { hash: true });
  window.router = router;
  router
    .hooks({
      before(done, match) {
        setActiveLink("menu", match.url);
        done();
      },
    })
    .on({
      "/": () => renderHtml(templateHome, "content"),
      "/no-navigo": () =>
        (document.getElementById("content").innerHTML = `
           <h3>Handling navigation on the client, if you don't like navigo</h3>
           <br/
           <p>Goto this page (will take you out of the router) <a href="/indexNoNavigoDemo.html">Plain no Navigo example</a></p>
           `),
      "/hotels": (match) => {
        renderHtml(templateHotels, "content");
        initSites(match);
      },
      "/addHotel": (match) => {
        renderHtml(templateAddHotel, "content");
        initAddHotels(match);
      },
      "/hotel/:hotelId": (match) => {
        renderHtml(templateEditHotel, "content");
        initEditHotel(match);
      },
      "/addGuest": (match) => {
        renderHtml(templateAddGuest, "content");
        initAddGuest(match);
      },
    })
    .notFound(
      () =>
        (document.getElementById("content").innerHTML =
          "<h2>404 - Page not found</h2>")
    )
    .resolve();
});

window.onerror = function (errorMsg, url, lineNumber, column, errorObj) {
  alert(
    "Error: " +
      errorMsg +
      " Script: " +
      url +
      " Line: " +
      lineNumber +
      " Column: " +
      column +
      " StackTrace: " +
      errorObj
  );
};

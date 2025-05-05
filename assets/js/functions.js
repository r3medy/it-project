// Regular Expression patterns for email and visa validation
// 4012888888881881 (visa) or 5500000000000004 (master card) for testing purposes
const RegExpressions = {
    "email" : new RegExp("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"),
    "card-number": new RegExp("^(?:4[0-9]{12}(?:[0-9]{3})?|[25][1-7][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})$")
};

// TEMPORARY UNTIL CUSTOMIZATION PAGE IS DONE
localStorage.setItem("carDetails", JSON.stringify({ manufacturer: "BMW", model: "M5", color: "White", price: 45999 }));

// When site loads
document.addEventListener("DOMContentLoaded", async () => {
    let currentPage = (window.location.pathname.includes("pages/") ? window.location.pathname.split("/pages/")[1] : window.location.pathname.split("/")[1]).replace(".html", ""),
        { cars } = await fetchCars();

    console.log("Loaded page: " + currentPage);
    switch(currentPage) {
        // case "suv":
        // case "sedan":
        case "coupe":
            let filteredCars     = cars.filter(item => item.type == currentPage),
                carManufacturers = ['Alfa Romeo', 'Audi', 'BMW', 'Chevrolet', 'Ford', 'Lexus', 'McLaren', 'Mercedes-Benz', 'Nissan', 'Porsche', 'Toyota'];
            // Make cards
            for(let car of filteredCars) {
                let card = await createCard(car);
                document.getElementById("car-container").append(card);
            }
            // Append options
            for(let manufacturer of carManufacturers) {
                let option = document.createElement("option");
                option.value = manufacturer;
                option.textContent = manufacturer;
                document.getElementById("manufacturerFilter").appendChild(option);
            }
            // Event listeners to check for search input and manufacturer selection
            let search = document.getElementById("search");
            let manufacturerFilter = document.getElementById("manufacturerFilter");
            search.addEventListener("input", () => displayFilteredCars(cars, search.value.trim(), manufacturerFilter.value));
            manufacturerFilter.addEventListener("change", () => displayFilteredCars(cars, search.value.trim(), manufacturerFilter.value));
            break;
        case "reservation":
            document.getElementById("submit-btn").addEventListener("click", reservationSubmit);
            let carModel = document.getElementById("carModel");
            let carColor = document.getElementById("carColor");
            let carPrice = document.getElementById("car-price");
            let { manufacturer, model, color, price } = JSON.parse(localStorage.getItem("carDetails"));
            carModel.innerText = `${manufacturer} ${model}`;
            carColor.innerText = color;
            carPrice.value = "$" + price.toLocaleString();
            break;
        case "invoice":
            if(!localStorage.getItem("reservationData")) return window.location.href = 'invoice.html';;
            var { date, name, phone, email, address} = JSON.parse(localStorage.getItem("reservationData")),
            carDetails = JSON.parse(localStorage.getItem("carDetails"));
            var dataArr = [name, address, phone, email, carDetails.model, carDetails.color, `$${carDetails.price.toLocaleString()}`],
            IDsArr  = ["customer-name", "customer-address", "customer-phone", "customer-email", "car-model", "car-color", "total-payment"];
            document.getElementById('invoice-date').textContent = `${new Date(date).toLocaleDateString("en-GB")}`;
            document.querySelector(".print-btn").addEventListener("click", () => window.print());
            for(let i in IDsArr) document.getElementById(IDsArr[i]).textContent = dataArr[i];
    }
});

// Colors we use
const colorPallete = {
    "dark": {
        "--primary": "rgb(20,18,24)",
        "--primary-degraded": "rgba(20,18,24,0.15)",
        "--background": "#fff"
    },
    "light": {
        "--primary": "rgb(240,240,240)",
        "--primary-degraded": "rgba(240,240,240,0.15)",
        "--background": "#121212"
    }
}

// Configurations
if(!localStorage.getItem("mode")) {
    localStorage.setItem("mode", "light");
}
var mode = localStorage.getItem("mode");

// Switches between darkmode and lightmode
async function toggleDarkmode() {
    for(let prop of ["--primary", "--primary-degraded", "--background"]) document.documentElement.style.setProperty(prop, colorPallete[mode][prop]);
    document.getElementsByClassName("status")[0].children[0].setAttribute("d", mode == "light" ? "M223.5 32C100 32 0 132.3 0 256S100 480 223.5 480c60.6 0 115.5-24.2 155.8-63.4c5-4.9 6.3-12.5 3.1-18.7s-10.1-9.7-17-8.5c-9.8 1.7-19.8 2.6-30.1 2.6c-96.9 0-175.5-78.8-175.5-176c0-65.8 36-123.1 89.3-153.3c6.1-3.5 9.2-10.5 7.7-17.3s-7.3-11.9-14.3-12.5c-6.3-.5-12.6-.8-19-.8z"
    : "M361.5 1.2c5 2.1 8.6 6.6 9.6 11.9L391 121l107.9 19.8c5.3 1 9.8 4.6 11.9 9.6s1.5 10.7-1.6 15.2L446.9 256l62.3 90.3c3.1 4.5 3.7 10.2 1.6 15.2s-6.6 8.6-11.9 9.6L391 391 371.1 498.9c-1 5.3-4.6 9.8-9.6 11.9s-10.7 1.5-15.2-1.6L256 446.9l-90.3 62.3c-4.5 3.1-10.2 3.7-15.2 1.6s-8.6-6.6-9.6-11.9L121 391 13.1 371.1c-5.3-1-9.8-4.6-11.9-9.6s-1.5-10.7 1.6-15.2L65.1 256 2.8 165.7c-3.1-4.5-3.7-10.2-1.6-15.2s6.6-8.6 11.9-9.6L121 121 140.9 13.1c1-5.3 4.6-9.8 9.6-11.9s10.7-1.5 15.2 1.6L256 65.1 346.3 2.8c4.5-3.1 10.2-3.7 15.2-1.6zM160 256a96 96 0 1 1 192 0 96 96 0 1 1 -192 0zm224 0a128 128 0 1 0 -256 0 128 128 0 1 0 256 0z");
    
    mode = mode == "light" ? "dark" : "light";
    localStorage.setItem("mode", mode == "light" ? "dark" : "light");
}

// Gets the cars array from the collection.json file
async function fetchCars() {
    const res = await fetch(`${window.location.pathname.includes("pages/") ? ".." : "."}/assets/js/collection.json`);
    return await res.json();
};

// Makes a card ( div ) for a car
async function createCard(car) {
    let card = document.createElement("div");
    card.className = "car-card";

    let img = document.createElement("img");
    img.className = "car-image";
    img.alt = car.carmodel;
    img.src = car.image_url || "placeholder.jpg"; // Add image source!

    let details = document.createElement("div");
    details.className = "car-details";

    details.innerHTML = `
      <h3>${car.manufacturer} ${car.car_model}</h3>
      <p><strong>Year:</strong> ${car.year}</p>
      <p><strong>Engine:</strong> ${car.engine_size}L</p>
      <p><strong>HP:</strong> ${car.horsepower} | <strong>Torque:</strong> ${car.torque} Nm</p>
      <p><strong>0-100 km/h:</strong> ${car["0_100"]}s</p>
      <p><strong>Price:</strong> $${car.price_usd.toLocaleString()}</p>
      <div class="card-buttons">
        <button class="book-btn">Book Now</button>
        <button class="testdrive-btn">Test Drive</button>
      </div>
    `;

    card.appendChild(img);
    card.appendChild(details);
    return card;
}

// Filters cars according to search term and manufacturer
async function displayFilteredCars(cars, searchTerm = "", manufacturer = "all") {
    let container = document.getElementById("car-container")
    container.innerHTML = "";
    let filteredbySearch = cars.filter(car => car.car_model.toLowerCase().includes(searchTerm.toLowerCase()) && (manufacturer === "all" || car.manufacturer === manufacturer));
    for(car of filteredbySearch) container.appendChild(await createCard(car));
}

async function reservationSubmit(e) {
    e.preventDefault();
    let requiredFields = ['name', 'phone', 'email', 'address', 'card-number', 'card-name', 'CVC'],
        continueSubmition = true,
        reservationData = { date: new Date() };
    for(let fieldId of requiredFields) {
        let field = document.getElementById(fieldId),
            isError = false;
        if(fieldId == "email" || fieldId == "card-number") {
            isError = !RegExpressions[fieldId].test(field.value.trim());
        }
        else if(!field.value.trim()) isError = true;

        if(isError) { field.style.border = '1px solid red'; continueSubmition = false; }
        else field.style.borderColor = '';
    }
    if(continueSubmition) {
        for(let fieldId of requiredFields) {
            let field = document.getElementById(fieldId).value.trim();
            reservationData[fieldId] = field;
        }

        localStorage.setItem("reservationData", JSON.stringify(reservationData));
        window.location.href = 'invoice.html';
    }
}

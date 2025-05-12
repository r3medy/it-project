// Regular Expression patterns for email and visa validation
// 4012888888881881 (visa) or 5500000000000004 (master card) for testing purposes
const RegExpressions = {
    "email" : new RegExp("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"),
    "card-number": new RegExp("^(?:4[0-9]{12}(?:[0-9]{3})?|[25][1-7][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})$")
};

// Colors we use
const colorPallete = {
    "light": {
        "--primary": "rgb(20,18,24)",
        "--primary-degraded": "rgba(20,18,24,0.15)",
        "--background": "#fff"
    },
    "dark": {
        "--primary": "rgb(240,240,240)",
        "--primary-degraded": "rgba(240,240,240,0.15)",
        "--background": "#121212"
    }
}

// Configurations
if(!localStorage.getItem("mode")) localStorage.setItem("mode", "light");
if(!localStorage.getItem("lang")) localStorage.setItem("lang", "ar");


var mode = localStorage.getItem("mode"),
    lang = localStorage.getItem("lang"),
    currentPage = (window.location.pathname.includes("pages/") ? window.location.pathname.split("/pages/")[1] : window.location.pathname.split("/")[1]).replace(".html", ""),
    selectedColor,
    selectedRim;

// When site loads
document.addEventListener("DOMContentLoaded", async () => {
    let { cars } = await fetchCars();

    // let str = "";
    // cars.forEach(r => str += `${r.year} ${r.manufacturer} ${r.model}\n`);
    // console.log(str);

    // Logs the current loaded page and theme
    console.log("Loaded page: " + currentPage);
    console.log("Current theme: " + mode);
    
    // Set current theme and language
    switchTheme(mode);
    switchLanguage(lang);

    switch(currentPage) {
        case "cars":
            let carManufacturers = ['Aston Martin', 'Acura', 'Alfa Romeo', 'Audi','BMW', 'Chevrolet', 'Dodge', 'Ford', 'Lexus', 'Lotus', 'Maserati', 'Mercedes-Benz', 'Nissan', 'Porsche', 'Toyota'];
            // Make cards
            for(let car of cars) document.getElementById("car-container").append(await createCard(car));
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
            let sortby = document.getElementById("sortby");
            search.addEventListener("input", () => displayFilteredCars(cars, search.value.trim(), manufacturerFilter.value), sortby.value);
            manufacturerFilter.addEventListener("change", () => displayFilteredCars(cars, search.value.trim(), manufacturerFilter.value, sortby.value));
            sortby.addEventListener("change", () => displayFilteredCars(cars, search.value.trim(), manufacturerFilter.value, sortby.value));
            break;
        case "reservation":
            document.getElementById("submit-btn").addEventListener("click", reservationSubmit);
            let carModel = document.getElementById("carModel"),
            carColor = document.getElementById("carColor"),
            carPrice = document.getElementById("car-price"),
            carRims  = document.getElementById("carRims"),
            { carIndex, selectedColor: color, selectedRim: rims } = JSON.parse(localStorage.getItem("carDetails")),
            details = cars[carIndex];

            carModel.value = `${details["manufacturer"]} ${details["model"]}`;
            carColor.value = color;
            carRims.value = rims;
            carPrice.value = "$" + details["MSRP"].toLocaleString();
            break;
        case "invoice":
            if(!localStorage.getItem("reservationData")) return window.location.href = 'invoice.html';
            var { date, name, phone, email, address } = JSON.parse(localStorage.getItem("reservationData")),
                { carIndex: i, selectedColor: clr, selectedRim: rim } = JSON.parse(localStorage.getItem("carDetails")),
                carData = cars[i];
            var dataArr = [name, address, phone, email, carData.model, clr, rim, `$${carData["MSRP"].toLocaleString()}`],
            IDsArr  = ["customer-name", "customer-address", "customer-phone", "customer-email", "car-model", "car-color", "rims-tires", "total-payment"];
            document.getElementById('invoice-date').textContent = `${new Date(date).toLocaleDateString("en-GB")}`;
            document.querySelector(".print-btn").addEventListener("click", () => window.print());
            for(let i in IDsArr) document.getElementById(IDsArr[i]).textContent = dataArr[i];
            break;
        case "preview":
            let carInfo = await carByIndex();
                ids = ["title", "manufacturer", "model", "type", "year", "transmission", "drivetrain", "engine", "power", "0-100kmh", "weight", "city_fueleco", "highway_fueleco", "MSRP"];
            
            // Main Thumbnail
            document.getElementsByClassName("main-image")[0].src = carInfo["display_images"][0];
            // Thumbnails
            for(let imageIndex in carInfo["display_images"]) {
                let thumbnail = document.createElement("img");
                thumbnail.className = imageIndex == 0 ? "thumbnail active" : "thumbnail";
                thumbnail.src = carInfo["display_images"][imageIndex];
                thumbnail.onclick = () => switchImage(carInfo, imageIndex);
                document.getElementsByClassName("gallery-thumbnails")[0].appendChild(thumbnail);
            }
            // Specifications
            for(let id of ids) {
                let element = document.getElementById(id),
                    text = "";
                switch(id) {
                    case "city_fueleco":
                    case "highway_fueleco":
                        text = `${carInfo[id]} L/100km`;
                        break;
                    case "MSRP":
                        text = `$${carInfo[id].toLocaleString()}`;
                        break;
                    case "title":
                        text = `${carInfo["year"]} ${carInfo["manufacturer"]} ${carInfo["model"]}`;
                        break;
                    case "engine":
                        text = carInfo["engine_size"] != 0 ? `${carInfo["engine_size"].toFixed(1)}L ${carInfo["engine_description"]}` : carInfo["engine_description"];
                        break;
                    case "power":
                        text = `${carInfo["horsepower"]} hp | ${carInfo["torque"]} Nm`;
                        break;
                    case "0-100kmh":
                        text = `${carInfo[id].toFixed(1)}s`
                        break;
                    case "type":
                        text = carInfo["type"][0].toUpperCase() + carInfo["type"].slice(1);
                        break;
                    case "weight":
                        text = `~${carInfo["weight"]} kg`;
                        break;
                    default:
                        text = carInfo[id];
                        break;
                }
                element.innerText = text;
            }
            break; // carDetails
        case "customization":
            const colorOptions  = document.querySelectorAll('.color-circle'),
                  rimButtons    = document.querySelectorAll('.rim-button'),
                  carInf = await carByIndex();

            document.getElementById("header").innerText = `${carInf.year} ${carInf.manufacturer} ${carInf.model}`;
            rimButtons.forEach(btn => btn.addEventListener("click", () => {
                rimButtons.forEach(b => b.classList.remove("selected"));
                btn.classList.add("selected");
                selectedRim = btn.dataset.rim;
                document.getElementById("info-line-rims").innerText = selectedRim;
            }));

            colorOptions.forEach(color => color.addEventListener("click", () => {
                colorOptions.forEach(c => c.classList.remove("selected"));
                color.classList.add("selected");
                selectedColor = color.dataset.color;
                document.getElementById("info-line-color").innerText = selectedColor;
            }));
            
            break;
    }
});

// Switches betweeen english and arabic
async function swapLanguage() {
    lang = lang == "en" ? "ar" : "en";
    await switchLanguage(lang);
    localStorage.setItem("lang", lang);
}

// Switches between darkmode and lightmode
async function toggleDarkmode() {
    mode = mode == "light" ? "dark" : "light";
    await switchTheme(mode);
    localStorage.setItem("mode", mode);
}

// Switches languages to the given one
async function switchLanguage(lang) {
    if(currentPage == "customization") return;
    const languageData = await fetchLanguage();
    let elements = [...document.querySelectorAll('[data-lang]')];
    for(let element of elements) {
        try {
            if(element.tagName == "INPUT") {
                element.placeholder = languageData[lang][currentPage][element.dataset.lang].replace(/\n/g, '<br />');
            } else element.innerHTML = languageData[lang][currentPage][element.dataset.lang].replace(/\n/g, '<br />');
    } catch(e) { console.log("Unknown data-lang :: ", element.dataset.lang); }
    }
    
    if(document.querySelector(".lang-switch")) return document.querySelector(".lang-switch").innerText = lang.toUpperCase();
}

// Switches themes to the given one
async function switchTheme(theme) {
    for(let prop of ["--primary", "--primary-degraded", "--background"]) document.documentElement.style.setProperty(prop, colorPallete[mode][prop]);
    const iconPath = theme === "dark"
        ? "M223.5 32C100 32 0 132.3 0 256S100 480 223.5 480c60.6 0 115.5-24.2 155.8-63.4c5-4.9 6.3-12.5 3.1-18.7s-10.1-9.7-17-8.5c-9.8 1.7-19.8 2.6-30.1 2.6c-96.9 0-175.5-78.8-175.5-176c0-65.8 36-123.1 89.3-153.3c6.1-3.5 9.2-10.5 7.7-17.3s-7.3-11.9-14.3-12.5c-6.3-.5-12.6-.8-19-.8z"
        : "M361.5 1.2c5 2.1 8.6 6.6 9.6 11.9L391 121l107.9 19.8c5.3 1 9.8 4.6 11.9 9.6s1.5 10.7-1.6 15.2L446.9 256l62.3 90.3c3.1 4.5 3.7 10.2 1.6 15.2s-6.6 8.6-11.9 9.6L391 391 371.1 498.9c-1 5.3-4.6 9.8-9.6 11.9s-10.7 1.5-15.2-1.6L256 446.9l-90.3 62.3c-4.5 3.1-10.2 3.7-15.2 1.6s-8.6-6.6-9.6-11.9L121 391 13.1 371.1c-5.3-1-9.8-4.6-11.9-9.6s-1.5-10.7 1.6-15.2L65.1 256 2.8 165.7c-3.1-4.5-3.7-10.2-1.6-15.2s6.6-8.6 11.9-9.6L121 121 140.9 13.1c1-5.3 4.6-9.8 9.6-11.9s10.7-1.5 15.2 1.6L256 65.1 346.3 2.8c4.5-3.1 10.2-3.7 15.2-1.6zM160 256a96 96 0 1 1 192 0 96 96 0 1 1 -192 0zm224 0a128 128 0 1 0 -256 0 128 128 0 1 0 256 0z";

    try { document.querySelector(".status > *").setAttribute("d", iconPath); } catch(e) {}
}

// Gets the cars array from the collection.json file
async function fetchCars() {
    const res = await fetch(`${window.location.pathname.includes("pages/") ? ".." : "."}/assets/js/collection.json`);
    return await res.json();
};

async function fetchLanguage() {
    const res = await fetch(`${window.location.pathname.includes("pages/") ? ".." : "."}/assets/js/language.json`);
    return await res.json();
};

// Makes a card ( div ) for a car
async function createCard(car) {
    let {cars} = await fetchCars(),
        carIndex = cars.findIndex(r => r.model == car.model);

    let card = document.createElement("div");
    card.className = "car-card";

    let img = document.createElement("img");
    img.className = "car-image";
    img.src = "../assets/images/cars/" + car.model.toLowerCase() + ".jpg";

    let details = document.createElement("div");
    details.className = "car-details";

    details.innerHTML = `
      <h3>${car.manufacturer} ${car.model}</h3>
      <p><strong data-lang="year">Year:</strong> ${car.year}</p>
      <p><strong data-lang="price">Price:</strong> $${car.MSRP.toLocaleString()}</p>
      <div class="card-buttons">
        <button class="book-btn" onclick="goToCustomization(${carIndex})" data-lang="book-now">Book Now</button>
        <button class="preview-btn" onclick="goToPreview(${carIndex})" data-lang="preview">Preview</button>
      </div>
    `;

    card.appendChild(img);
    card.appendChild(details);
    return card;
}

// Refers the user to the preview page with the index of the car as a URL Parameter
async function goToPreview(carIndex) {
    let { cars } = await fetchCars(),
        url = new URL(window.location.origin + "/pages/preview.html");
    
    url.searchParams.set("carIndex", carIndex);
    window.location.href = url.href;
}

// Refers the user to the customization page with the index of the car as a URL Parameter
async function goToCustomization(carIndex) {
    let { cars } = await fetchCars(),
        url = new URL(window.location.origin + "/pages/customization.html");
    
    url.searchParams.set("carIndex", carIndex);
    window.location.href = url.href;
}

// Filters cars according to search term and manufacturer
async function displayFilteredCars(cars, searchTerm = "", manufacturer = "all", sortby = "none") {
    let container = document.getElementById("car-container")
    container.innerHTML = "";
    let filteredCars = cars.filter(car => car.model.toLowerCase().includes(searchTerm.toLowerCase()) && (manufacturer === "all" || car.manufacturer === manufacturer));
    if(sortby != "none") filteredCars.sort((previous, current) => {
        switch(sortby) {
            case "up-price":
                return current.MSRP >= previous.MSRP;
            case "down-price":
                return current.MSRP <= previous.MSRP;
            case "up-year":
                return current.year >= previous.year;
            case "down-year":
                return current.year <= previous.year;
        }
    });
    for(let car of filteredCars) container.appendChild(await createCard(car));
}

// Submit button in reservation page
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
        } else if(!field.value.trim()) isError = true;
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

// Submit button in customization page
async function customizationSubmit() {
    if(!selectedColor || !selectedRim) return alert("Missing information");
    let { searchParams } = new URL(window.location),
        carIndex = searchParams.get("carIndex");

    localStorage.setItem("carDetails", JSON.stringify({ carIndex, selectedColor, selectedRim }));
    window.location.href = "reservation.html";
}

// Submit button in preview page
async function previewSubmit() {
    let { searchParams } = new URL(window.location),
        carIndex = searchParams.get("carIndex");

    await goToCustomization(carIndex);
}

// Switches images in a preview page
async function switchImage(carInfo, imageIndex) {
    let mainImage = document.getElementsByClassName("main-image")[0],
         gallery  = document.getElementsByClassName("gallery-thumbnails")[0];
    document.querySelector(".active").classList.remove("active");
    gallery.children[imageIndex].classList.add("active");   
    mainImage.src = carInfo["display_images"][imageIndex];
}

// Register button in register
async function registerBtn() {
    let fields = [document.getElementById("password"), document.getElementById("confirm_password")];
    if(fields[0].value != fields[1].value) { fields[0].style.border = '1px solid red'; fields[1].style.border = '1px solid red'; }
}

// Swaps between classes for grid/list view
async function displayItemsAs(viewStyle) {
    document.getElementById("car-container").className = viewStyle + "-container";
}

// Function to return car information depending on carIndex in search parameters
async function carByIndex() {
    let { searchParams } = new URL(window.location),
        { cars } = await fetchCars();
        carIndex = searchParams.get("carIndex");

    return cars[carIndex];
}

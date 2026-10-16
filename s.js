const PUBLIC_KEY = "FD14bRVv1xoGyhKh8";
const SERVICE_ID = "service_zaxahbm";
const TEMPLATE_ID = "template_eht2gao";

const bookingForm = document.getElementById("bookingForm");
const movieSelect = document.getElementById("movieSelect");
const showtimeSelect = document.getElementById("showtimeSelect");
const ticketQuantity = document.getElementById("ticketQuantity");
const emailInput = document.getElementById("emailInput");
const ticketPrice = document.getElementById("ticketPrice");
const totalPrice = document.getElementById("totalPrice");
const bookingList = document.getElementById("bookingList");
const bookingCount = document.getElementById("bookingCount");
const searchInput = document.getElementById("searchInput");
const message = document.getElementById("message");
const resetButton = document.getElementById("resetButton");
const bookButton = document.getElementById("bookButton");

let bookings = [];

function getMoviePrice() {
    return Number(movieSelect.value);
}

function updatePrice() {
    const price = getMoviePrice();
    const quantity = Number(ticketQuantity.value) || 0;

    ticketPrice.textContent = `₹${price}`;
    totalPrice.textContent = `₹${price * quantity}`;
}

function showMessage(text, type) {
    message.textContent = text;
    message.className = "message";

    if (type) {
        message.classList.add(type);
    }
}

function displayBookings() {
    bookingList.innerHTML = "";

    const searchText = searchInput.value.trim().toLowerCase();

    const filteredBookings = bookings.filter(function (booking) {
        return (
            booking.movie.toLowerCase().includes(searchText) ||
            booking.email.toLowerCase().includes(searchText) ||
            booking.showtime.toLowerCase().includes(searchText) ||
            booking.id.toLowerCase().includes(searchText)
        );
    });

    bookingCount.textContent = bookings.length;

    if (filteredBookings.length === 0) {
        bookingList.textContent = bookings.length === 0
            ? "No bookings yet."
            : "No matching bookings found.";
        return;
    }

    filteredBookings.forEach(function (booking) {
        const card = document.createElement("div");
        card.className = "booking-card";

        const details = document.createElement("p");
        details.textContent =
            `Booking ID: ${booking.id}\n` +
            `Movie: ${booking.movie}\n` +
            `Showtime: ${booking.showtime}\n` +
            `Tickets: ${booking.quantity}\n` +
            `Price per ticket: ₹${booking.price}\n` +
            `Total: ₹${booking.total}\n` +
            `Email: ${booking.email}`;

        const cancelButton = document.createElement("button");
        cancelButton.type = "button";
        cancelButton.textContent = "Cancel Booking";
        cancelButton.dataset.id = booking.id;

        card.appendChild(details);
        card.appendChild(cancelButton);
        bookingList.appendChild(card);
    });
}

movieSelect.addEventListener("change", updatePrice);
ticketQuantity.addEventListener("input", updatePrice);
searchInput.addEventListener("input", displayBookings);

bookingForm.addEventListener("reset", function () {
    setTimeout(function () {
        updatePrice();
        showMessage("", "");
    }, 0);
});

resetButton.addEventListener("click", function () {
    showMessage("", "");
});

bookingList.addEventListener("click", function (event) {
    const button = event.target.closest("button[data-id]");

    if (!button) {
        return;
    }

    const bookingId = button.dataset.id;

    bookings = bookings.filter(function (booking) {
        return booking.id !== bookingId;
    });

    displayBookings();
    showMessage("Booking removed from this page.", "success");
});

bookingForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    if (!bookingForm.reportValidity()) {
        return;
    }

    if (typeof emailjs === "undefined") {
        showMessage(
            "EmailJS did not load. Check your internet connection and try again.",
            "error"
        );
        return;
    }

    const quantity = Number(ticketQuantity.value);
    const price = getMoviePrice();
    const total = price * quantity;
    const email = emailInput.value.trim();
    const movie = movieSelect.options[movieSelect.selectedIndex].text
        .split(" — ")[0];
    const showtime = showtimeSelect.value;

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
        showMessage("Enter a whole number of tickets between 1 and 20.", "error");
        return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showMessage("Please enter a valid email address.", "error");
        return;
    }

    const bookingId = "MQ" + Date.now();

    const templateParams = {
        to_email: email,
        booking_id: bookingId,
        movie_name: movie,
        showtime: showtime,
        ticket_quantity: quantity,
        ticket_price: price,
        total_price: total
    };

    bookButton.disabled = true;
    bookButton.textContent = "Sending Email...";

    try {
        emailjs.init({
            publicKey: PUBLIC_KEY
        });

        await emailjs.send(
            SERVICE_ID,
            TEMPLATE_ID,
            templateParams
        );

        bookings.push({
            id: bookingId,
            movie: movie,
            showtime: showtime,
            quantity: quantity,
            price: price,
            total: total,
            email: email
        });

        displayBookings();
        bookingForm.reset();
        updatePrice();

        showMessage(
            "Booking successful! EmailJS accepted your confirmation email request.",
            "success"
        );

    } catch (error) {
        console.error("EmailJS error:", error);

        showMessage(
            "Email could not be sent. Check your EmailJS service, template, and browser console.",
            "error"
        );

    } finally {
        bookButton.disabled = false;
        bookButton.textContent = "Book Now";
    }
});

updatePrice();
displayBookings();

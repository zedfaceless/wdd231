// Configuration for API
const config = {
    apiKey: 'e269d26025c33befe2d34e3539a41960',
    city: 'Manila,PH'
};

// Fetch current weather data
fetch(`https://api.openweathermap.org/data/2.5/weather?q=${config.city}&appid=${config.apiKey}&units=metric`)
    .then(response => {
        if (!response.ok) {
            throw new Error('Weather data could not be retrieved.');
        }
        return response.json();
    })
    .then(data => {
        const currentTemp = Math.round(data.main.temp);
        const weatherDescription = data.weather.map(event =>
            event.description.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
        ).join(', ');
        document.getElementById('current-weather').textContent = `${currentTemp}°C, ${weatherDescription}`;
        const { lat, lon } = data.coord;
        return fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${config.apiKey}&units=metric`);
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Forecast data could not be retrieved.');
        }
        return response.json();
    })
    .then(data => {
        const forecastList = document.createDocumentFragment();
        const daysToShow = 3; // Number of days to show
        for (let i = 0; i < daysToShow; i++) {
            const forecast = data.list[i * 8]; // Approx 24-hour intervals
            const forecastTemp = Math.round(forecast.main.temp);
            const forecastDescription = forecast.weather.map(event =>
                event.description.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
            ).join(', ');
            const li = document.createElement('li');
            li.textContent = `Day ${i + 1}: ${forecastTemp}°C, ${forecastDescription}`;
            forecastList.appendChild(li);
        }
        document.getElementById('forecast').appendChild(forecastList);
    })
    .catch(error => {
        console.error('Error fetching weather data:', error);
        document.getElementById('current-weather').textContent = 'Unable to load weather data';
    });
// Initialize calendar variables
let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();

// Event storage
let events = [];
let eventIdCounter = 1;

// Populate month dropdown
const months = [
    "January", "February", "March", "April",
    "May", "June", "July", "August",
    "September", "October", "November", "December"
];

// Populate month dropdown on page load
const monthSelect = document.getElementById("month");
months.forEach((month, index) => {
    monthSelect.innerHTML += `<option value="${index}">${month}</option>`;
});

// Populate year dropdown
const yearSelect = document.getElementById("year");
yearSelect.innerHTML = generateYearRange(1970, 2050);

// Show calendar function
function showCalendar(month, year) {
    const calendar = document.getElementById("calendar").querySelector("tbody");
    calendar.innerHTML = "";
    const monthHeader = document.getElementById("thead-month");
    monthHeader.innerHTML = `<th colspan="7">${months[month]} ${year}</th>`;
    const firstDay = new Date(year, month).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let calendarHTML = "<tr>";

    // Empty cells before the first day of the month
    for (let i = 0; i < firstDay; i++) {
        calendarHTML += "<td></td>";
    }

    // Populate the days of the month
    for (let date = 1; date <= daysInMonth; date++) {
        calendarHTML += `<td>${date}</td>`;
        if ((date + firstDay) % 7 === 0) {
            calendarHTML += "</tr><tr>";
        }
    }
    calendarHTML += "</tr>";
    calendar.innerHTML = calendarHTML;

    // Update month and year display
    document.getElementById("monthAndYear").innerHTML = months[month] + " " + year;

    // Display reminders for the current month
    displayReminders();
}

// Previous month function
function previous() {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    showCalendar(currentMonth, currentYear);
}

// Next month function
function next() {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    showCalendar(currentMonth, currentYear);
}

// Generate year range
function generateYearRange(startYear, endYear) {
    let yearOptions = "";
    for (let year = startYear; year <= endYear; year++) {
        yearOptions += `<option value="${year}">${year}</option>`;
    }
    return yearOptions;
}

// Add event function
function addEvent() {
    let date = document.getElementById("eventDate").value;
    let title = document.getElementById("eventTitle").value;
    let description = document.getElementById("eventDescription").value;

    if (date && title) {
        // Create a unique event ID
        let eventId = eventIdCounter++;
        events.push({
            id: eventId,
            date: date,
            title: title,
            description: description
        });

        showCalendar(currentMonth, currentYear);
        document.getElementById("eventDate").value = "";
        document.getElementById("eventTitle").value = "";
        document.getElementById("eventDescription").value = "";
        displayReminders();
    }
}

// Delete event function
function deleteEvent(eventId) {
    let eventIndex = events.findIndex(event => event.id === eventId);
    if (eventIndex !== -1) {
        events.splice(eventIndex, 1);
        showCalendar(currentMonth, currentYear);
        displayReminders();
    }
}

// Display reminders function
function displayReminders() {
    const reminderList = document.getElementById("reminderList");
    reminderList.innerHTML = "";
    for (let i = 0; i < events.length; i++) {
        let event = events[i];
        let eventDate = new Date(event.date);
        if (eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear) {
            let listItem = document.createElement("li");
            listItem.innerHTML = `<strong>${event.title}</strong> - ${event.description} on ${eventDate.toLocaleDateString()}`;

            // Add a delete button for each reminder item
            let deleteButton = document.createElement("button");
            deleteButton.className = "delete-event";
            deleteButton.textContent = "Delete";
            deleteButton.onclick = function () {
                deleteEvent(event.id);
            };

            listItem.appendChild(deleteButton);
            reminderList.appendChild(listItem);
        }
    }
}
// Initialize calendar on page load
document.addEventListener("DOMContentLoaded", () => {
    showCalendar(currentMonth, currentYear);
    document.getElementById('add-event-button').addEventListener('click', addEvent);

    // Display the last modified date
    const lastModifiedDate = document.lastModified ? new Date(document.lastModified).toLocaleDateString() : 'N/A';
    document.getElementById('last-modified').textContent = lastModifiedDate;
});
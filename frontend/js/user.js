const url = "http://localhost:3000";
const token = localStorage.getItem("token");

const appointmentsList = document.getElementById("appointments-list");
const servicesList = document.getElementById("services-list");
const serviceDropdown = document.getElementById("service-dropdown");
const bookAppointmentForm = document.getElementById("book-appointment-form");

async function fetchAppointments() {
    try {
        const response = await axios.get(`${url}/appointments`, { headers: { Authorization: `${token}` } });
        const appointments = response.data.appointments;
        appointmentsList.innerHTML = "";

        if (appointments.length === 0) {
            appointmentsList.innerHTML = "<li>No appointments found.</li>";
            return;
        }

        appointments.forEach((appointment) => {
            const li = document.createElement("li");
            li.innerHTML = `
                <strong>Date:</strong> ${appointment.date} <br>
                <strong>Time:</strong> ${appointment.time} <br>
                <strong>Service:</strong> ${appointment.serviceName} <br>
                <strong>Status:</strong> ${appointment.status}
            `;
            appointmentsList.appendChild(li);
        });
    } catch (error) {
        console.error("Error fetching appointments:", error);
        appointmentsList.innerHTML = "<li>Error fetching appointments.</li>";
    }
}

async function fetchServices() {
    try {
        const response = await axios.get(`${url}/service`, { headers: { Authorization: `${token}` } });
        const services = response.data.services;
        servicesList.innerHTML = "";
        serviceDropdown.innerHTML = "<option value=''>Select a service</option>";

        if (services.length === 0) {
            servicesList.innerHTML = "<li>No services available.</li>";
            return;
        }

        services.forEach((service) => {
            const li = document.createElement("li");
            li.innerHTML = `
                <p><strong>Staff Name:</strong> ${service.username}</p>
                <p><strong>Service:</strong> ${service.name}</p>
                <p><strong>Price:</strong> ${service.price}</p>
                <p><strong>Duration</strong> ${service.duration} mins</p>
            `;
            servicesList.appendChild(li);

            const option = document.createElement("option");
            option.value = service.id;
            option.setAttribute("data-staff-id", service.staffId);
            option.textContent = service.name;
            serviceDropdown.appendChild(option);
        });
    } catch (error) {
        console.error("Error fetching services:", error);
        servicesList.innerHTML = "<li>Error fetching services.</li>";
    }
}

bookAppointmentForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const service = serviceDropdown.options[serviceDropdown.selectedIndex].textContent;
    console.log(service)
    const serviceId = serviceDropdown.value;
    const staffId = serviceDropdown.options[serviceDropdown.selectedIndex].getAttribute("data-staff-id");
    const date = document.getElementById("appointment-date").value;
    const time = document.getElementById("appointment-time").value;

    if (!serviceId || !date || !time) {
        alert("Please fill in all fields to book an appointment.");
        return;
    }
    const status = "pending";

    try {
        const response = await axios.post(`${url}/appointments`, {
            service,
            staffId,
            serviceId,
            date,
            time,
            status,
        }, { headers: { Authorization: `${token}` } });
        alert("Appointment booked successfully!");
        fetchAppointments();
    } catch (error) {
        console.error("Error booking appointment:", error);
        alert("Failed to book appointment. Please try again.");
    }
});

document.addEventListener("DOMContentLoaded", () => {
    fetchAppointments();
    fetchServices();
});
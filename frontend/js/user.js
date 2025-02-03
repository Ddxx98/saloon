const url = "http://localhost:3000";
const token = localStorage.getItem("token");

const appointmentsList = document.getElementById("appointments-list");
const servicesList = document.getElementById("services-list");
const serviceDropdown = document.getElementById("service-dropdown");
const bookAppointmentForm = document.getElementById("book-appointment-form");
const searchBox = document.getElementById("search-box");
const filteredServicesList = document.getElementById("filtered-services-list");
const appointmentSection = document.getElementById("book-appointment-section");
let selectedRating = 0;

async function fetchAppointments() {
    try {
        const response = await axios.get(`${url}/appointments`, {
            headers: { Authorization: `${token}` },
        });
        const appointments = response.data.appointments;
        const appointmentsTableBody = document.querySelector("#appointments-table tbody");
        appointmentsTableBody.innerHTML = "";

        if (appointments.length === 0) {
            appointmentsTableBody.innerHTML = "<tr><td colspan='6'>No appointments found.</td></tr>";
            return;
        }

        appointments.forEach((appointment) => {
            const date = new Date(appointment.date);
            const format = date.toLocaleString("en-US", { day: "numeric", month: "long", year: "numeric" });
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const status = new Date(appointment.date) < today;
            const isCompleted = appointment.review === false && status === true;

            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${format}</td>
                <td>${appointment.time}</td>
                <td>${appointment.serviceName}</td>
                <td>${appointment.status}</td>
                <td>
                    ${isCompleted
                    ? `<button class="review-btn" data-appointment-id="${appointment.id}" 
                                       data-service="${appointment.serviceName}" 
                                       data-date="${appointment.date}" 
                                       data-time="${appointment.time}"
                                       data-staff-id="${appointment.staffId}">
                                       Write Review
                                   </button>`
                    : status === false ? `
                            <button class="edit-btn" data-appointment-id="${appointment.id}" 
                                    data-service="${appointment.serviceName}" 
                                    data-date="${appointment.date}" 
                                    data-time="${appointment.time}"
                                    data-service-id="${appointment.serviceId}"
                                    data-staff-id="${appointment.staffId}">
                                    Edit
                            </button>
                            <button class="cancel-btn" data-appointment-id="${appointment.id}">
                                Cancel
                            </button>
                        `: `Appointment Finished`
                }
                </td>
            `;
            appointmentsTableBody.appendChild(row);
        });

        document.querySelectorAll(".edit-btn").forEach((button) => {
            button.addEventListener("click", (e) => {
                e.preventDefault();
                const appointment = {
                    id: e.target.dataset.appointmentId,
                    serviceId: e.target.dataset.serviceId,
                    staffId: e.target.dataset.staffId,
                    service: e.target.dataset.service,
                    date: e.target.dataset.date,
                    time: e.target.dataset.time,
                };
                populateAppointmentForm(appointment);
            });
        });

        document.querySelectorAll(".cancel-btn").forEach((button) => {
            button.addEventListener("click", async (e) => {
                e.preventDefault();
                const appointmentId = e.target.dataset.appointmentId;

                try {
                    const response = await axios.delete(`${url}/appointments/${appointmentId}`, {
                        headers: { Authorization: `${token}` },
                    });
                    if (response.status === 200) {
                        alert("Appointment canceled successfully!");
                        fetchAppointments();
                    }
                } catch (error) {
                    console.error("Error canceling appointment:", error);
                    alert("Failed to cancel the appointment. Please try again.");
                }
            });
        });

        document.querySelectorAll(".review-btn").forEach((button) => {
            button.addEventListener("click", (e) => {
                e.preventDefault();
                const appointment = {
                    id: e.target.dataset.appointmentId,
                    staffId: e.target.dataset.staffId,
                    service: e.target.dataset.service,
                    date: e.target.dataset.date,
                    time: e.target.dataset.time,
                };
                openReviewPopup(appointment);
            });
        });
    } catch (error) {
        console.error("Error fetching appointments:", error);
        const appointmentsTableBody = document.querySelector("#appointments-table tbody");
        appointmentsTableBody.innerHTML = "<tr><td colspan='6'>Error fetching appointments.</td></tr>";
        if (error.response.status === 401) {
            window.location.href = "./login.html";
        }
    }
}

function openReviewPopup(appointment) {
    const popup = document.getElementById("review-popup");
    const detailsText = document.getElementById("details-text");
    const submitBtn = document.getElementById("submit-review-btn");

    detailsText.textContent = `Service: ${appointment.service}\nDate: ${new Date(appointment.date).toLocaleDateString()} at ${appointment.time}`;
    submitBtn.dataset.appointmentId = appointment.id;
    submitBtn.dataset.staffId = appointment.staffId;

    popup.classList.add("show");
}

document.getElementById("close-popup").addEventListener("click", () => {
    document.getElementById("review-popup").classList.remove("show");
});

document.querySelectorAll(".star").forEach((star) => {
    star.addEventListener("click", (e) => {
        selectedRating = parseInt(e.target.dataset.value);
        document.querySelectorAll(".star").forEach((s) => {
            s.classList.toggle("selected", parseInt(s.dataset.value) <= selectedRating);
        });
    });

    star.addEventListener("mouseover", (e) => {
        const hoverValue = parseInt(e.target.dataset.value);
        document.querySelectorAll(".star").forEach((s) => {
            s.classList.toggle("selected",  hoverValue >= parseInt(s.dataset.value) );
        });
    });

    star.addEventListener("mouseleave", () => {
        document.querySelectorAll(".star").forEach((s) => {
            s.classList.toggle("selected", parseInt(s.dataset.value) <= selectedRating);
        });
    });
});

document.getElementById("submit-review-btn").addEventListener("click", async (e) => {
    const staffId = e.target.dataset.staffId;
    const appointmentId = e.target.dataset.appointmentId;
    const reviewText = document.getElementById("review-text").value.trim();
    const rating = selectedRating;

    if (!reviewText || rating === 0) {
        alert("Please provide a rating and write a review before submitting!");
        return;
    }

    try {
        const response = await axios.post(`${url}/review`, {
            staffId,
            appointmentId,
            rating,
            review: reviewText,
        }, {
            headers: { Authorization: `${token}` },
        });

        alert("Review submitted successfully!");
        document.getElementById("review-popup").classList.remove("show");
        document.getElementById("review-text").value = "";
        selectedRating = 0;
        document.querySelectorAll(".star").forEach((star) => star.classList.remove("selected"));

        fetchAppointments();
    } catch (error) {
        if (error.response?.status === 401) {
            window.location.href = "./login.html";
        } else {
            console.error("Error submitting review:", error);
            alert("Failed to submit the review. Please try again later.");
        }
    }
});

function populateAppointmentForm(appointment) {
    serviceDropdown.value = appointment.serviceId;
    document.getElementById("appointment-date").value = appointment.date.split("T")[0];
    document.getElementById("appointment-time").value = appointment.time;

    bookAppointmentForm.dataset.editAppointmentId = appointment.id;

    bookAppointmentForm.scrollIntoView({ behavior: "smooth" });
}

async function fetchServices() {
    try {
        const response = await axios.get(`${url}/service`, {
            headers: { Authorization: `${token}` },
        });
        const services = response.data.services;
        setupSearch(services);
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
                <p><strong>Duration</strong> ${service.duration} hour</p>
            `;
            servicesList.appendChild(li);

            const option = document.createElement("option");
            option.value = service.id;
            option.setAttribute("data-staff-id", service.staffId);
            option.setAttribute("data-duration", service.duration);
            option.textContent = service.name;
            serviceDropdown.appendChild(option);
        });
    } catch (error) {
        console.error("Error fetching services:", error);
        servicesList.innerHTML = "<li>Error fetching services.</li>";
        if (error.response.status === 401) {
            window.location.href = "./login.html";
        }
    }
}

function setupSearch(services) {
    searchBox.addEventListener("input", (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filtered = services.filter(
            (service) =>
                service.name.toLowerCase().includes(searchTerm) ||
                service.username.toLowerCase().includes(searchTerm)
        );
        displayFilteredServices(filtered);
    });
}

function displayFilteredServices(services) {
    filteredServicesList.innerHTML = "";

    if (services.length === 0) {
        filteredServicesList.innerHTML = "<li>No matching services found.</li>";
        return;
    }

    services.forEach((service) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <p><strong>Service:</strong> ${service.name}</p>
            <p><strong>Staff:</strong> ${service.username}</p>
            <p><strong>Price:</strong> ₹${service.price}</p>
            <button class="book-btn" data-service-id="${service.id}" data-staff-id="${service.staffId}">
                Book This Service
            </button>
        `;
        filteredServicesList.appendChild(li);
    });

    document.querySelectorAll(".book-btn").forEach((button) => {
        button.addEventListener("click", (e) => {
            const serviceId = e.target.dataset.serviceId;
            const serviceName = e.target.dataset.serviceName;
            const staffId = e.target.dataset.staffId;
            filteredServicesList.innerHTML = "";
            showAppointmentSection(serviceId, serviceName, staffId);
        });
    });
}

function showAppointmentSection(serviceId, serviceName, staffId) {
    appointmentSection.scrollIntoView({ behavior: "smooth" });

    serviceDropdown.value = serviceId;
    serviceDropdown.options[serviceDropdown.selectedIndex].dataset.staffId = staffId;

}

bookAppointmentForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const service = serviceDropdown.options[serviceDropdown.selectedIndex].textContent;
    const serviceId = serviceDropdown.value;
    const staffId = serviceDropdown.options[serviceDropdown.selectedIndex].getAttribute("data-staff-id");
    const duration = serviceDropdown.options[serviceDropdown.selectedIndex].getAttribute("data-duration");
    const date = document.getElementById("appointment-date").value;
    const time = document.getElementById("appointment-time").value;

    if (!serviceId || !date || !time) {
        alert("Please fill in all fields to book or update an appointment.");
        return;
    }

    const isEditing = bookAppointmentForm.dataset.editAppointmentId;

    try {
        if (isEditing) {
            const appointmentId = bookAppointmentForm.dataset.editAppointmentId;
            const response = await axios.put(
                `${url}/appointments/${appointmentId}`,
                { serviceId, staffId, date, time, status: "Confirmed", duration },
                { headers: { Authorization: `${token}` } }
            );
            if (response.status === 200) {
                alert("Appointment updated successfully!");
                bookAppointmentForm.reset();
                fetchAppointments();
            }
        } else {
            const payResponse = await axios.post(
                `${url}/pay`,
                { service, staffId, serviceId, date, time },
                { headers: { Authorization: `${token}` } }
            );

            if (payResponse.status === 200) {
                const options = {
                    key: payResponse.data.key_id,
                    amount: payResponse.data.order.amount,
                    currency: "INR",
                    name: "Salon",
                    description: "Pay for your appointment",
                    order_id: payResponse.data.order.id,
                    handler: async function (response) {
                        try {
                            const paymentVerificationResponse = await axios.put(
                                `${url}/pay`,
                                {
                                    orderId: response.razorpay_order_id,
                                    paymentId: response.razorpay_payment_id,
                                },
                                { headers: { Authorization: token } }
                            );

                            if (paymentVerificationResponse.status === 200) {
                                const appointmentResponse = await axios.post(
                                    `${url}/appointments`,
                                    { service, serviceId, staffId, date, time, status: "Confirmed", duration },
                                    { headers: { Authorization: `${token}` } }
                                );

                                if (appointmentResponse.status === 200) {
                                    alert("Appointment booked successfully!");
                                    fetchAppointments();
                                }
                            }
                        } catch (error) {
                            console.error("Error verifying payment:", error);
                            alert("Payment verification failed. Please contact support.");
                        }
                    },
                };
                const rzp1 = new Razorpay(options);
                rzp1.open();
            }
            bookAppointmentForm.reset();
        }
    } catch (error) {
        console.error("Error booking or updating appointment:", error);
        alert("Failed to process your request. Please try again.");
        if (error.response.status === 400) {
            alert(error.response.data.message);
        }
        if (error.response.status === 401) {
            window.location.href = "./login.html";
        }
    }
});

document.addEventListener("DOMContentLoaded", () => {
    fetchAppointments();
    fetchServices();
});
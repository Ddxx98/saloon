const url = "http://localhost:3000";
const token = localStorage.getItem("token");

document.addEventListener("DOMContentLoaded", async () => {
    const staffServicesTable = document.querySelector("#staff-services-table tbody");
    const allStaffServicesTable = document.querySelector("#all-staff-services-table tbody");
    const appointmentsList = document.querySelector("#appointments-table tbody");
    const reviewsTableBody = document.querySelector("#reviews-table tbody");

    async function fetchStaffAndServices() {
        try {
            const staffResponse = await axios.get(`${url}/staff`, { headers: { Authorization: `${token}` } });
            const staff = staffResponse.data.staffs;
            return staff;
        } catch (err) {
            if (err.response.status === 401) {
                window.location.href = "./login.html";
            }
            console.log(err);
        }
    }

    async function fetchAllAssignedServices() {
        try {
            const response = await axios.get(`${url}/service`, { headers: { Authorization: `${token}` } });
            return response.data.services;
        } catch (err) {
            if (err.response.status === 401) {
                window.location.href = "./login.html";
            }
            console.log(err);
        }

    }

    async function renderStaffServices() {
        const staffServices = await fetchStaffAndServices();

        if (staffServices.length === 0) {
            staffServicesTable.innerHTML = `<tr><td colspan="5">No staff or services available.</td></tr>`;
            return;
        }

        staffServicesTable.innerHTML = staffServices
            .filter((staff) => staff.status === "available")
            .map((staff) => `
                        <tr>
                            <td>${staff.name}</td>
                            <td>${staff.specialization}</td>
                            <td>${staff.start_time} mins</td>
                            <td>${staff.end_time} mins</td>
                            <td><input type="number" id="setDuration" min = "0" placeholder="Duration" data-service-id="${staff.id}" /></td>
                            <td><input type="number" id="setPrice" min ="0" placeholder="Set Price" data-service-id="${staff.id}" /></td>
                            <td><button data-staff-name="${staff.name}" data-staff-service="${staff.specialization}" data-staff-id="${staff.id}">Assign</button></td>
                        </tr>
                    `)
            .join("");

        document.querySelectorAll("button").forEach((button) => {
            button.addEventListener("click", async (e) => {
                const staffId = e.target.dataset.staffId;
                const priceInput = e.target.closest("tr").querySelector("#setPrice").value;
                const durationInput = e.target.closest("tr").querySelector("#setDuration").value;
                const username = e.target.dataset.staffName;
                const name = e.target.dataset.staffService;

                if (!priceInput) {
                    alert("Please enter a valid price.");
                    return;
                } else if (!durationInput) {
                    alert("Please enter a valid duration.");
                    return;
                }

                await axios.post(`${url}/service`, {
                    username,
                    name,
                    staffId,
                    price: priceInput,
                    duration: durationInput
                }, { headers: { Authorization: `${token}` } });

                alert("Service assigned successfully!");

                renderAllAssignedServices();
                renderStaffServices();
            });
        });
    }

    async function renderAllAssignedServices() {
        const allAssignedServices = await fetchAllAssignedServices();

        if (allAssignedServices.length === 0) {
            allStaffServicesTable.innerHTML = `<tr><td colspan="4">No services assigned yet.</td></tr>`;
            return;
        }

        allStaffServicesTable.innerHTML = allAssignedServices
            .map((service) => `
                <tr>
                    <td>${service.username}</td>
                    <td>${service.name}</td>
                    <td>${service.duration} hour</td>
                    <td>₹${service.price}</td>
                </tr>
            `
            )
            .join("");
    }

    async function renderAppointments() {
        try {
            const response = await axios.get(`${url}/appointments`, { headers: { Authorization: `${token}` } });
            const appointments = response.data.appointments;

            if (appointments.length === 0) {
                appointmentsList.innerHTML = '<p>No appointments scheduled yet.</p>';
                return;
            }

            appointmentsList.innerHTML = appointments
                .map((appointment) => `
                <tr>
                    <td>${appointment.customer}</td>
                    <td>${appointment.serviceName}</td>
                    <td>${new Date(appointment.date).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}</td>
                    <td>${appointment.time}</td>
                    <td>${appointment.status}</td>
                </tr>
            `)
                .join("");
        } catch (err) {
            if (err.response.status === 401) {
                window.location.href = "./login.html";
            }
            console.log(err);
        }
    }

    async function renderReviews() {
        try {
            const response = await axios.get(`${url}/review`, { headers: { Authorization: `${token}` } });
            const reviews = response.data;
    
            reviewsTableBody.innerHTML = "";
    
            if (reviews.length === 0) {
                reviewsTableBody.innerHTML = `<tr><td colspan="4">No reviews available.</td></tr>`;
            } else {
                reviews.forEach((review) => {
                    const row = `
                        <tr>
                            <td>${review.userId}</td>
                            <td>${review.review}</td>
                            <td>${review.rating} / 5</td>
                            <td>${new Date(review.createdAt).toLocaleDateString()}</td>
                        </tr>
                    `;
                    reviewsTableBody.innerHTML += row;
                });
            }
        } catch (error) {
            console.error("Error fetching reviews:", error);
            reviewsTableBody.innerHTML = `<tr><td colspan="4">Failed to load reviews.</td></tr>`;
        }
    }


    await renderStaffServices();
    await renderAllAssignedServices();
    await renderAppointments();
    await renderReviews();
});
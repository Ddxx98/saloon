const availableSpecializations = [
    'Haircut',
    'Hair Coloring',
    'Facial',
    'Manicure',
    'Pedicure',
    'Massage',
];

const token = localStorage.getItem('token');

const appointmentsList = document.getElementById('appointments-list');
const specializationsDropdown = document.getElementById('specializations-dropdown');
const preferencesList = document.getElementById('preferences-list');
const savePreferencesButton = document.getElementById('save-preferences');
const startTimeInput = document.getElementById('start-time');
const endTimeInput = document.getElementById('end-time');
const url = 'http://localhost:3000';

function renderAppointments(appointments) {
    appointmentsList.innerHTML = '';
    appointments.forEach(appointment => {
        const li = document.createElement('li');
        li.innerHTML = `
            <strong>Date:</strong> ${new Date(appointment.date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })} <br>
            <strong>Time:</strong> ${appointment.time} <br>
            <strong>Service:</strong> ${appointment.serviceName} <br>
            <strong>Customer:</strong> ${appointment.customer}
        `;
        appointmentsList.appendChild(li);
    });
}

function populateSpecializationsDropdown() {
    specializationsDropdown.innerHTML = '<option value="">Select a specialization</option>';
    availableSpecializations.forEach(spec => {
        const option = document.createElement('option');
        option.value = spec;
        option.textContent = spec;
        specializationsDropdown.appendChild(option);
    });
}

savePreferencesButton.addEventListener('click', async () => {
    const selectedSpecialization = specializationsDropdown.value;
    const startTime = startTimeInput.value;
    const endTime = endTimeInput.value;

    if (!selectedSpecialization) {
        alert('Please add at least one specialization');
        return;
    } else if (!startTime || !endTime) {
        alert('Please add at least one availability');
        return;
    }

    if (preferencesList.innerHTML.includes('No availability or specializations')) {
        preferencesList.innerHTML = '';
    }

    const li = document.createElement('li');
    if (selectedSpecialization) {
        li.innerHTML = `<strong>Specialization:</strong> ${selectedSpecialization}`;
        const index = availableSpecializations.indexOf(selectedSpecialization);
        if (index > -1) availableSpecializations.splice(index, 1);
        populateSpecializationsDropdown();
    }
    if (startTime && endTime) {
        li.innerHTML += `<br><strong>Availability:</strong> ${startTime} - ${endTime}`;
    }
    preferencesList.appendChild(li);
    try {
        const response = await axios.post(`${url}/staff`, { specialization: selectedSpecialization, start_time: startTime, end_time: endTime },
            { headers: { Authorization: `${token}` } });
    } catch (err) {
        if(err.response.status === 401) {
            window.location.href = "./login.html";
        }
        console.log(err);
    }

    startTimeInput.value = '';
    endTimeInput.value = '';
});

async function loadAppointments() {
    try {
        const response = await axios.get(`${url}/appointments`, { headers: { Authorization: `${token}` } });
        const appointments = response.data.appointments;
        if (appointments.length === 0) {
            appointmentsList.innerHTML = '<li>No appointments scheduled yet.</li>';
            return;
        }
        renderAppointments(response.data.appointments);
    } catch (err) {
        if(err.response.status === 401) {
            window.location.href = "./login.html";
        }
        console.log(err);
    }
}

async function loadPreferences() {
    try {
        const response = await axios.get(`${url}/staff/staff`, { headers: { Authorization: `${token}` } });
        renderPreferences(response.data.staffs);
    } catch (err) {
        console.log(err);
    }
}

function renderPreferences(preferences) {
    preferencesList.innerHTML = '';
    if (preferences.length === 0) {
        preferencesList.innerHTML = '<li>No availability or specializations</li>';
    } else {
        preferences.forEach(pref => {
            const index = availableSpecializations.indexOf(pref.specialization);
            if (index > -1) availableSpecializations.splice(index, 1);
            populateSpecializationsDropdown();
            const li = document.createElement('li');
            li.innerHTML = `
                <strong>Specialization:</strong> ${pref.specialization} <br>
                <strong>Availability:</strong> ${pref.start_time} - ${pref.end_time}
            `;
            preferencesList.appendChild(li);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadAppointments();
    loadPreferences();
    populateSpecializationsDropdown();
});
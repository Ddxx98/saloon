document.getElementById('signup-form').addEventListener('submit', async function(event) {
    event.preventDefault();
    const url = 'http://localhost:3000';

    let hasError = false;

    document.getElementById('name-error').textContent = '';
    document.getElementById('email-error').textContent = '';
    document.getElementById('phone-error').textContent = '';
    document.getElementById('role-error').textContent = '';
    document.getElementById('password-error').textContent = '';
    document.getElementById('confirm-password-error').textContent = '';
    document.getElementById('server-error').style.display = 'none';

    const name = document.getElementById('name').value.trim();
    if (name === '') {
        document.getElementById('name-error').textContent = 'Full name is required.';
        hasError = true;
    }

    const email = document.getElementById('email').value.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        document.getElementById('email-error').textContent = 'Please enter a valid email address.';
        hasError = true;
    }

    const phone = document.getElementById('phone').value.trim();
    if (!/^[0-9]{10}$/.test(phone)) {
        document.getElementById('phone-error').textContent = 'Please enter a valid 10-digit phone number.';
        hasError = true;
    }

    const role = document.getElementById('role').value;
    if (role === '') {
        document.getElementById('role-error').textContent = 'Please select a role.';
        hasError = true;
    }

    const password = document.getElementById('password').value;
    if (password.length < 6) {
        document.getElementBy.getElementById('password-error').textContent = 'Password must be at least 6 characters long.';
        hasError = true;
    }

    const confirmPassword = document.getElementById('confirm-password').value;
    if (confirmPassword !== password) {
        document.getElementById('confirm-password-error').textContent = 'Passwords do not match.';
        hasError = true;
    }

    if (!hasError) {
        try{
            const response = await axios.post(`${url}/signup`, { name, email, phone, password, role });
            console.log(response.data);
            document.getElementById('signup-form').reset();
            window.location.href = `./login.html`;
        } catch(err) {
            console.log(err);
            if(err.response.status === 409) {
                document.getElementById('email-error').textContent = 'Email already exists.';
            } else {
                document.getElementById('server-error').style.display = 'block';
            }
        }
    }
});
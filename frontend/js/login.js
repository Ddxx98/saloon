document.getElementById('login-form').addEventListener('submit', async function(event) {
    event.preventDefault();
    const url = 'http://localhost:3000';

    let hasError = false;

    document.getElementById('email-error').textContent = '';
    document.getElementById('password-error').textContent = '';

    const email = document.getElementById('email').value.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        document.getElementById('email-error').textContent = 'Please enter a valid email address.';
        hasError = true;
    }

    const password = document.getElementById('password').value;
    if (password === '') {
        document.getElementById('password-error').textContent = 'Password is required.';
        hasError = true;
    }

    if (!hasError) {
        try{
            const response = await axios.post(`${url}/login`, { email, password });
            console.log(response.data);
            document.getElementById('login-form').reset();
            window.localStorage.setItem('token', response.data.token);
            const role = response.data.role;
            if(role === 'customer') {
                window.location.href = `./user.html`;
            } else if(role === 'admin') {
                window.location.href = `./admin.html`;
            }else if(role === 'staff') {
                window.location.href = `./staff.html`;
            }
        } catch(err) {
            console.log(err);
            if(err.response.status === 404) {
                document.getElementById('email-error').textContent = 'User not found.';
            } else if(err.response.status === 401) {
                document.getElementById('password-error').textContent = 'Invalid password.';
            } else {
                document.getElementById('server-error').textContent = 'Internal Server Error';
            }
        }
    }
});
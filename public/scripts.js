const loginButton =document.getElementById('login-button')
const signupButton =document.getElementById('signup-button')

loginButton.addEventListener('click', async (e) => {
    e.preventDefault();
    const email = document.getElementById('exampleInputEmail1').value;
    const password = document.getElementById('exampleInputPassword1').value;
    const data = {
        email: email,
        password: password
    };

    try {
        const response = await fetch('/gaians/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            const result = await response.json();
            console.log("Logged in", result);
        } else {
            const errorData = await response.json();
            console.log("Error", errorData.message);
        }

    } catch (error) {
        console.log(error);
    }
});

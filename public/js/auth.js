document.getElementById("registerForm").addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const errorMessage = document.getElementById("errorMessage");

    errorMessage.textContent = "";

    if (!email.includes("@") || !email.includes(".")) {
        errorMessage.textContent = "Enter a valid email.";
        return;
    }

    if (password.length < 6) {
        errorMessage.textContent = "Password must be at least 6 characters.";
        return;
    }

    if (password !== confirmPassword) {
        errorMessage.textContent = "Passwords do not match.";
        return;
    }


    window.location.href = "dashboard.html";
});



// LOGIN FORM LOGIC (Mock until backend is ready)


const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const error = document.getElementById("loginError");

        error.textContent = "";

        if (!email.includes("@") || !email.includes(".")) {
            error.textContent = "Invalid email format.";
            return;
        }

        if (password.length < 1) {
            error.textContent = "Password required.";
            return;
        }

        

        // Redirect to dashboard
        window.location.href = "dashboard.html";
    });
}

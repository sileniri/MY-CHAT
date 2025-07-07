const userID = localStorage.getItem("userID");
const user = localStorage.getItem("user");
const password = localStorage.getItem("password");
const firstTime = !localStorage.getItem("hasUser");
const serverURL = "http://localhost:8080";
console.log("Line 5");

console.log("localTheme", localStorage.getItem("theme"), Boolean(localStorage.getItem("theme")));

if (!Boolean(localStorage.getItem("theme"))) {
    localStorage.setItem("theme", "dark");
}
changeTheme();

function changeTheme() {
    document.querySelector("html").setAttribute("data-theme", localStorage.getItem("theme"));
}

// Checks if logged in
if (!user && !(location.href.includes("login") || location.href.includes("signup"))) {
    console.log("firstTime?", firstTime, "allowed", !user && !location.pathname.includes("signup"));
    if (firstTime) {
        location.pathname = "client/signup";
    } else if (!firstTime) {
        location.pathname = "client/login";
    }
} else if (user && (location.href.includes("login") || location.href.includes("signup"))) {
    location.href = "..";
}
console.log("firstTime?", firstTime, "allowed", !user && !location.pathname.includes("signup"));
console.log(user);

// CODE FOR MAIN SITE

function logout() {
    for (let item of ["userID", "user", "password"]) {
        localStorage.removeItem(item);
    }
    location.reload();
}

if (location.pathname === "/client/") {
    document.querySelector("#logout").addEventListener("click", () => {
        logout();
    });
    document.querySelector("#settings").addEventListener("click", () => {
        location.href = "./settings";
    });

    //  GET request using fetch()
    fetch(serverURL + "/api/messages")
    // Converting received data to JSON
    .then((response) => response.json())
    .then((json) => {
        console.log(json);

        // Create a variable to store HTML
        const container = document.querySelector("#messages");

        // Loop through each data and add a table row
        let lastElemUser;
        json.forEach((message) => {
            if (user !== message.user) {
                if (message.user === lastElemUser) {
                    container.innerHTML += `<div class="message">
                                      <p class="body" data-user="${message.user}">${message.message}</p>
                                    </div>`;
                } else {
                    container.innerHTML += `<div class="message newuser">
                                      <p class="body" data-user="${message.user}">${message.message}</p>
                                    </div>`;
                }
            } else {
                container.innerHTML += `<div class="message user">
                                      <p class="body" data-user="${message.user}">${message.message}</p>
                                    </div>`;
            }
            lastElemUser = message.user;
        });

        scroll();
    });

    function sendMessageData(data) {
        if (data[1].length < 1) return console.log("Missing data");
        // POST request using fetch()
        fetch(serverURL + "/api/messages", {
            // Adding method type
            method: "POST",

            // Adding body or contents to send
            body: JSON.stringify({username: data[0], messageBody: data[1], userID: userID}),

            // Adding headers to the request
            headers: {
                "Content-type": "application/json; charset=UTF-8",
            },
        })
        // Converting to JSON
        .then((response) => response.json())

        // Displaying results to console
        .then((json) => {
            console.log(json);
        });
    }
    const messageInput = document.querySelector("#message");
    document.querySelector("#send").addEventListener("click", () => {
        sendMessageData([user, messageInput.value]);
    });

    messageInput.addEventListener("keydown", (evt) => {
        if (evt.key === "Enter") {
            sendMessageData([user, messageInput.value]);
        }
    });

    function scroll() {
        console.log("Scrolling...");
        window.scrollTo(0, document.body.scrollHeight || document.documentElement.scrollHeight);
        console.log("Done");
    }
}

// CODE FOR LOGIN

if (location.href.includes("login")) {
    function login(username, password) {
        fetch(serverURL + "/api/login", {
            // Adding method type
            method: "POST",
            // Adding body or contents to send
            body: JSON.stringify({username: username, password: password}),
            // Adding headers to the request
            headers: {
                "Content-type": "application/json; charset=UTF-8",
            },
        })
        // Converting to JSON
        .then((response) => response.json())
        // Displaying results to console
        .then((json) => {
            console.log(json);
            if (json.user) {
                localStorage.setItem("hasUser", true);
                localStorage.setItem("userID", json.userID);
                localStorage.setItem("user", json.user);
                localStorage.setItem("password", json.password);
                location.href = "..";
            }
        });
    }
    const username = document.querySelector("#username");
    const password = document.querySelector("#password");
    document.querySelector("#login-btn").addEventListener("click", () => {
        login(username.value, password.value);
    });
}

// CODE FOR SIGNUP

if (location.href.includes("signup")) {
    function login(username, password) {
        fetch(serverURL + "/api/signup", {
            // Adding method type
            method: "POST",
            // Adding body or contents to send
            body: JSON.stringify({username: username, password: password}),
            // Adding headers to the request
            headers: {
                "Content-type": "application/json; charset=UTF-8",
            },
        })
        // Converting to JSON
        .then((response) => response.json())
        // Displaying results to console
        .then((json) => {
            console.log("json", json);

            if (json.user) {
                localStorage.setItem("hasUser", true);
                localStorage.setItem("userID", json.userID);
                localStorage.setItem("user", json.user);
                localStorage.setItem("password", json.password);
                location.href = "..";
            }
            console.log(json.message + ": " + json.user);
        });
    }
    const username = document.querySelector("#username");
    const password = document.querySelector("#password");
    document.querySelector("#signup-btn").addEventListener("click", () => {
        login(username.value, password.value);
    });
}

if (location.pathname.includes("settings")) {
    document.querySelector("#exit-settings").addEventListener("click", () => {
        location.href = "/client";
    });
}
console.log("line 185");

if (location.pathname.includes("account")) {
    function updateAccount(username, password) {
        console.log("Updating...");

        fetch(serverURL + `/api/update/${userID}`, {
            // Adding method type
            method: "PUT",
            // Adding body or contents to send
            body: JSON.stringify({username: username, password: password}),
            // Adding headers to the request
            headers: {
                "Content-type": "application/json; charset=UTF-8",
            },
        })
        // Converting to JSON
        .then((response) => response.json())
        // Displaying results to console
        .then((json) => {
            console.log(json);
            if (json.user) {
                localStorage.setItem("hasUser", true);
                localStorage.setItem("user", json.user);
                localStorage.setItem("password", json.password);
            }
            console.log("done");
        });
    }
    document.querySelector("p.userid").innerHTML = `UserID: &nbsp; <code>${userID}</code>`;
    document.querySelector("p.username").innerHTML = `Username: &nbsp; <code>${user}</code>`;
    document.querySelector("p.password").innerHTML = `Password: &nbsp; <code>${password}</code>`;
    const usernameInput = document.querySelector("input.username");
    usernameInput.value = user;
    const passwordInput = document.querySelector("input.password");
    passwordInput.value = password;
    document.querySelector("#update-btn").addEventListener("click", () => {
        updateAccount(usernameInput.value, passwordInput.value);
    });

    function deleteAccount() {
        if (
            confirm(
                "Are you sure you want to permanently delete this account. Please note: this also deletes all your messages."
            )
        ) {
            fetch(serverURL + `/api/delete/${userID}`, {method: "DELETE"})
            .then((response) => response.json())
            .then((json) => {
                logout();
            });
        }
    }

    document.querySelector("#delete-account").addEventListener("click", deleteAccount);
}

if (location.pathname.includes("theme")) {
    const themeBtn = document.querySelector("#theme");
    updateThemeBtn(themeBtn);
    themeBtn.addEventListener("click", () => {
        if (localStorage.getItem("theme") === "dark") {
            localStorage.setItem("theme", "light");
        } else {
            localStorage.setItem("theme", "dark");
        }
        changeTheme();
        updateThemeBtn(themeBtn);
    });
}

function updateThemeBtn(btn) {
    const btnText = btn.querySelector("span");
    if (localStorage.getItem("theme") === "dark") {
        btnText.innerHTML = "dark_mode";
    } else {
        btnText.innerHTML = "light_mode";
    }
}

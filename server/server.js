const express = require("express");
const db = require("./database.js");
const app = express();
const port = process.env.PORT || 8080;
const cors = require("cors");


app.use(
    cors({
        origin: "https://my-chat-hagk.onrender.com",
        methods: "*",
    })
);

app.use(express.json());

// To reset db tables (for testing)
app.get("/dev/reset/:type", (req, res) => {
    let sql = db.prepare(`DELETE FROM ${req.params.type}`);
    sql.run();

    sql = `SELECT * FROM ${req.params.type}`;
    const items = db.prepare(sql).all();
    res.status(200).json({type: items.length > 0});
});

// Messages;
app.post("/api/messages", (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");
    const sql = db.prepare(`INSERT INTO messages(user, message, userID) VALUES(?, ?, ?)`);
    sql.run(req.body.username, req.body.messageBody, req.body.userID);
    res.status(200).json("OK");
});

app.get("/api/messages", (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");
    const sql = `SELECT * FROM messages`;
    const messages = db.prepare(sql).all();
    res.status(200).json(messages);
});

// Login || Signup
app.post("/api/login", (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");
    const sql = `SELECT id FROM accounts WHERE username = '${req.body.username}' AND password = '${req.body.password}'`;
    const validUser = db.prepare(sql).all();

    if (validUser.length > 0) {
        res.status(200).json({
            userID: validUser[0].id,
            user: req.body.username,
            password: req.body.password,
        });
    } else {
        res.status(404).json("Account not found");
    }
});

app.get("/api/signup", (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");
    let sql = `SELECT * FROM accounts`;
    const available = db.prepare(sql).all();
    res.json(available);
});

function avialableUsername(username, extrasql) {
    let sql = `SELECT * FROM accounts WHERE username = '${username}'`;
    if (!!extrasql) {
        sql += extrasql;
    }
    const available = db.prepare(sql).all();
    return !available.length > 0;
}

app.post("/api/signup", (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");
    const available = avialableUsername(req.body.username, null);
    if (available) {
        const sql = db.prepare(`INSERT INTO accounts(username, password) VALUES(?, ?)`);

        sql.run(req.body.username, req.body.password);
        const id = db.prepare(`SELECT * FROM accounts WHERE username = '${req.body.username}'`).all();
        res.status(201).json({
            message: "Created account",
            user: req.body.username,
            password: req.body.password,
            userID: id[0].id,
        });
    } else {
        res.status(406).json("Username already taken");
    }
});

// Update account

app.put("/api/update/:userID", (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");
    console.log(req.body);
    const available = avialableUsername(req.body.username, `AND id <> ${req.params.userID}`);
    if (available) {
        let sql = db.prepare(
            `UPDATE accounts SET username = '${req.body.username}', password = '${req.body.password}' WHERE id = '${req.params.userID}'`
        );
        sql.run();
        sql = db
        .prepare(
            `UPDATE messages SET user = '${req.body.username}' WHERE id IN (SELECT id FROM messages WHERE userID = '${req.params.userID}')`
        )
        .run();
        res.status(200).json({user: req.body.username, password: req.body.password});
    } else {
        res.status(406).json("Username already taken");
    }
});

// Delete account

app.delete("/api/delete/:userID", (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");
    let sql = db.prepare(`DELETE FROM accounts WHERE id = '${req.params.userID}'`);
    sql.run();
    sql = db.prepare(
        `DELETE FROM messages WHERE id IN (SELECT id FROM messages WHERE userID = '${req.params.userID}')`
    );
    sql.run();
    res.status(200).json("WOW");
});

app.listen(port, (err) => {
    if (err) return console.error(err.message);
    console.log("Server started on port " + port);
});

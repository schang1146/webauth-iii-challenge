const router = require("express").Router();
const bcrypt = require("bcryptjs");
const secrets = require("../config/secrets.js");
const jwt = require("jsonwebtoken");

const Users = require("../users/users-model.js");

router.post("/register", (req, res) => {
    const user = req.body;

    const hash = bcrypt.hashSync(user.password, 10);
    user.password = hash;

    Users.add(user)
        .then(res.status(201).json(user))
        .catch(err => res.status(500).json({ message: "Now, young Skywalker, you will die.", err }));
});

router.post("/login", (req, res) => {
    const { username, password } = req.body;

    Users.findBy({ username })
        .first()
        .then(user => {
            if (user && bcrypt.compareSync(password, user.password)) {
                const token = genToken(user);

                res.status(200).json({
                    message: `Welcome ${username}!`,
                    token
                });
            } else {
                res.status(401).json({ message: "It's a trap!" });
            }
        })
        .catch(err => res.status(500).json({ message: "Now, young Skywalker, you will die.", err }));
});

router.delete("/logout", (req, res) => {
    if (req.session) {
        req.session.destroy((err) => {
            if (err) {
                res.status(400).send("Unable to logout...");
            } else {
                res.send("Signed out!");
            }
        })
    } else {
        res.end();
    }
})

function genToken(user) {
    const payload = {
        subject: "username",
        username: user.username
    };

    const secret = secrets.jwtSecret;

    const options = {
        expiresIn: "1h"
    };

    return jwt.sign(payload, secret, options);
}

module.exports = router;

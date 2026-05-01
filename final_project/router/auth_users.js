const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");

const authenticated_users = express.Router();


// Users array
let users = [];

// ✅ DEFINE isValid FIRST
const isValid = (username) => {
    return !users.some(user => user.username === username);
};

// ✅ Authentication check
const authenticatedUser = (username, password) => {
    return users.some(user => user.username === username && user.password === password);
};

// ✅ Login route
authenticated_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }

    if (authenticatedUser(username, password)) {
        let accessToken = jwt.sign(
            { data: username },
            "access",
            { expiresIn: 60 * 60 }
        );

        req.session.authorization = {
            accessToken,
            username
        };

        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add/Modify review
authenticated_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;
    const username = req.session.authorization.username;

    // Check if book exists
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    // Add or update review
    books[isbn].reviews[username] = review;

    return res.status(200).json({ message: "Review added/updated successfully" });
});

// Delete review
authenticated_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization.username;

    // Check if book exists
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    // Check if user has a review
    if (books[isbn].reviews[username]) {
        delete books[isbn].reviews[username];
        return res.status(200).json({ message: "Review deleted successfully" });
    } else {
        return res.status(404).json({ message: "No review found for this user" });
    }
});

// ✅ EXPORT EVERYTHING CORRECTLY
module.exports = {
    authenticated: authenticated_users,
    users,
    isValid,
    authenticatedUser
};

const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');


public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if username and password are provided
    if (!username || !password) {
        return res.status(404).json({ message: "Username and password required" });
    }

    // Check if username already exists
    if (!isValid(username)) {
        return res.status(404).json({ message: "User already exists" });
    }

    // Add new user
    users.push({ username: username, password: password });

    return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
    try {
        const response = await axios.get("http://localhost:5000/");
        return res.send(response.data);
    } catch (error) {
        return res.status(500).json({ message: "Error fetching books" });
    }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
    const isbn = req.params.isbn;

    try {
        const book = await new Promise((resolve, reject) => {
            if (books[isbn]) {
                resolve(books[isbn]);
            } else {
                reject("Book not found");
            }
        });

        return res.send(JSON.stringify(book, null, 4));
    } catch (error) {
        return res.status(404).json({ message: error });
    }
});
  
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;
    let filteredBooks = {};

    // Get all book keys (ISBNs)
    let keys = Object.keys(books);

    // Iterate and match author
    keys.forEach(key => {
        if (books[key].author === author) {
            filteredBooks[key] = books[key];
        }
    });

    return res.send(JSON.stringify(filteredBooks, null, 4));
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title;
    let filteredBooks = {};

    let keys = Object.keys(books);

    keys.forEach(key => {
        if (books[key].title === title) {
            filteredBooks[key] = books[key];
        }
    });

    return res.send(JSON.stringify(filteredBooks, null, 4));
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    return res.send(JSON.stringify(books[isbn].reviews, null, 4));
});

module.exports.general = public_users;

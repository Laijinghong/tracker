const express = require('express');
const mysql = require('mysql2');
const multer = require('multer');
const app = express();

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images'); // Directory to save uploaded files
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

// Create MySQL connection
const connection = mysql.createConnection({
    host: 'mysql-jinghonggg.alwaysdata.net',
    user: '371309',
    password: 'jinghong060430',
    database: 'jinghonggg_project'
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// Set up view engine
app.set('view engine', 'ejs');

// Enable static files
app.use(express.static('public'));

// Enable form processing
app.use(express.urlencoded({ extended: false }));

// Define routes
// Route to display all users
app.get('/', (req, res) => {
    connection.query('SELECT * FROM users', (error, results) => {
        if (error) throw error;
        res.render('index', { users: results });
    });
});

// Route to display user details by ID
app.get('/user/:id', (req, res) => {
    const userId = req.params.id;
    connection.query('SELECT * FROM users WHERE recordID = ?', [userId], (error, results) => {
        if (error) throw error;
        if (results.length > 0) {
            res.render('user', { user: results[0] });
        } else {
            res.status(404).send('User not found');
        }
    });
});

// Route to display the addUser.ejs page
app.get('/addUser', (req, res) => {
    res.render('addUser');
});

// Route to handle the addition of a new user
app.post('/addUser', upload.single('image'), (req, res) => {
    const { user, dob, height, weight, bloodpressure } = req.body;
    let image = req.file ? `/images/${req.file.filename}` : null;

    const sql = 'INSERT INTO users (user, dob, height, weight, bloodpressure, image) VALUES (?, ?, ?, ?, ?, ?)';

    connection.query(sql, [user, dob, height, weight, bloodpressure, image], (error, results) => {
        if (error) {
            console.error("Error adding user:", error);
            return res.status(500).send('Error adding user');
        } else {
            res.redirect('/');
        }
    });
});

// Route to display the editUser.ejs page
app.get('/editUser/:id', (req, res) => {
    const userId = req.params.id;
    const sql = 'SELECT * FROM users WHERE recordID = ?';

    connection.query(sql, [userId], (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error retrieving user by ID');
        }

        if (results.length > 0) {
            res.render('editUser', { user: results[0] });
        } else {
            res.status(404).send('User not found');
        }
    });
});

// Route to handle the editing of a user
app.post('/editUser/:id', upload.single('image'), (req, res) => {
    const userId = req.params.id;
    const { user, dob, height, weight, bloodpressure } = req.body;
    let image = req.body.currentImage; // Retrieve current image filename

    if (req.file) {
        image = `/images/${req.file.filename}`; // Set image to be new image filename
    }

    const sql = 'UPDATE users SET user = ?, dob = ?, height = ?, weight = ?, bloodpressure = ?, image = ? WHERE recordID = ?';

    connection.query(sql, [user, dob, height, weight, bloodpressure, image, userId], (error, results) => {
        if (error) {
            console.error("Error updating user:", error);
            return res.status(500).send('Error updating user');
        } else {
            res.redirect('/');
        }
    });
});

// Route to handle the deletion of a user
app.get('/deleteUser/:id', (req, res) => {
    const userId = req.params.id;
    const sql = 'DELETE FROM users WHERE recordID = ?';

    connection.query(sql, [userId], (error, results) => {
        if (error) {
            console.error("Error deleting user:", error);
            return res.status(500).send('Error deleting user');
        } else {
            res.redirect('/');
        }
    });
});

// Route to display the about.ejs page
app.get('/about', (req, res) => {
    res.render('about');
});

// Set up the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

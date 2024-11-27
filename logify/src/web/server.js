const express = require('express'); // Add Express
const app = express(); // Create an Express application
const PORT = process.env.PORT || 3000; // Define the port
const generateHtml = require("./generator");



const changelogHtml = generateHtml();

// Serve the changelogHtml at the root route
app.get('/changelog', (req, res) => {
    res.send(changelogHtml); // Send the HTML as a response
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
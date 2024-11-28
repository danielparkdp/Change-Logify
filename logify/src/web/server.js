const express = require('express'); // Add Express
const app = express(); // Create an Express application
const PORT = process.env.PORT || 3000; // Define the port
const { execSync } = require('child_process');
const path = require('path');

function generateChangelogPath() {
    let rootDir;
    try {
        rootDir = execSync('git rev-parse --show-toplevel').toString().trim();
    } catch (error) {
        console.error('Failed to get the root directory of the Git repository:', error);
        return;
    }
    let destinationPath;
    
    try {
        destinationPath = execSync(`cat ${rootDir}/.logify | grep 'BUILD_PATH=' | cut -d'=' -f2`).toString().trim();
    } catch (error) {
        console.error('Failed to read BUILD_PATH from .logify file:', error);
        return;
    }

    let fullDestinationPath = path.join(rootDir, destinationPath);
    return fullDestinationPath;
}

function generateStylePath() {
    let rootDir;
    try {
        rootDir = execSync('git rev-parse --show-toplevel').toString().trim();
    } catch (error) {
        console.error('Failed to get the root directory of the Git repository:', error);
        return;
    }
    let destinationPath;
    
    try {
        destinationPath = execSync(`cat ${rootDir}/.logify | grep 'BUILD_PATH=' | cut -d'=' -f2`).toString().trim();
    } catch (error) {
        console.error('Failed to read BUILD_PATH from .logify file:', error);
        return;
    }

    let fullDestinationPath = path.join(rootDir, destinationPath);
    fullDestinationPath = fullDestinationPath.split(path.sep).slice(0, -1).join(path.sep);
    return fullDestinationPath;
}

app.get('/changelog', (req, res) => {
    res.sendFile(generateChangelogPath());
});

app.get('/', (req, res) => {
    res.sendFile(generateChangelogPath());
});

app.use(express.static(generateStylePath()));


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
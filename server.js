const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Serve static files
app.use(express.static(__dirname));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'main.html'));
});

app.get('/main', (req, res) => {
    res.sendFile(path.join(__dirname, 'main.html'));
});

app.get('/lang', (req, res) => {
    res.sendFile(path.join(__dirname, 'lang.html'));
});

app.get('/color', (req, res) => {
    res.sendFile(path.join(__dirname, 'color.html'));
});

app.get('/replacer', (req, res) => {
    res.sendFile(path.join(__dirname, 'replacer.html'));
});

app.get('/media', (req, res) => {
    res.sendFile(path.join(__dirname, 'media.html'));
});

// Handle 404
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'main.html'));
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
}); 
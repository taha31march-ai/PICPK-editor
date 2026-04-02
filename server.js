const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

// Setup Multer for image uploads
const upload = multer({ dest: 'uploads/' });

// Serve static files (Frontend UI and uploaded images)
app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.json());

// Store the latest uploaded image per session (simplified for this demo)
let currentImage = null;

// Endpoint: Upload Image
app.post('/upload', upload.single('photo'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    currentImage = req.file.path;
    res.json({ message: 'Image uploaded successfully! What would you like to do? (Options: grayscale, blur, sharpen, flip)', imageUrl: `/${currentImage}` });
});

// Endpoint: Process Image Command
app.post('/command', async (req, res) => {
    const { command } = req.body;
    
    if (!currentImage) {
        return res.json({ reply: 'Please upload an image first!' });
    }

    const outputPath = `uploads/edited-${Date.now()}.jpg`;

    try {
        let imageProcessor = sharp(currentImage);

        // Simple chatbot logic routing based on text input
        if (command.includes('grayscale')) {
            await imageProcessor.grayscale().toFile(outputPath);
        } else if (command.includes('blur')) {
            await imageProcessor.blur(5).toFile(outputPath);
        } else if (command.includes('sharpen')) {
            await imageProcessor.sharpen().toFile(outputPath);
        } else if (command.includes('flip')) {
            await imageProcessor.flip().toFile(outputPath);
        } else {
            return res.json({ reply: "I didn't understand that command. Try: grayscale, blur, sharpen, or flip." });
        }

        // Update current image so subsequent edits stack
        currentImage = outputPath; 
        res.json({ reply: 'Here is your edited image!', imageUrl: `/${outputPath}` });

    } catch (error) {
        console.error(error);
        res.status(500).json({ reply: 'Oops! Something went wrong while processing the image.' });
    }
});

app.listen(port, () => {
    console.log(`PICPK Chatbot is running at http://localhost:${port}`);
});

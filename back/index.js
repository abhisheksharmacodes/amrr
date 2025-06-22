require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');

const app = express();
const port = 3002; // Using the new, working port

// --- Middlewares ---

// 1. Universal request logger
app.use((req, res, next) => {
  console.log(`Request received: ${req.method} ${req.url}`);
  next();
});

// 2. CORS handler
app.use(cors());

// 3. Body parser
app.use(express.json());

app.use('/public/uploads', express.static(path.join(__dirname, 'public/uploads')));


// --- MongoDB Connection ---
mongoose.connect('mongodb+srv://geekysharma31:QvQjHmGntx7YPVFR@cluster0.66yf3.mongodb.net/', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// --- Mongoose Schema and Model ---
const ItemSchema = new mongoose.Schema({
  name: String,
  type: String,
  description: String,
  coverImage: String,
  additionalImages: [String],
});
const Item = mongoose.model('Item', ItemSchema);


let transporter;
transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});


// --- API Routes ---

// Add a new item
app.post('/api/items', async (req, res, next) => {
    try {
        const { name, type, description, coverImage, additionalImages } = req.body;
        if (!name || !type || !description || !coverImage) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        const newItem = new Item({
            name,
            type,
            description,
            coverImage,
            additionalImages: additionalImages || [],
        });
        const savedItem = await newItem.save();
        res.status(201).json({ message: 'Item successfully added', item: savedItem });
    } catch (error) {
        next(error);
    }
});

// Get all items
app.get('/api/items', async (req, res, next) => {
    try {
        const items = await Item.find();
        res.json(items);
    } catch (error) {
        next(error);
    }
});

// Send an enquiry email
app.post('/api/enquire', async (req, res, next) => {
    try {
        const { item } = req.body;
        if (!item) return res.status(400).json({ message: 'Item information is missing' });
        if (!transporter) throw new Error('Email service is not ready');

        const emailBody = `
Hello,

You have received a new enquiry for the following item:

Item Name: ${item.name}
Item Type: ${item.type}
Description: ${item.description}

Cover Image: ${item.coverImage}
${item.additionalImages && item.additionalImages.length > 0 ? 
  'Additional Images:\n' + item.additionalImages.map((img, i) => `  ${i+1}. ${img}`).join('\n') : ''}

Best regards,
Your Website
`;

        // HTML email body
        const emailHtml = `
          <h2 style="color:#2d3748;">New Item Enquiry</h2>
          <p><strong>Item Name:</strong> ${item.name}</p>
          <p><strong>Item Type:</strong> ${item.type}</p>
          <p><strong>Description:</strong> ${item.description}</p>
          <p><strong>Cover Image:</strong><br><img src="${item.coverImage}" alt="Cover Image" style="max-width:300px;max-height:200px;border-radius:8px;box-shadow:0 2px 8px #ccc;margin:8px 0;" /></p>
          ${item.additionalImages && item.additionalImages.length > 0 ? `
            <p><strong>Additional Images:</strong></p>
            <div style="display:flex;flex-wrap:wrap;gap:10px;">
              ${item.additionalImages.map(img => `<img src="${img}" alt="Additional Image" style="max-width:150px;max-height:120px;border-radius:6px;box-shadow:0 1px 4px #ccc;margin-left:10px" />`).join('')}
            </div>
          ` : ''}
          <p style="margin-top:2em;">Best regards,<br>Abhishek Sharma</p>
        `;

        const info = await transporter.sendMail({
            from: 'do-not-reply@example.com',
            to: 'geekysharma31@gmail.com',
            subject: `New Enquiry for ${item.name}`,
            text: emailBody,
            html: emailHtml,
        });
        
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        res.status(200).json({ message: 'Enquiry sent successfully!' });
    } catch (error) {
        next(error);
    }
});


// --- Error Handling ---

// Catch 404 for any other route and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Unified error handling middleware
app.use((err, req, res, next) => {
  console.error("--- ERROR ---", err.message);
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: err.code === 'LIMIT_FILE_COUNT' ? 'Too many files uploaded' : err.message });
  } 
  res.status(err.status || 500).json({ message: err.message || 'Something went wrong' });
});


// --- Server Startup ---
app.listen(port, () => {
  console.log(`--- Full backend server is running on http://localhost:${port} ---`);
}); 


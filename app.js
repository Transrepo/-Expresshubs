// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const http = require('http');
const socketIo = require('socket.io');
const cookieParser = require('cookie-parser'); // Added for cookies
const connectDB = require('./server/config/db');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const port = 5000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));
app.use(cookieParser()); // Added for cookie handling
app.set('view engine', 'ejs');

// MongoDB Connection

connectDB();

// Tracking Schema (Updated)
const trackingSchema = new mongoose.Schema({
    trackingNumber: { type: String, unique: true },
    name: String, // From your-name
    email: String, // From your-email
    phone: String, // From your-phone
    productName: String, // From your-cargo
    origin: String, // From your-origin
    destination: String, // From your-destination
    quantity: String, // From your-quantity
    weight: String, // From your-weight
    width: String, // From your-width
    height: String, // From your-height
    currentLocation: String,
    status: { type: String, default: 'Processing' },
    estimatedDelivery: Date,
    createdAt: { type: Date, default: Date.now },
    coordinates: {
        current: { lat: Number, lon: Number },
        destination: { lat: Number, lon: Number }
    },
    history: [{
        location: String,
        status: String,
        timestamp: { type: Date, default: Date.now }
    }]
});

const Tracking = mongoose.model('Tracking', trackingSchema);

// Geocoding Cache Schema
const geocodeCacheSchema = new mongoose.Schema({
    location: { type: String, unique: true },
    coordinates: {
        lat: Number,
        lon: Number
    },
    lastUpdated: { type: Date, default: Date.now }
});

const GeocodeCache = mongoose.model('GeocodeCache', geocodeCacheSchema);

// Contact Schema
const contactSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    message: String,
    createdAt: { type: Date, default: Date.now }
});

const Contact = mongoose.model('Contact', contactSchema);

// Input Validation Functions
function validateTrackingNumber(trackingNumber) {
    const regex = /^TRK[A-Z0-9]{9}$/;
    return regex.test(trackingNumber);
}

function validateLocation(location) {
    return typeof location === 'string' && location.trim().length > 0 && location.length <= 100;
}

function validateDate(estimatedDelivery) {
    if (!estimatedDelivery) return true; // Optional field
    const date = new Date(estimatedDelivery);
    const now = new Date();
    return date instanceof Date && !isNaN(date) && date > now;
}

function validateProductName(productName) {
    return typeof productName === 'string' && productName.trim().length > 0 && productName.length <= 200;
}

function validateContact({ name, email, phone, message }) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return (
        typeof name === 'string' && name.trim().length > 0 && name.length <= 100 &&
        emailRegex.test(email) &&
        typeof phone === 'string' && phone.trim().length > 0 && phone.length <= 20 &&
        typeof message === 'string' && message.trim().length > 0 && message.length <= 1000
    );
}

function validateQuoteForm({ name, email, phone, productName, origin, destination }) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return (
        typeof name === 'string' && name.trim().length > 0 && name.length <= 100 &&
        emailRegex.test(email) &&
        typeof phone === 'string' && phone.trim().length > 0 && phone.length <= 20 &&
        validateProductName(productName) &&
        validateLocation(origin) &&
        validateLocation(destination)
    );
}

// Geocoding Function with Cache
async function geocodeLocation(location) {
    if (!validateLocation(location)) {
        return { lat: 0, lon: 0 }; // Invalid location
    }

    // Check cache
    const cached = await GeocodeCache.findOne({ location });
    if (cached) {
        return cached.coordinates;
    }

    // Call Nominatim
    try {
        const response = await axios.get('https://nominatim.openstreetmap.org/search', {
            params: {
                q: location,
                format: 'json',
                limit: 1
            },
            headers: {
                'User-Agent': process.env.NOMINATIM_USER_AGENT
            }
        });
        if (response.data.length > 0) {
            const coords = {
                lat: parseFloat(response.data[0].lat),
                lon: parseFloat(response.data[0].lon)
            };
            // Save to cache
            await GeocodeCache.updateOne(
                { location },
                { location, coordinates: coords, lastUpdated: new Date() },
                { upsert: true }
            );
            return coords;
        }
        return { lat: 0, lon: 0 }; // Fallback
    } catch (err) {
        console.error('Geocoding error:', err);
        return { lat: 0, lon: 0 };
    }
}

// Generate Unique Tracking Number
function generateTrackingNumber() {
    return 'TRK' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

// Socket.IO Connection
io.on('connection', (socket) => {
    console.log('A user connected');
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// Routes
// Home Page with Quote and Contact Forms
app.get('/', (req, res) => {
    res.render('index', { trackingNumber: null, error: null, contactSuccess: null, contactError: null });
});

// Submit Quote Form
app.post('/submit', async (req, res) => {
    const { name, email, phone, productName, origin, destination, quantity, weight, width, height } = req.body;

    // Validate inputs
    if (!validateQuoteForm({ name, email, phone, productName, origin, destination })) {
        return res.render('index', {
            trackingNumber: null,
            error: 'Invalid input. Please check required fields.',
            contactSuccess: null,
            contactError: null
        });
    }

    const trackingNumber = generateTrackingNumber();

    // Geocode locations
    const originCoords = await geocodeLocation(origin);
    const destCoords = await geocodeLocation(destination);

    const tracking = new Tracking({
        trackingNumber,
        name,
        email,
        phone,
        productName,
        origin,
        destination,
        quantity,
        weight,
        width,
        height,
        currentLocation: origin,
        coordinates: {
            current: originCoords,
            destination: destCoords
        },
        history: [{ location: origin, status: 'Processing' }]
    });

    try {
        await tracking.save();
        res.cookie('quoteSubmitted', 'true', { maxAge: 365 * 24 * 60 * 60 * 1000 }); // Cookie for 1 year
        res.render('index', {
            trackingNumber,
            error: null,
            contactSuccess: null,
            contactError: null
        });
    } catch (err) {
        res.render('index', {
            trackingNumber: null,
            error: 'Error creating tracking. Try again.',
            contactSuccess: null,
            contactError: null
        });
    }
});

// Contact Form Submission
app.post('/contact', async (req, res) => {
    const { name, email, phone, message } = req.body;

    // Validate inputs
    if (!validateContact({ name, email, phone, message })) {
        return res.render('index', {
            trackingNumber: null,
            error: null,
            contactSuccess: null,
            contactError: 'Invalid input. Please check all fields.'
        });
    }

    const contact = new Contact({
        name,
        email,
        phone,
        message
    });

    try {
        await contact.save();
        res.render('index', {
            trackingNumber: null,
            error: null,
            contactSuccess: 'Thank you for your message! We will respond within 24 hours.',
            contactError: null
        });
    } catch (err) {
        res.render('index', {
            trackingNumber: null,
            error: null,
            contactSuccess: null,
            contactError: 'Error submitting form. Try again.'
        });
    }
});

// Search Tracking
app.post('/track', async (req, res) => {
    const { trackingNumber } = req.body;

    // Validate tracking number
    if (!validateTrackingNumber(trackingNumber)) {
        return res.render('index', {
            trackingNumber: null,
            error: 'Invalid tracking number format.',
            contactSuccess: null,
            contactError: null
        });
    }

    try {
        const tracking = await Tracking.findOne({ trackingNumber });
        if (!tracking) {
            return res.render('index', {
                trackingNumber: null,
                error: 'Tracking number not found.',
                contactSuccess: null,
                contactError: null
            });
        }
        res.redirect(`/track/${trackingNumber}`);
    } catch (err) {
        res.render('index', {
            trackingNumber: null,
            error: 'Error fetching tracking details.',
            contactSuccess: null,
            contactError: null
        });
    }
});

// Tracking Page
app.get('/track/:trackingNumber', async (req, res) => {
    const { trackingNumber } = req.params;

    // Validate tracking number
    if (!validateTrackingNumber(trackingNumber)) {
        return res.render('tracking', { error: 'Invalid tracking number format.', tracking: null });
    }

    try {
        const tracking = await Tracking.findOne({ trackingNumber });
        if (!tracking) {
            return res.render('tracking', { error: 'Tracking number not found.', tracking: null });
        }
        res.render('tracking', { tracking, error: null });
    } catch (err) {
        res.render('tracking', { error: 'Error fetching tracking details.', tracking: null });
    }
});

// Admin Dashboard
app.get('/siteOwnerLink', async (req, res) => {
    try {
        const trackings = await Tracking.find({});
        const contacts = await Contact.find({});
        res.render('admin', { trackings, contacts, error: null });
    } catch (err) {
        res.render('admin', { trackings: [], contacts: [], error: 'Error fetching data.' });
    }
});

// Edit Tracking (GET)
app.get('/siteOwnerLink/edit-tracking/:trackingNumber', async (req, res) => {
    try {
        const tracking = await Tracking.findOne({ trackingNumber: req.params.trackingNumber });
        if (!tracking) {
            return res.redirect('/siteOwnerLink');
        }
        res.render('edit', { tracking, type: 'tracking' });
    } catch (err) {
        res.redirect('/siteOwnerLink');
    }
});

// Edit Tracking (POST)
app.post('/siteOwnerLink/edit-tracking/:trackingNumber', async (req, res) => {
    const { currentLocation, status, estimatedDelivery } = req.body;

    // Validate inputs
    if (!validateLocation(currentLocation)) {
        return res.redirect('/siteOwnerLink');
    }
    if (!validateDate(estimatedDelivery)) {
        return res.redirect('/siteOwnerLink');
    }

    try {
        const coords = await geocodeLocation(currentLocation);
        const updateData = {
            currentLocation,
            status,
            estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : null,
            'coordinates.current': coords,
            $push: {
                history: {
                    location: currentLocation,
                    status,
                    timestamp: new Date()
                }
            }
        };
        await Tracking.updateOne({ trackingNumber: req.params.trackingNumber }, updateData);
        // Emit update to all connected clients
        const updatedTracking = await Tracking.findOne({ trackingNumber: req.params.trackingNumber });
        io.emit('trackingUpdate', updatedTracking);
        res.redirect('/siteOwnerLink');
    } catch (err) {
        res.redirect('/siteOwnerLink');
    }
});

// Delete Tracking
app.post('/siteOwnerLink/delete-tracking/:trackingNumber', async (req, res) => {
    try {
        await Tracking.deleteOne({ trackingNumber: req.params.trackingNumber });
        res.redirect('/siteOwnerLink');
    } catch (err) {
        res.redirect('/siteOwnerLink');
    }
});

// Edit Contact (GET)
app.get('/siteOwnerLink/edit-contact/:id', async (req, res) => {
    try {
        const contact = await Contact.findById(req.params.id);
        if (!contact) {
            return res.redirect('/siteOwnerLink');
        }
        res.render('edit', { contact, type: 'contact' });
    } catch (err) {
        res.redirect('/siteOwnerLink');
    }
});

// Edit Contact (POST)
app.post('/siteOwnerLink/edit-contact/:id', async (req, res) => {
    const { name, email, phone, message } = req.body;

    // Validate inputs
    if (!validateContact({ name, email, phone, message })) {
        return res.redirect('/siteOwnerLink');
    }

    try {
        await Contact.updateOne({ _id: req.params.id }, { name, email, phone, message });
        res.redirect('/siteOwnerLink');
    } catch (err) {
        res.redirect('/siteOwnerLink');
    }
});

// Delete Contact
app.post('/siteOwnerLink/delete-contact/:id', async (req, res) => {
    try {
        await Contact.deleteOne({ _id: req.params.id });
        res.redirect('/siteOwnerLink');
    } catch (err) {
        res.redirect('/siteOwnerLink');
    }
});

app.use('/', require('./server/Route/indexRoute'));
// app.use('/', require('./server/Route/adminRoute'));

// Start Server
server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

// TRKW36GXF8RJ
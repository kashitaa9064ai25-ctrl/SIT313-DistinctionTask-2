const express = require('express');
const cors = require('cors');
const formData = require('form-data');
const Mailgun = require('mailgun.js');
const { initializeApp, getApps, getApp } = require('firebase/app');
const { getFirestore, collection, addDoc, getDocs } = require('firebase/firestore');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Firebase Configuration from .env
const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || process.env.FIREBASE_AUTH_DOMAIN,
    projectId:
        process.env.FIREBASE_PROJECT_ID ||
        process.env.VITE_FIREBASE_PROJECT_ID ||
        'deakin-project',
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID || process.env.FIREBASE_APP_ID,
};

const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(firebaseApp);

// Mailgun setup (Newsletter)
const mailgun = new Mailgun(formData);
const mg = mailgun.client({
    username: 'api',
    key: process.env.MAILGUN_API_KEY || 'fake-key',
});

// Newsletter Subscription
app.post('/subscribe', async (req, res) => {
    const { email } = req.body;
    if (!email || !email.trim() || !email.includes('@')) {
        return res.status(400).json({ success: false, message: 'A valid email is required.' });
    }

    try {
        const response = await mg.messages.create(process.env.MAILGUN_DOMAIN, {
            from: `DEV@Deakin <mailgun@${process.env.MAILGUN_DOMAIN}>`,
            to: [email.trim()],
            subject: 'Welcome to DEV@Deakin Daily Insider!',
            text: 'Thank you for subscribing to our Daily Insider newsletter!',
        });
        console.log('Status: 200 Email sent successfully:', response);
        return res.status(200).json({ success: true, message: 'Subscribed successfully!' });
    } catch (err) {
        console.error('Mailgun error:', err);
        return res.status(500).json({ success: false, message: 'Failed to send subscription email.' });
    }
});

// Post Creation Endpoint
app.post('/api/posts', async (req, res) => {
    const { userId, authorName, postType, plan, title, abstract, text, tags, image } = req.body;

    if (!userId) {
        return res.status(401).json({ success: false, message: 'You must be logged in to create a post.' });
    }
    if (!title || !title.trim()) {
        return res.status(400).json({ success: false, message: 'Post title is required.' });
    }
    if (!text || !text.trim()) {
        return res.status(400).json({ success: false, message: 'Post content is required.' });
    }

    try {
        const newPost = {
            userId,
            authorName: authorName || 'Anonymous',
            postType: postType === 'Question' ? 'Question' : 'Article',
            plan: plan === 'Paid' ? 'Paid' : 'Free',
            title: title.trim(),
            abstract: abstract ? abstract.trim() : '',
            text: text.trim(),
            image: image || null,
            tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map((t) => t.trim()) : []),
            createdAt: new Date().toISOString(),
        };

        const docRef = await addDoc(collection(db, 'posts'), newPost);
        console.log(`[Task D2] New Post saved: ${docRef.id} (${newPost.plan})`);
        return res.status(201).json({ success: true, id: docRef.id, post: newPost });
    } catch (error) {
        console.error('[Task D2] Error saving post:', error);
        return res.status(500).json({ success: false, message: 'Failed to save post: ' + error.message });
    }
});

// Browse Posts Endpoint
app.get('/api/posts', async (req, res) => {
    const userPlan = (req.query.userPlan || 'Free').trim();
    console.log(`[Task D2] Handling GET /api/posts for tier: "${userPlan}"`);

    try {
        const snapshot = await getDocs(collection(db, 'posts'));

        let posts = [];
        snapshot.forEach((docItem) => {
            const data = docItem.data();
            posts.push({
                id: docItem.id,
                ...data,
                plan: data.plan || 'Free',
            });
        });

        // Enforce Tier access on the backend
        if (userPlan !== 'Paid') {
            posts = posts.filter((p) => p.plan === 'Free');
        }

        // Sort descending by creation date
        posts.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

        console.log(`[Task D2] Returning ${posts.length} posts.`);
        return res.status(200).json({ success: true, posts });
    } catch (error) {
        console.error('[Task D2] Detailed Firestore Fetch Error:', error);
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve posts: ${error.message}`,
        });
    }
});

app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});
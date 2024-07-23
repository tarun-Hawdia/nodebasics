const express = require('express');
const axios = require('axios');
const querystring = require('querystring');
const session = require('express-session');
require('dotenv').config();

const router = express.Router();

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const AUTH_URL = 'https://accounts.google.com/o/oauth2/auth';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';

// Redirect to Google OAuth consent page
router.get('/auth/login', (req, res) => {
    const authUrl = `${AUTH_URL}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=email%20profile`;
    res.redirect(authUrl);
});

// Callback route for Google OAuth
router.get('/auth/callback', async (req, res) => {
    const { code } = req.query;

    try {
        const response = await axios.post(TOKEN_URL, querystring.stringify({
            code,
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            redirect_uri: REDIRECT_URI,
            grant_type: 'authorization_code'
        }), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        const { access_token, refresh_token, expires_in } = response.data;

        req.session.accessToken = access_token;
        req.session.refreshToken = refresh_token;
        req.session.expiresAt = Date.now() + expires_in * 1000;

        res.redirect('/api-calls');
    } catch (error) {
        console.error('Error during authentication callback:', error);
        res.status(500).send('Authentication failed');
    }
});

// Logout route
router.get('/auth/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// Middleware to check if user is authenticated
function checkAuth(req, res, next) {
    if (req.session.accessToken) {
        if (Date.now() < req.session.expiresAt) {
            next();
        } else {
            // Token expired, refresh token
            axios.post(TOKEN_URL, querystring.stringify({
                refresh_token: req.session.refreshToken,
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                grant_type: 'refresh_token'
            }), {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).then(response => {
                const { access_token, expires_in } = response.data;
                req.session.accessToken = access_token;
                req.session.expiresAt = Date.now() + expires_in * 1000;
                next();
            }).catch(() => res.redirect('/auth/login'));
        }
    } else {
        res.redirect('/auth/login');
    }
}

module.exports = { router, checkAuth };

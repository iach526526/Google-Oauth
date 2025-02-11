require("dotenv").config();

const express = require("express");
const passport = require("passport");
const session = require("express-session");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const app = express();

// 設置 Content-Security-Policy
app.use((req, res, next) => {
    res.setHeader("Content-Security-Policy", "default-src 'self'; style-src 'self' 'unsafe-inline'");
    next();
});

// 設置 session
app.use(
    session({ 
        secret: "secret",
        resave: false,
        saveUninitialized: true,
    })
);

app.use(passport.initialize());
app.use(passport.session());

// 設定 Google OAuth
passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:3690/auth/google/callback",
    },(accessToken, refreshToken, profile, done) => {
        return done(null, profile);
    }
));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

app.get("/",(req,res)=>{
    res.send(`<a href="/auth/google">Login with Google</a>`);
});

// Google 登入
app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Google 登入回調
app.get("/auth/google/callback", passport.authenticate("google", { failureRedirect: "/" }), (req, res) => {
    res.redirect("/profile");
});

// 個人檔案頁面
app.get("/profile", (req, res) => {
    if (!req.user) {
        return res.redirect("/");
    }
    res.send(`Welcome ${req.user.displayName}`);
});

// 登出
app.get("/logout", (req, res, next) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect("/");
    });
});

app.listen(3690, () => console.log("Server is running on port 3690"));

require("dotenv").config();

const express = require("express");
const passport = require("passport");
const session = require("express-session");
const googleStrategy = require("passport-google-oauth20").Strategy;

const app = express();
app.use((req, res, next) => {
    res.setHeader("Content-Security-Policy", "default-src 'self'; style-src 'self' 'unsafe-inline'");
    next();
});

app.use(passport.initialize());

passport.use(new googleStrategy
    ({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:3690/auth/google/callback",
    },(accessToken, refreshToken, profile, done) => {
        return done(null, profile);
    }    
    )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

app.get("/",(req,res)=>{
    res.send("<a href='/auth/google'>Login with google</a>")
})

app.get("/auth/google", passport.authenticate("google", {scope: ["profile", "email"]}));
app.get("/auth/goolge/callback", passport.authenticate("google", {failureRedirect: "/"}), (req,res)=>{
    res.redirect("/profile");
}
);
app.get("/profile", (req,res)=>{
    if (!req.user) {
        return res.redirect("/");
    }
    res.send(`Welcome ${req.user.displayName}`)
}
);
app.get("/logout", (req,res)=>{
    req.logout();
    res.redirect("/");
}
);
app.listen(3690, ()=> console.log("Server is running on port 3690"));
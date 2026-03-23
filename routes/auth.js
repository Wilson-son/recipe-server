import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import { sendEmail } from "../utils/sendEmail.js";

const router = express.Router();


router.post("/register", async (req, res) => {
  try {
    console.log("Register hit"); // ← add this
    const { username, email, password } = req.body;
    console.log("Body:", { username, email, password }); // ← add this

    if (!username || !email || !password) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    console.log("📝 User exists:", userExists ? "yes" : "no"); 
    if (userExists) {
      return res.status(400).json({ msg: "Username or email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log("📝 Password hashed"); 

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await User.create({
      username,
      email,
      password: hashedPassword,
      verificationToken,
      verificationTokenExpiry,
    });
    console.log("📝 User created in DB"); // ← add this

    console.log("📝 About to send email..."); // ← add this
    const verifyLink = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;

    try {
      await sendEmail({
        to: email,
        subject: "Verify your Recipe-app email 🍴",
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
            <h2 style="color:#ea580c;">Welcome to Recipe-app, ${username}! 🍴</h2>
            <p>Please verify your email to activate your account.</p>
            <a href="${verifyLink}"
               style="display:inline-block;padding:12px 24px;background:#ea580c;color:#fff;
                      text-decoration:none;border-radius:5px;margin:16px 0;font-weight:bold;">
              Verify Email
            </a>
            <p style="color:#888;font-size:13px;">This link expires in 24 hours.</p>
            <p style="color:#aaa;font-size:12px;">Or copy: <a href="${verifyLink}">${verifyLink}</a></p>
          </div>
        `,
      });
      console.log("📝 Email sent successfully"); // ← add this
    } catch (emailErr) {
      console.error("❌ Email failed:", emailErr.message); // ← add this
    }

    res.status(201).json({ msg: "Registered! Please check your email to verify your account." });
  } catch (err) {
    console.error("❌ Register route error:", err); // ← add this
    res.status(500).json({ msg: "Server error" });
  }
});


router.post("/resend-verification", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ msg: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user || user.isVerified) {
      return res.json({ msg: "If applicable, a new verification email has been sent." });
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");
    user.verificationToken = verificationToken;
    user.verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    const verifyLink = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;

    await sendEmail({
      to: user.email,
      subject: "Verify your Recipe-app email 🍴",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #f0f0f0;border-radius:8px;">
          <h2 style="color:#ea580c;">Verify your email 🍴</h2>
          <p>Hi ${user.username}, here's your new verification link:</p>
          <a href="${verifyLink}"
             style="display:inline-block;padding:12px 24px;background:#ea580c;color:#fff;
                    text-decoration:none;border-radius:5px;margin:16px 0;font-weight:bold;">
            Verify Email
          </a>
          <p style="color:#888;font-size:13px;">This link expires in 24 hours.</p>
          <hr style="border:none;border-top:1px solid #f0f0f0;margin-top:20px;"/>
          <p style="color:#aaa;font-size:11px;">If you didn't request this, ignore this email.</p>
        </div>
      `,
    });

    res.json({ msg: "Verification email resent. Please check your inbox." });
  } catch (err) {
    console.error("Resend verification error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ msg: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid email or password" });

    if (!user.isVerified) {
      return res.status(403).json({
        msg: "Please verify your email before logging in.",
        resendAvailable: true,
      });
    }

    if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not set");

   
    user.tokenVersion += 1;
    await user.save();

    const token = jwt.sign(
      { id: user._id, tokenVersion: user.tokenVersion }, 
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      msg: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ msg: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.json({ msg: "If an account exists, a reset link has been sent." });

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetToken = resetToken;
    user.resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: "Reset your Recipe-app password 🔐",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #f0f0f0;border-radius:8px;">
          <h2 style="color:#ea580c;">Password Reset Request 🔐</h2>
          <p>Hi ${user.username}, we received a request to reset your Recipe-app password.</p>
          <a href="${resetLink}"
             style="display:inline-block;padding:12px 24px;background:#ea580c;color:#fff;
                    text-decoration:none;border-radius:5px;margin:16px 0;font-weight:bold;">
            Reset Password
          </a>
          <p style="color:#888;font-size:13px;">⚠️ This link expires in 15 minutes.</p>
          <p style="color:#aaa;font-size:12px;">Or copy: <a href="${resetLink}">${resetLink}</a></p>
          <hr style="border:none;border-top:1px solid #f0f0f0;margin-top:20px;"/>
          <p style="color:#aaa;font-size:11px;">If you didn't request this, ignore this email.</p>
        </div>
      `,
    });

    res.json({ msg: "Reset link sent to your inbox" });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});


router.post("/reset-password/:token", async (req, res) => {
  try {
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ msg: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({
      resetToken: req.params.token,
      resetTokenExpiry: { $gt: new Date() },
    });

    if (!user) return res.status(400).json({ msg: "Invalid or expired token" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.json({ msg: "Password reset successful. You can now log in." });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

export default router;

router.get("/verify-email/:token", async (req, res) => {
  try {
    const user = await User.findOne({
      verificationToken: req.params.token,
      verificationTokenExpiry: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ msg: "Invalid or expired verification link" });
    }

    
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    await user.save();

    
    try {
      await sendEmail({
        to: user.email,
        subject: "You're all set — welcome to Recipe-app! 🎉",
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #f0f0f0;border-radius:8px;">
            <h2 style="color:#ea580c;">You're verified, ${user.username}! 🍴</h2>
            <p>Your Recipe-app account is now active. Start exploring and sharing recipes!</p>
            <a href="${process.env.CLIENT_URL}/explore"
               style="display:inline-block;padding:12px 24px;background:#ea580c;color:#fff;
                      text-decoration:none;border-radius:5px;margin:16px 0;font-weight:bold;">
              Start Exploring
            </a>
          </div>
        `,
      });
    } catch (emailErr) {
    
      console.error("Welcome email failed:", emailErr.message);
    }

   
    res.json({ msg: "Email verified successfully! You can now log in." });

  } catch (err) {
    console.error("Verify email error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});


const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../db");

const router = express.Router();

// =============================
// REGISTER
// =============================
router.post("/register", async (req, res) => {
  try {
    const { full_name, email, phone, password, role } = req.body;

    if (!full_name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Full name, email, password and role are required.",
      });
    }

    const allowedRoles = ["admin", "staff", "customer"];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user role.",
      });
    }

    const checkUser = "SELECT id FROM users WHERE email = ?";

    db.query(checkUser, [email], async (err, results) => {
      if (err) {
        console.error(err);

        return res.status(500).json({
          success: false,
          message: "Database error.",
        });
      }

      if (results.length > 0) {
        return res.status(409).json({
          success: false,
          message: "Email already exists.",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const sql = `
        INSERT INTO users
        (full_name, email, phone, password, role)
        VALUES (?, ?, ?, ?, ?)
      `;

      db.query(
        sql,
        [full_name, email, phone || "", hashedPassword, role],
        (err, result) => {
          if (err) {
            console.error(err);

            return res.status(500).json({
              success: false,
              message: "Could not create account.",
            });
          }

          res.status(201).json({
            success: true,
            message: "Account created successfully.",
            userId: result.insertId,
          });
        }
      );
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
});

// =============================
// LOGIN
// =============================
router.post("/login", (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({
      success: false,
      message: "Email, password and role are required.",
    });
  }

  const sql = `
    SELECT id, full_name, email, phone, password, role
    FROM users
    WHERE email = ? AND role = ?
  `;

  db.query(sql, [email, role], async (err, results) => {
    if (err) {
      console.error(err);

      return res.status(500).json({
        success: false,
        message: "Database error.",
      });
    }

    if (results.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email, password or role.",
      });
    }

    const user = results[0];

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email, password or role.",
      });
    }

    res.json({
      success: true,
      message: "Login successful.",
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  });
});

module.exports = router;
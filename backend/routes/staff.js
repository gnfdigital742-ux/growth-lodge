const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../db");

const router = express.Router();

/*
==================================================
GET ALL STAFF
GET /api/staff
==================================================
*/

router.get("/", (req, res) => {
  const sql = `
    SELECT
      id,
      full_name,
      email,
      phone,
      role,
      created_at
    FROM users
    WHERE role = 'staff'
    ORDER BY id DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Get staff error:", err);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch staff.",
      });
    }

    res.json({
      success: true,
      count: results.length,
      staff: results,
    });
  });
});


/*
==================================================
GET ONE STAFF
GET /api/staff/:id
==================================================
*/

router.get("/:id", (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid staff ID.",
    });
  }

  const sql = `
    SELECT
      id,
      full_name,
      email,
      phone,
      role,
      created_at
    FROM users
    WHERE id = ? AND role = 'staff'
  `;

  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error("Get staff error:", err);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch staff.",
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Staff member not found.",
      });
    }

    res.json({
      success: true,
      staff: results[0],
    });
  });
});


/*
==================================================
CREATE STAFF
POST /api/staff
==================================================
*/

router.post("/", async (req, res) => {
  try {
    const {
      full_name,
      email,
      phone,
      password,
    } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Full name, email and password are required.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters.",
      });
    }

    // Check if email already exists
    const checkSql = `
      SELECT id
      FROM users
      WHERE email = ?
    `;

    db.query(checkSql, [email], async (err, results) => {
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
        (
          full_name,
          email,
          phone,
          password,
          role
        )
        VALUES (?, ?, ?, ?, 'staff')
      `;

      db.query(
        sql,
        [
          full_name,
          email,
          phone || "",
          hashedPassword,
        ],
        (err, result) => {
          if (err) {
            console.error("Create staff error:", err);

            return res.status(500).json({
              success: false,
              message: "Failed to create staff account.",
            });
          }

          res.status(201).json({
            success: true,
            message: "Staff account created successfully.",
            staffId: result.insertId,
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


/*
==================================================
UPDATE STAFF
PUT /api/staff/:id
==================================================
*/

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const {
      full_name,
      email,
      phone,
      password,
    } = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid staff ID.",
      });
    }

    if (!full_name || !email) {
      return res.status(400).json({
        success: false,
        message: "Full name and email are required.",
      });
    }

    // Check staff exists
    db.query(
      "SELECT id FROM users WHERE id = ? AND role = 'staff'",
      [id],
      async (err, results) => {
        if (err) {
          console.error(err);

          return res.status(500).json({
            success: false,
            message: "Database error.",
          });
        }

        if (results.length === 0) {
          return res.status(404).json({
            success: false,
            message: "Staff member not found.",
          });
        }

        // Check whether email belongs to another user
        db.query(
          `
          SELECT id
          FROM users
          WHERE email = ? AND id != ?
          `,
          [email, id],
          async (err, emailResults) => {
            if (err) {
              console.error(err);

              return res.status(500).json({
                success: false,
                message: "Database error.",
              });
            }

            if (emailResults.length > 0) {
              return res.status(409).json({
                success: false,
                message: "Email already belongs to another user.",
              });
            }

            let sql;
            let values;

            if (password) {
              if (password.length < 6) {
                return res.status(400).json({
                  success: false,
                  message: "Password must be at least 6 characters.",
                });
              }

              const hashedPassword = await bcrypt.hash(password, 10);

              sql = `
                UPDATE users
                SET
                  full_name = ?,
                  email = ?,
                  phone = ?,
                  password = ?
                WHERE id = ? AND role = 'staff'
              `;

              values = [
                full_name,
                email,
                phone || "",
                hashedPassword,
                id,
              ];
            } else {
              sql = `
                UPDATE users
                SET
                  full_name = ?,
                  email = ?,
                  phone = ?
                WHERE id = ? AND role = 'staff'
              `;

              values = [
                full_name,
                email,
                phone || "",
                id,
              ];
            }

            db.query(sql, values, (err, result) => {
              if (err) {
                console.error("Update staff error:", err);

                return res.status(500).json({
                  success: false,
                  message: "Failed to update staff.",
                });
              }

              res.json({
                success: true,
                message: "Staff updated successfully.",
              });
            });
          }
        );
      }
    );
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
});


/*
==================================================
DELETE STAFF
DELETE /api/staff/:id
==================================================
*/

router.delete("/:id", (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid staff ID.",
    });
  }

  const sql = `
    DELETE FROM users
    WHERE id = ? AND role = 'staff'
  `;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Delete staff error:", err);

      return res.status(500).json({
        success: false,
        message: "Failed to delete staff.",
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Staff member not found.",
      });
    }

    res.json({
      success: true,
      message: "Staff deleted successfully.",
    });
  });
});


module.exports = router;
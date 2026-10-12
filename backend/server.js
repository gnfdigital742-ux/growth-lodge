require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const crypto = require("crypto");

const app = express();
const PORT = Number(process.env.PORT || 5000);

// ======================================================
// MIDDLEWARE
// ======================================================

const allowedOrigins = [
  "http://localhost:3000",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin)
      ) {
        return callback(null, true);
      }

      return callback(new Error("Origin not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-hotel-id"],
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// ======================================================
// DATABASE CONNECTION
// Supports Railway and local XAMPP MySQL
// ======================================================

const databaseName =
  process.env.DB_NAME ||
  process.env.MYSQLDATABASE ||
  "growth_lodge";

const db = mysql.createConnection({
  host:
    process.env.DB_HOST ||
    process.env.MYSQLHOST ||
    "localhost",
  user:
    process.env.DB_USER ||
    process.env.MYSQLUSER ||
    "root",
  password:
    process.env.DB_PASSWORD ||
    process.env.MYSQLPASSWORD ||
    "",
  database: databaseName,
  port: Number(
    process.env.DB_PORT ||
    process.env.MYSQLPORT ||
    3307
  ),
  connectTimeout: 10000,
});

function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (error, results) => {
      if (error) {
        return reject(error);
      }

      resolve(results);
    });
  });
}

function execute(sql, params = []) {
  return query(sql, params);
}

// ======================================================
// HELPERS
// ======================================================

async function columnExists(tableName, columnName) {
  const result = await query(
    `SELECT COUNT(*) AS count
     FROM information_schema.columns
     WHERE table_schema = ?
       AND table_name = ?
       AND column_name = ?`,
    [databaseName, tableName, columnName]
  );

  return Number(result[0].count) > 0;
}

function hashPassword(password) {
  // Preserves compatibility with existing Growth Lodge accounts.
  return crypto
    .createHash("sha256")
    .update(String(password))
    .digest("hex");
}

function generateOTP() {
  return String(crypto.randomInt(100000, 1000000));
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || ""));
}

function isValidPhone(phone) {
  return /^\+?[0-9]{10,15}$/.test(String(phone || ""));
}

function isStrongPassword(password) {
  const value = String(password || "");

  if (value.length < 8) return false;

  let score = 0;

  if (/[A-Z]/.test(value)) score++;
  if (/[a-z]/.test(value)) score++;
  if (/[0-9]/.test(value)) score++;
  if (/[^A-Za-z0-9]/.test(value)) score++;

  return score >= 3;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function createSlug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getHotelId(req) {
  const value =
    req.headers["x-hotel-id"] ??
    req.body?.hotel_id ??
    req.query?.hotel_id;

  if (value === undefined || value === null || value === "") {
    return null;
  }

  const hotelId = Number(value);

  if (!Number.isInteger(hotelId) || hotelId <= 0) {
    return null;
  }

  return hotelId;
}

async function hotelExists(hotelId) {
  const rows = await query(
    `SELECT id FROM hotels
     WHERE id = ? AND status = 'active'
     LIMIT 1`,
    [hotelId]
  );

  return rows.length > 0;
}

async function getHotelById(hotelId) {
  const rows = await query(
    `SELECT id, hotel_name, email, phone, address, city,
            country, description, status, created_at, slug
     FROM hotels WHERE id = ? LIMIT 1`,
    [hotelId]
  );

  return rows[0] || null;
}

function sendError(res, message, error, status = 500) {
  console.error(message, error);

  return res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== "production"
      ? { error: error?.message }
      : {}),
  });
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

// ======================================================
// BREVO EMAIL VERIFICATION
// ======================================================

async function sendVerificationOTP(fullName, email, otp) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME || "Growth Lodge";

  if (!apiKey) {
    throw new Error("BREVO_API_KEY is not configured");
  }

  if (!senderEmail) {
    throw new Error("BREVO_SENDER_EMAIL is not configured");
  }

  const safeName = escapeHtml(fullName);
  const safeOtp = escapeHtml(otp);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Growth Lodge Email Verification</title>
      </head>
      <body style="margin:0;padding:0;background:#f5f3ff;font-family:Arial,sans-serif;">
        <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:16px;padding:35px;">
          <h1 style="color:#6d28d9;margin-top:0;">Growth Lodge</h1>
          <h2>Email Verification</h2>
          <p>Hello ${safeName},</p>
          <p>Use the verification code below to verify your Growth Lodge account.</p>
          <div style="font-size:34px;font-weight:bold;letter-spacing:8px;text-align:center;padding:20px;margin:25px 0;background:#f5f3ff;color:#6d28d9;border-radius:12px;">
            ${safeOtp}
          </div>
          <p>This code expires in 10 minutes.</p>
          <p>If you did not request this code, you can safely ignore this email.</p>
          <p>Regards,<br>Growth Lodge Team</p>
        </div>
      </body>
    </html>
  `;

  const textContent = `
Growth Lodge Email Verification

Hello ${fullName},

Your Growth Lodge verification code is:

${otp}

This code expires in 10 minutes.

If you did not request this code, you can safely ignore this email.

Growth Lodge Team
  `.trim();

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": apiKey,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      sender: {
        name: senderName,
        email: senderEmail,
      },
      to: [{ email, name: fullName }],
      subject: "Growth Lodge Email Verification",
      textContent,
      htmlContent,
    }),
  });

  if (!response.ok) {
    const details = await response.text().catch(() => "");
    throw new Error(`Brevo email error: ${response.status} ${details}`);
  }

  return true;
}

// ======================================================
// DATABASE INITIALIZATION
// ======================================================

async function initializeDatabase() {
  await execute(`
    CREATE TABLE IF NOT EXISTS hotels (
      id INT AUTO_INCREMENT PRIMARY KEY,
      hotel_name VARCHAR(150) NOT NULL,
      email VARCHAR(150) NOT NULL,
      phone VARCHAR(30),
      address VARCHAR(255),
      city VARCHAR(100),
      country VARCHAR(100),
      description TEXT,
      status VARCHAR(30) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      slug VARCHAR(180)
    )
  `);

  await execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      hotel_id INT NULL,
      full_name VARCHAR(150) NOT NULL,
      email VARCHAR(150) NOT NULL,
      phone VARCHAR(30),
      password VARCHAR(255) NOT NULL,
      role VARCHAR(30) DEFAULT 'customer',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await execute(`
    CREATE TABLE IF NOT EXISTS rooms (
      id INT AUTO_INCREMENT PRIMARY KEY,
      hotel_id INT NOT NULL,
      room_number VARCHAR(50) NOT NULL,
      room_type VARCHAR(100) NOT NULL,
      price DECIMAL(12,2) NOT NULL DEFAULT 0,
      status VARCHAR(50) DEFAULT 'available',
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await execute(`
    CREATE TABLE IF NOT EXISTS reservations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      hotel_id INT NOT NULL,
      user_id INT NOT NULL,
      room_id INT NOT NULL,
      check_in DATE NOT NULL,
      check_out DATE NOT NULL,
      guests INT NOT NULL DEFAULT 1,
      status VARCHAR(50) DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await execute(`
    CREATE TABLE IF NOT EXISTS payments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      hotel_id INT NOT NULL,
      reservation_id INT NOT NULL,
      amount DECIMAL(12,2) NOT NULL DEFAULT 0,
      payment_method VARCHAR(100) NOT NULL,
      status VARCHAR(50) DEFAULT 'pending',
      transaction_id VARCHAR(150),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await execute(`
    CREATE TABLE IF NOT EXISTS settings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      hotel_id INT NOT NULL,
      setting_key VARCHAR(150) NOT NULL,
      setting_value TEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await execute(`
    CREATE TABLE IF NOT EXISTS email_verifications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      hotel_id INT NULL,
      full_name VARCHAR(150) NOT NULL,
      email VARCHAR(150) NOT NULL,
      phone VARCHAR(30),
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(30) NOT NULL,
      otp VARCHAR(10) NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Support older versions of the users table.
  if (!(await columnExists("users", "hotel_id"))) {
    await execute("ALTER TABLE users ADD COLUMN hotel_id INT NULL");
  }

  if (!(await columnExists("users", "full_name"))) {
    if (await columnExists("users", "name")) {
      await execute(
        "ALTER TABLE users CHANGE COLUMN name full_name VARCHAR(150) NOT NULL"
      );
    } else {
      await execute(
        "ALTER TABLE users ADD COLUMN full_name VARCHAR(150) NOT NULL DEFAULT ''"
      );
    }
  }

  if (!(await columnExists("users", "password"))) {
    await execute(
      "ALTER TABLE users ADD COLUMN password VARCHAR(255) NOT NULL DEFAULT ''"
    );
  }

  if (!(await columnExists("users", "phone"))) {
    await execute("ALTER TABLE users ADD COLUMN phone VARCHAR(30)");
  }

  if (!(await columnExists("users", "role"))) {
    await execute(
      "ALTER TABLE users ADD COLUMN role VARCHAR(30) DEFAULT 'customer'"
    );
  }

  if (!(await columnExists("users", "created_at"))) {
    await execute(
      "ALTER TABLE users ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    );
  }

  // Support older versions of the hotels table.
  if (!(await columnExists("hotels", "hotel_name"))) {
    if (await columnExists("hotels", "name")) {
      await execute(
        "ALTER TABLE hotels CHANGE COLUMN name hotel_name VARCHAR(150) NOT NULL"
      );
    } else {
      await execute(
        "ALTER TABLE hotels ADD COLUMN hotel_name VARCHAR(150) NOT NULL DEFAULT ''"
      );
    }
  }

  if (!(await columnExists("hotels", "email"))) {
    await execute(
      "ALTER TABLE hotels ADD COLUMN email VARCHAR(150) NOT NULL DEFAULT ''"
    );
  }

  if (!(await columnExists("hotels", "phone"))) {
    await execute("ALTER TABLE hotels ADD COLUMN phone VARCHAR(30)");
  }

  if (!(await columnExists("hotels", "address"))) {
    await execute("ALTER TABLE hotels ADD COLUMN address VARCHAR(255)");
  }

  if (!(await columnExists("hotels", "city"))) {
    await execute("ALTER TABLE hotels ADD COLUMN city VARCHAR(100)");
  }

  if (!(await columnExists("hotels", "country"))) {
    await execute("ALTER TABLE hotels ADD COLUMN country VARCHAR(100)");
  }

  if (!(await columnExists("hotels", "description"))) {
    await execute("ALTER TABLE hotels ADD COLUMN description TEXT");
  }

  if (!(await columnExists("hotels", "status"))) {
    if (await columnExists("hotels", "hotel_status")) {
      await execute(
        "ALTER TABLE hotels CHANGE COLUMN hotel_status status VARCHAR(30) DEFAULT 'active'"
      );
    } else {
      await execute(
        "ALTER TABLE hotels ADD COLUMN status VARCHAR(30) DEFAULT 'active'"
      );
    }
  }

  if (!(await columnExists("hotels", "slug"))) {
    if (await columnExists("hotels", "hotel_slug")) {
      await execute(
        "ALTER TABLE hotels CHANGE COLUMN hotel_slug slug VARCHAR(180)"
      );
    } else {
      await execute("ALTER TABLE hotels ADD COLUMN slug VARCHAR(180)");
    }
  }

  // Support legacy rooms tables.
  const roomColumns = [
    ["hotel_id", "INT NOT NULL DEFAULT 1"],
    ["room_number", "VARCHAR(50) NOT NULL DEFAULT ''"],
    ["room_type", "VARCHAR(100) NOT NULL DEFAULT 'Standard'"],
    ["price", "DECIMAL(12,2) NOT NULL DEFAULT 0"],
    ["status", "VARCHAR(50) DEFAULT 'available'"],
    ["description", "TEXT"],
  ];

  for (const [column, definition] of roomColumns) {
    if (!(await columnExists("rooms", column))) {
      await execute(`ALTER TABLE rooms ADD COLUMN ${column} ${definition}`);
    }
  }

  // Support legacy reservations tables.
  const reservationColumns = [
    ["hotel_id", "INT NOT NULL DEFAULT 1"],
    ["user_id", "INT NOT NULL DEFAULT 1"],
    ["room_id", "INT NOT NULL DEFAULT 1"],
    ["check_in", "DATE NULL"],
    ["check_out", "DATE NULL"],
    ["guests", "INT NOT NULL DEFAULT 1"],
    ["status", "VARCHAR(50) DEFAULT 'pending'"],
  ];

  for (const [column, definition] of reservationColumns) {
    if (!(await columnExists("reservations", column))) {
      await execute(
        `ALTER TABLE reservations ADD COLUMN ${column} ${definition}`
      );
    }
  }

  // Support legacy payments tables.
  const paymentColumns = [
    ["hotel_id", "INT NOT NULL DEFAULT 1"],
    ["reservation_id", "INT NOT NULL DEFAULT 1"],
    ["amount", "DECIMAL(12,2) NOT NULL DEFAULT 0"],
    ["payment_method", "VARCHAR(100) NOT NULL DEFAULT 'cash'"],
    ["status", "VARCHAR(50) DEFAULT 'pending'"],
    ["transaction_id", "VARCHAR(150) NULL"],
  ];

  for (const [column, definition] of paymentColumns) {
    if (!(await columnExists("payments", column))) {
      await execute(
        `ALTER TABLE payments ADD COLUMN ${column} ${definition}`
      );
    }
  }

  if (!(await columnExists("settings", "hotel_id"))) {
    await execute(
      "ALTER TABLE settings ADD COLUMN hotel_id INT NOT NULL DEFAULT 1"
    );
  }

  if (!(await columnExists("settings", "setting_key"))) {
    await execute(
      "ALTER TABLE settings ADD COLUMN setting_key VARCHAR(150) NOT NULL DEFAULT ''"
    );
  }

  if (!(await columnExists("settings", "setting_value"))) {
    await execute("ALTER TABLE settings ADD COLUMN setting_value TEXT");
  }

  try {
    await execute(
      "CREATE UNIQUE INDEX idx_hotels_slug ON hotels(slug)"
    );
  } catch {
    // The index may already exist or legacy data may contain duplicate slugs.
  }
}

// ======================================================
// VERCEL AND LOCAL SERVER STARTUP
// Register readiness middleware BEFORE all routes.
// ======================================================

const startupPromise = new Promise((resolve, reject) => {
  db.connect(async (error) => {
    if (error) {
      console.error("MySQL connection error:", error.message);
      return reject(error);
    }

    console.log("MySQL connected successfully!");
    console.log("Database:", databaseName);

    try {
      await initializeDatabase();
      console.log("Growth Lodge database initialized successfully.");
      resolve();
    } catch (initError) {
      console.error("DATABASE INITIALIZATION FAILED:", initError.message);
      reject(initError);
    }
  });
});

startupPromise.catch(() => {});

app.use(async (req, res, next) => {
  try {
    await startupPromise;
    next();
  } catch (error) {
    console.error("Backend startup failed:", error.message);

    if (!res.headersSent) {
      res.status(503).json({
        success: false,
        message: "Backend database is unavailable. Check the database configuration.",
      });
    }
  }
});

// ======================================================
// ROOT
// ======================================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Growth Lodge Backend API is running",
  });
});

app.get("/api/health", async (req, res) => {
  try {
    await query("SELECT 1 AS connected");

    res.json({
      success: true,
      message: "Growth Lodge API and database are connected",
      database: databaseName,
    });
  } catch (error) {
    sendError(res, "Database health check failed", error, 503);
  }
});

// ======================================================
// HOTELS
// ======================================================

app.post("/api/hotels/register", async (req, res) => {
  try {
    const {
      hotel_name,
      name,
      email,
      phone,
      address,
      city,
      country,
      description,
      full_name,
      password,
    } = req.body;

    const finalHotelName = String(hotel_name || name || "").trim();
    const normalizedEmail = normalizeEmail(email);
    const ownerName = String(full_name || "").trim();

    if (!finalHotelName || !normalizedEmail || !ownerName || !password) {
      return res.status(400).json({
        success: false,
        message: "Hotel name, owner name, email and password are required",
      });
    }

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters and contain at least 3 of uppercase, lowercase, number and special character",
      });
    }

    const existingHotel = await query(
      "SELECT id FROM hotels WHERE email = ? LIMIT 1",
      [normalizedEmail]
    );

    if (existingHotel.length) {
      return res.status(409).json({
        success: false,
        message: "A hotel with this email already exists",
      });
    }

    const slugBase = createSlug(finalHotelName) || `hotel-${Date.now()}`;
    let slug = slugBase;
    let counter = 1;

    while (
      (
        await query(
          "SELECT id FROM hotels WHERE slug = ? LIMIT 1",
          [slug]
        )
      ).length
    ) {
      slug = `${slugBase}-${counter++}`;
    }

    const hotelResult = await query(
      `INSERT INTO hotels
       (hotel_name, email, phone, address, city, country, description, status, slug)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?)`,
      [
        finalHotelName,
        normalizedEmail,
        phone || "",
        address || "",
        city || "",
        country || "Nigeria",
        description || "",
        slug,
      ]
    );

    const hotelId = hotelResult.insertId;

    await query(
      `INSERT INTO settings (hotel_id, setting_key, setting_value)
       VALUES (?, 'hotel_name', ?), (?, 'currency', 'NGN'), (?, 'timezone', 'Africa/Lagos')`,
      [hotelId, finalHotelName, hotelId, hotelId]
    );

    const otp = generateOTP();

    await query(
      `INSERT INTO email_verifications
       (hotel_id, full_name, email, phone, password_hash, role, otp, expires_at)
       VALUES (?, ?, ?, ?, ?, 'admin', ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE))`,
      [
        hotelId,
        ownerName,
        normalizedEmail,
        phone || "",
        hashPassword(password),
        otp,
      ]
    );

    try {
      await sendVerificationOTP(ownerName, normalizedEmail, otp);
    } catch (emailError) {
      console.error("HOTEL VERIFICATION EMAIL ERROR:", emailError.message);

      await query(
        "DELETE FROM email_verifications WHERE hotel_id = ? AND email = ?",
        [hotelId, normalizedEmail]
      );
      await query("DELETE FROM settings WHERE hotel_id = ?", [hotelId]);
      await query("DELETE FROM hotels WHERE id = ?", [hotelId]);

      return res.status(500).json({
        success: false,
        message: "Hotel registration could not send the verification email. Please try again.",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Hotel registered successfully. Check your email for the verification code.",
      hotel_id: hotelId,
      hotel: {
        id: hotelId,
        hotel_name: finalHotelName,
        email: normalizedEmail,
        phone: phone || "",
        address: address || "",
        city: city || "",
        country: country || "Nigeria",
        slug,
      },
    });
  } catch (error) {
    return sendError(res, "Could not register hotel", error);
  }
});

app.post("/api/hotels/verify-otp", async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const otp = String(req.body.otp || "").trim();
    const hotelId = Number(req.body.hotel_id);

    if (!email || !otp || !Number.isInteger(hotelId) || hotelId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Email, OTP and hotel are required",
      });
    }

    const records = await query(
      `SELECT * FROM email_verifications
       WHERE email = ? AND hotel_id = ? AND role = 'admin'
         AND otp = ? AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [email, hotelId, otp]
    );

    if (!records.length) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code",
      });
    }

    const pending = records[0];

    const existingAdmin = await query(
      "SELECT id FROM users WHERE hotel_id = ? AND role = 'admin' LIMIT 1",
      [hotelId]
    );

    let userId;

    if (existingAdmin.length) {
      userId = existingAdmin[0].id;

      await query(
        `UPDATE users SET full_name = ?, email = ?, phone = ?, password = ?
         WHERE id = ? AND hotel_id = ?`,
        [
          pending.full_name,
          pending.email,
          pending.phone,
          pending.password_hash,
          userId,
          hotelId,
        ]
      );
    } else {
      const result = await query(
        `INSERT INTO users (hotel_id, full_name, email, phone, password, role)
         VALUES (?, ?, ?, ?, ?, 'admin')`,
        [
          hotelId,
          pending.full_name,
          pending.email,
          pending.phone,
          pending.password_hash,
        ]
      );

      userId = result.insertId;
    }

    await query("DELETE FROM email_verifications WHERE id = ?", [pending.id]);

    const users = await query(
      `SELECT id, hotel_id, full_name, email, phone, role, created_at
       FROM users WHERE id = ? LIMIT 1`,
      [userId]
    );

    const hotel = await getHotelById(hotelId);

    return res.json({
      success: true,
      message: "Email verified successfully",
      user: users[0],
      hotel,
    });
  } catch (error) {
    return sendError(res, "Could not verify hotel email", error);
  }
});

app.post("/api/hotels/resend-otp", async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const hotelId = Number(req.body.hotel_id);

    if (!email || !Number.isInteger(hotelId) || hotelId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Email and hotel are required",
      });
    }

    const rows = await query(
      `SELECT * FROM email_verifications
       WHERE email = ? AND hotel_id = ? AND role = 'admin'
       ORDER BY created_at DESC LIMIT 1`,
      [email, hotelId]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "No pending verification found",
      });
    }

    const pending = rows[0];
    const otp = generateOTP();

    await query(
      `UPDATE email_verifications
       SET otp = ?, expires_at = DATE_ADD(NOW(), INTERVAL 10 MINUTE), created_at = NOW()
       WHERE id = ?`,
      [otp, pending.id]
    );

    await sendVerificationOTP(pending.full_name, email, otp);

    return res.json({
      success: true,
      message: "A new verification code has been sent",
    });
  } catch (error) {
    return sendError(res, "Could not resend verification code", error);
  }
});

app.post("/api/hotels", async (req, res) => {
  try {
    const {
      hotel_name,
      name,
      email,
      phone,
      address,
      city,
      country,
      description,
    } = req.body;

    const finalHotelName = String(hotel_name || name || "").trim();
    const normalizedEmail = normalizeEmail(email);

    if (!finalHotelName || !normalizedEmail) {
      return res.status(400).json({
        success: false,
        message: "Hotel name and email are required",
      });
    }

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    const slugBase = createSlug(finalHotelName) || `hotel-${Date.now()}`;
    let slug = slugBase;
    let counter = 1;

    while (
      (
        await query(
          "SELECT id FROM hotels WHERE slug = ? LIMIT 1",
          [slug]
        )
      ).length
    ) {
      slug = `${slugBase}-${counter++}`;
    }

    const result = await query(
      `INSERT INTO hotels
       (hotel_name, email, phone, address, city, country, description, status, slug)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?)`,
      [
        finalHotelName,
        normalizedEmail,
        phone || "",
        address || "",
        city || "",
        country || "Nigeria",
        description || "",
        slug,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Hotel created successfully",
      hotel: {
        id: result.insertId,
        hotel_name: finalHotelName,
        email: normalizedEmail,
        phone: phone || "",
        address: address || "",
        city: city || "",
        country: country || "Nigeria",
        description: description || "",
        status: "active",
        slug,
      },
    });
  } catch (error) {
    return sendError(res, "Could not create hotel", error);
  }
});

app.get("/api/hotels", async (req, res) => {
  try {
    const hotels = await query(
      `SELECT id, hotel_name, email, phone, address, city, country,
              description, status, created_at, slug
       FROM hotels ORDER BY created_at DESC`
    );

    return res.json({ success: true, hotels });
  } catch (error) {
    return sendError(res, "Could not fetch hotels", error);
  }
});

app.get("/api/hotels/:id", async (req, res) => {
  try {
    const hotel = await getHotelById(Number(req.params.id));

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found",
      });
    }

    return res.json({ success: true, hotel });
  } catch (error) {
    return sendError(res, "Could not fetch hotel", error);
  }
});

app.put("/api/hotels/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const {
      hotel_name,
      email,
      phone,
      address,
      city,
      country,
      description,
      status,
    } = req.body;

    const normalizedEmail = normalizeEmail(email);

    if (!hotel_name || !normalizedEmail) {
      return res.status(400).json({
        success: false,
        message: "Hotel name and email are required",
      });
    }

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    const result = await query(
      `UPDATE hotels SET hotel_name = ?, email = ?, phone = ?,
       address = ?, city = ?, country = ?, description = ?, status = ?
       WHERE id = ?`,
      [
        hotel_name,
        normalizedEmail,
        phone || "",
        address || "",
        city || "",
        country || "",
        description || "",
        status || "active",
        id,
      ]
    );

    if (!result.affectedRows) {
      const existing = await getHotelById(id);

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: "Hotel not found",
        });
      }
    }

    return res.json({
      success: true,
      message: "Hotel updated successfully",
    });
  } catch (error) {
    return sendError(res, "Could not update hotel", error);
  }
});

// ======================================================
// AUTHENTICATION: REGISTER, VERIFY OTP, RESEND OTP, LOGIN
// ======================================================

app.post("/api/auth/register", async (req, res) => {
  try {
    const {
      full_name,
      name,
      email,
      phone,
      password,
      role = "customer",
      hotel_id,
    } = req.body;

    const finalName = String(full_name || name || "").trim();
    const normalizedEmail = normalizeEmail(email);
    const normalizedPhone = String(phone || "").trim();
    const hotelId = hotel_id ? Number(hotel_id) : getHotelId(req);
    const allowedRoles = ["customer", "staff", "admin"];

    if (!finalName || !normalizedEmail || !normalizedPhone || !password) {
      return res.status(400).json({
        success: false,
        message: "Full name, email, phone and password are required",
      });
    }

    if (!hotelId || !Number.isInteger(hotelId) || hotelId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Hotel is required",
      });
    }

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid account role",
      });
    }

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    if (!isValidPhone(normalizedPhone)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid phone number",
      });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters and contain at least 3 of uppercase, lowercase, number and special character",
      });
    }

    if (!(await hotelExists(hotelId))) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found",
      });
    }

    const existingUser = await query(
      "SELECT id FROM users WHERE email = ? AND hotel_id = ? LIMIT 1",
      [normalizedEmail, hotelId]
    );

    if (existingUser.length) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists in this hotel",
      });
    }

    const otp = generateOTP();

    const pendingRows = await query(
      `SELECT id FROM email_verifications
       WHERE email = ? AND hotel_id = ?
       ORDER BY created_at DESC LIMIT 1`,
      [normalizedEmail, hotelId]
    );

    if (pendingRows.length) {
      await query(
        `UPDATE email_verifications
         SET full_name = ?, phone = ?, password_hash = ?, role = ?,
             otp = ?, expires_at = DATE_ADD(NOW(), INTERVAL 10 MINUTE),
             created_at = NOW()
         WHERE id = ?`,
        [
          finalName,
          normalizedPhone,
          hashPassword(password),
          role,
          otp,
          pendingRows[0].id,
        ]
      );
    } else {
      await query(
        `INSERT INTO email_verifications
         (hotel_id, full_name, email, phone, password_hash, role, otp, expires_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE))`,
        [
          hotelId,
          finalName,
          normalizedEmail,
          normalizedPhone,
          hashPassword(password),
          role,
          otp,
        ]
      );
    }

    try {
      await sendVerificationOTP(finalName, normalizedEmail, otp);
    } catch (emailError) {
      console.error("REGISTRATION EMAIL ERROR:", emailError.message);

      return res.status(500).json({
        success: false,
        message: "Could not send verification email. Check the Brevo configuration.",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Verification code sent to your email",
      hotel_id: hotelId,
      email: normalizedEmail,
    });
  } catch (error) {
    return sendError(res, "Could not register account", error);
  }
});

app.post("/api/auth/verify-otp", async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const otp = String(req.body.otp || "").trim();
    const hotelId = Number(req.body.hotel_id);

    if (!email || !otp || !Number.isInteger(hotelId) || hotelId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Email, OTP and hotel are required",
      });
    }

    const pendingRows = await query(
      `SELECT * FROM email_verifications
       WHERE email = ? AND hotel_id = ? AND otp = ?
         AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [email, hotelId, otp]
    );

    if (!pendingRows.length) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code",
      });
    }

    const pending = pendingRows[0];

    const existing = await query(
      "SELECT id FROM users WHERE email = ? AND hotel_id = ? LIMIT 1",
      [email, hotelId]
    );

    let userId;

    if (existing.length) {
      userId = existing[0].id;

      await query(
        `UPDATE users
         SET full_name = ?, phone = ?, password = ?, role = ?
         WHERE id = ? AND hotel_id = ?`,
        [
          pending.full_name,
          pending.phone,
          pending.password_hash,
          pending.role,
          userId,
          hotelId,
        ]
      );
    } else {
      const result = await query(
        `INSERT INTO users
         (hotel_id, full_name, email, phone, password, role)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          hotelId,
          pending.full_name,
          pending.email,
          pending.phone,
          pending.password_hash,
          pending.role,
        ]
      );

      userId = result.insertId;
    }

    await query("DELETE FROM email_verifications WHERE id = ?", [pending.id]);

    const userRows = await query(
      `SELECT id, hotel_id, full_name, email, phone, role, created_at
       FROM users WHERE id = ? LIMIT 1`,
      [userId]
    );

    const hotel = await getHotelById(hotelId);

    return res.json({
      success: true,
      message: "Email verified successfully",
      user: userRows[0],
      hotel,
    });
  } catch (error) {
    return sendError(res, "Could not verify account", error);
  }
});

app.post("/api/auth/resend-otp", async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const hotelId = Number(req.body.hotel_id);

    if (!email || !Number.isInteger(hotelId) || hotelId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Email and hotel are required",
      });
    }

    const rows = await query(
      `SELECT * FROM email_verifications
       WHERE email = ? AND hotel_id = ?
       ORDER BY created_at DESC LIMIT 1`,
      [email, hotelId]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "No pending verification found",
      });
    }

    const pending = rows[0];
    const otp = generateOTP();

    await query(
      `UPDATE email_verifications
       SET otp = ?, expires_at = DATE_ADD(NOW(), INTERVAL 10 MINUTE),
           created_at = NOW()
       WHERE id = ?`,
      [otp, pending.id]
    );

    await sendVerificationOTP(pending.full_name, email, otp);

    return res.json({
      success: true,
      message: "A new verification code has been sent",
    });
  } catch (error) {
    return sendError(res, "Could not resend verification code", error);
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const {
      email,
      password,
      role,
      hotel_id,
    } = req.body;

    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    const passwordHash = hashPassword(password);

    let sql = `
      SELECT
        u.id, u.hotel_id, u.full_name, u.email, u.phone,
        u.password, u.role, u.created_at,
        h.hotel_name, h.email AS hotel_email, h.phone AS hotel_phone,
        h.address AS hotel_address, h.city AS hotel_city,
        h.country AS hotel_country, h.description AS hotel_description,
        h.status AS hotel_status, h.slug AS hotel_slug
      FROM users u
      LEFT JOIN hotels h ON u.hotel_id = h.id
      WHERE LOWER(u.email) = ? AND u.password = ?
    `;

    const params = [normalizedEmail, passwordHash];

    if (role) {
      sql += " AND u.role = ?";
      params.push(role);
    }

    if (hotel_id !== undefined && hotel_id !== null && hotel_id !== "") {
      const requestedHotelId = Number(hotel_id);

      if (!Number.isInteger(requestedHotelId) || requestedHotelId <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid hotel ID",
        });
      }

      sql += " AND u.hotel_id = ?";
      params.push(requestedHotelId);
    }

    sql += " LIMIT 1";

    const users = await query(sql, params);

    if (!users.length) {
      return res.status(401).json({
        success: false,
        message: "Invalid email, password, hotel or account role",
      });
    }

    const dbUser = users[0];

    if (!dbUser.hotel_id || !dbUser.hotel_name) {
      return res.status(403).json({
        success: false,
        message: "Your account is not connected to a hotel workspace",
      });
    }

    if (dbUser.hotel_status && dbUser.hotel_status !== "active") {
      return res.status(403).json({
        success: false,
        message: "This hotel workspace is not active",
      });
    }

    const user = {
      id: dbUser.id,
      hotel_id: dbUser.hotel_id,
      full_name: dbUser.full_name,
      email: dbUser.email,
      phone: dbUser.phone,
      role: dbUser.role,
      created_at: dbUser.created_at,
    };

    const hotel = {
      id: dbUser.hotel_id,
      hotel_name: dbUser.hotel_name,
      email: dbUser.hotel_email,
      phone: dbUser.hotel_phone,
      address: dbUser.hotel_address,
      city: dbUser.hotel_city,
      country: dbUser.hotel_country,
      description: dbUser.hotel_description,
      status: dbUser.hotel_status,
      slug: dbUser.hotel_slug,
    };

    return res.json({
      success: true,
      message: "Login successful",
      hotel_id: dbUser.hotel_id,
      user,
      hotel,
    });
  } catch (error) {
    return sendError(res, "Could not login", error);
  }
});

// ======================================================
// AUTH USERS
// ======================================================

app.get("/api/auth/users", async (req, res) => {
  try {
    const hotelId = getHotelId(req);

    if (!hotelId) {
      return res.status(400).json({
        success: false,
        message: "Hotel is required",
      });
    }

    const users = await query(
      `SELECT id, hotel_id, full_name, email, phone, role, created_at
       FROM users WHERE hotel_id = ? ORDER BY created_at DESC`,
      [hotelId]
    );

    return res.json({ success: true, users });
  } catch (error) {
    return sendError(res, "Could not fetch users", error);
  }
});

app.get("/api/auth/users/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const hotelId = getHotelId(req);

    if (!hotelId) {
      return res.status(400).json({
        success: false,
        message: "Hotel is required",
      });
    }

    const users = await query(
      `SELECT id, hotel_id, full_name, email, phone, role, created_at
       FROM users WHERE id = ? AND hotel_id = ? LIMIT 1`,
      [id, hotelId]
    );

    if (!users.length) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({ success: true, user: users[0] });
  } catch (error) {
    return sendError(res, "Could not fetch user", error);
  }
});

app.put("/api/auth/users/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const hotelId = getHotelId(req);
    const { full_name, email, phone } = req.body;

    if (!hotelId) {
      return res.status(400).json({
        success: false,
        message: "Hotel is required",
      });
    }

    if (!full_name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: "Full name, email and phone are required",
      });
    }

    const normalizedEmail = normalizeEmail(email);
    const normalizedPhone = String(phone).trim();

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    if (!isValidPhone(normalizedPhone)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid phone number",
      });
    }

    const duplicate = await query(
      `SELECT id FROM users
       WHERE email = ? AND hotel_id = ? AND id != ? LIMIT 1`,
      [normalizedEmail, hotelId, id]
    );

    if (duplicate.length) {
      return res.status(409).json({
        success: false,
        message: "Another account already uses this email",
      });
    }

    const result = await query(
      `UPDATE users SET full_name = ?, email = ?, phone = ?
       WHERE id = ? AND hotel_id = ?`,
      [full_name, normalizedEmail, normalizedPhone, id, hotelId]
    );

    if (!result.affectedRows) {
      const existing = await query(
        "SELECT id FROM users WHERE id = ? AND hotel_id = ?",
        [id, hotelId]
      );

      if (!existing.length) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }
    }

    return res.json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (error) {
    return sendError(res, "Could not update profile", error);
  }
});

app.put("/api/auth/users/:id/password", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const hotelId = getHotelId(req);
    const { password } = req.body;

    if (!hotelId) {
      return res.status(400).json({
        success: false,
        message: "Hotel is required",
      });
    }

    if (!password || !isStrongPassword(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters and contain at least 3 of uppercase, lowercase, number and special character",
      });
    }

    const result = await query(
      "UPDATE users SET password = ? WHERE id = ? AND hotel_id = ?",
      [hashPassword(password), id, hotelId]
    );

    if (!result.affectedRows) {
      const existing = await query(
        "SELECT id FROM users WHERE id = ? AND hotel_id = ?",
        [id, hotelId]
      );

      if (!existing.length) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }
    }

    return res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    return sendError(res, "Could not change password", error);
  }
});

// ======================================================
// GUESTS
// ======================================================

app.get("/api/guests", async (req, res) => {
  try {
    const hotelId = getHotelId(req);

    if (!hotelId) {
      return res.status(400).json({
        success: false,
        message: "Hotel is required",
      });
    }

    const guests = await query(
      `SELECT id, hotel_id, full_name, email, phone, role, created_at
       FROM users WHERE hotel_id = ? AND role = 'customer'
       ORDER BY created_at DESC`,
      [hotelId]
    );

    return res.json({ success: true, guests });
  } catch (error) {
    return sendError(res, "Could not fetch guests", error);
  }
});

app.post("/api/guests", async (req, res) => {
  try {
    const hotelId = getHotelId(req);
    const { full_name, email, phone, password } = req.body;

    if (!hotelId) {
      return res.status(400).json({
        success: false,
        message: "Hotel is required",
      });
    }

    if (!full_name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "Full name, email, phone and password are required",
      });
    }

    const normalizedEmail = normalizeEmail(email);
    const normalizedPhone = String(phone).trim();

    if (!isValidEmail(normalizedEmail) || !isValidPhone(normalizedPhone)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address and phone number",
      });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters and contain at least 3 of uppercase, lowercase, number and special character",
      });
    }

    const existing = await query(
      "SELECT id FROM users WHERE email = ? AND hotel_id = ? LIMIT 1",
      [normalizedEmail, hotelId]
    );

    if (existing.length) {
      return res.status(409).json({
        success: false,
        message: "Another account already uses this email",
      });
    }

    const result = await query(
      `INSERT INTO users (hotel_id, full_name, email, phone, password, role)
       VALUES (?, ?, ?, ?, ?, 'customer')`,
      [
        hotelId,
        full_name,
        normalizedEmail,
        normalizedPhone,
        hashPassword(password),
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Guest created successfully",
      guest: {
        id: result.insertId,
        hotel_id: hotelId,
        full_name,
        email: normalizedEmail,
        phone: normalizedPhone,
        role: "customer",
      },
    });
  } catch (error) {
    return sendError(res, "Could not create guest", error);
  }
});

app.put("/api/guests/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const hotelId = getHotelId(req);
    const { full_name, email, phone, password } = req.body;

    if (!hotelId) {
      return res.status(400).json({
        success: false,
        message: "Hotel is required",
      });
    }

    if (!full_name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: "Full name, email and phone are required",
      });
    }

    const normalizedEmail = normalizeEmail(email);
    const normalizedPhone = String(phone).trim();

    if (!isValidEmail(normalizedEmail) || !isValidPhone(normalizedPhone)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address and phone number",
      });
    }

    const duplicate = await query(
      `SELECT id FROM users
       WHERE email = ? AND hotel_id = ? AND id != ? LIMIT 1`,
      [normalizedEmail, hotelId, id]
    );

    if (duplicate.length) {
      return res.status(409).json({
        success: false,
        message: "Another account already uses this email",
      });
    }

    if (password) {
      if (!isStrongPassword(password)) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 8 characters and contain at least 3 of uppercase, lowercase, number and special character",
        });
      }

      await query(
        `UPDATE users SET full_name = ?, email = ?, phone = ?, password = ?
         WHERE id = ? AND hotel_id = ? AND role = 'customer'`,
        [
          full_name,
          normalizedEmail,
          normalizedPhone,
          hashPassword(password),
          id,
          hotelId,
        ]
      );
    } else {
      await query(
        `UPDATE users SET full_name = ?, email = ?, phone = ?
         WHERE id = ? AND hotel_id = ? AND role = 'customer'`,
        [full_name, normalizedEmail, normalizedPhone, id, hotelId]
      );
    }

    const guest = await query(
      "SELECT id FROM users WHERE id = ? AND hotel_id = ? AND role = 'customer'",
      [id, hotelId]
    );

    if (!guest.length) {
      return res.status(404).json({
        success: false,
        message: "Guest not found",
      });
    }

    return res.json({
      success: true,
      message: "Guest updated successfully",
    });
  } catch (error) {
    return sendError(res, "Could not update guest", error);
  }
});

app.delete("/api/guests/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const hotelId = getHotelId(req);

    if (!hotelId) {
      return res.status(400).json({
        success: false,
        message: "Hotel is required",
      });
    }

    const result = await query(
      "DELETE FROM users WHERE id = ? AND hotel_id = ? AND role = 'customer'",
      [id, hotelId]
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        success: false,
        message: "Guest not found",
      });
    }

    return res.json({
      success: true,
      message: "Guest deleted successfully",
    });
  } catch (error) {
    return sendError(res, "Could not delete guest", error);
  }
});

// ======================================================
// STAFF
// ======================================================

app.get("/api/staff", async (req, res) => {
  try {
    const hotelId = getHotelId(req);

    if (!hotelId) {
      return res.status(400).json({
        success: false,
        message: "Hotel is required",
      });
    }

    const staff = await query(
      `SELECT id, hotel_id, full_name, email, phone, role, created_at
       FROM users WHERE hotel_id = ? AND role = 'staff'
       ORDER BY created_at DESC`,
      [hotelId]
    );

    return res.json({ success: true, staff });
  } catch (error) {
    return sendError(res, "Could not fetch staff", error);
  }
});

app.get("/api/staff/:id/profile", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const hotelId = getHotelId(req);

    if (!hotelId) {
      return res.status(400).json({
        success: false,
        message: "Hotel is required",
      });
    }

    const staff = await query(
      `SELECT id, hotel_id, full_name, email, phone, role, created_at
       FROM users WHERE id = ? AND hotel_id = ? AND role = 'staff' LIMIT 1`,
      [id, hotelId]
    );

    if (!staff.length) {
      return res.status(404).json({
        success: false,
        message: "Staff profile not found",
      });
    }

    return res.json({ success: true, profile: staff[0] });
  } catch (error) {
    return sendError(res, "Could not fetch staff profile", error);
  }
});

app.put("/api/staff/:id/profile", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const hotelId = getHotelId(req);
    const { full_name, email, phone } = req.body;

    if (!hotelId) {
      return res.status(400).json({
        success: false,
        message: "Hotel is required",
      });
    }

    if (!full_name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: "Full name, email and phone are required",
      });
    }

    const normalizedEmail = normalizeEmail(email);
    const normalizedPhone = String(phone).trim();

    if (!isValidEmail(normalizedEmail) || !isValidPhone(normalizedPhone)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address and phone number",
      });
    }

    const duplicate = await query(
      `SELECT id FROM users
       WHERE email = ? AND hotel_id = ? AND id != ? LIMIT 1`,
      [normalizedEmail, hotelId, id]
    );

    if (duplicate.length) {
      return res.status(409).json({
        success: false,
        message: "Another account already uses this email",
      });
    }

    const result = await query(
      `UPDATE users SET full_name = ?, email = ?, phone = ?
       WHERE id = ? AND hotel_id = ? AND role = 'staff'`,
      [full_name, normalizedEmail, normalizedPhone, id, hotelId]
    );

    if (!result.affectedRows) {
      const staff = await query(
        "SELECT id FROM users WHERE id = ? AND hotel_id = ? AND role = 'staff'",
        [id, hotelId]
      );

      if (!staff.length) {
        return res.status(404).json({
          success: false,
          message: "Staff member not found",
        });
      }
    }

    return res.json({
      success: true,
      message: "Staff profile updated successfully",
    });
  } catch (error) {
    return sendError(res, "Could not update staff profile", error);
  }
});

app.put("/api/staff/:id/password", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const hotelId = getHotelId(req);
    const { password } = req.body;

    if (!hotelId) {
      return res.status(400).json({
        success: false,
        message: "Hotel is required",
      });
    }

    if (!password || !isStrongPassword(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters and contain at least 3 of uppercase, lowercase, number and special character",
      });
    }

    const result = await query(
      `UPDATE users SET password = ?
       WHERE id = ? AND hotel_id = ? AND role = 'staff'`,
      [hashPassword(password), id, hotelId]
    );

    if (!result.affectedRows) {
      const staff = await query(
        "SELECT id FROM users WHERE id = ? AND hotel_id = ? AND role = 'staff'",
        [id, hotelId]
      );

      if (!staff.length) {
        return res.status(404).json({
          success: false,
          message: "Staff member not found",
        });
      }
    }

    return res.json({
      success: true,
      message: "Staff password changed successfully",
    });
  } catch (error) {
    return sendError(res, "Could not change staff password", error);
  }
});

// Keep this endpoint for clients that request a staff member by ID.
app.get("/api/staff/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const hotelId = getHotelId(req);

    if (!hotelId) {
      return res.status(400).json({
        success: false,
        message: "Hotel is required",
      });
    }

    const staff = await query(
      `SELECT id, hotel_id, full_name, email, phone, role, created_at
       FROM users WHERE id = ? AND hotel_id = ? AND role = 'staff' LIMIT 1`,
      [id, hotelId]
    );

    if (!staff.length) {
      return res.status(404).json({
        success: false,
        message: "Staff member not found",
      });
    }

    return res.json({ success: true, staff: staff[0] });
  } catch (error) {
    return sendError(res, "Could not fetch staff", error);
  }
});

// ======================================================
// ROOMS
// ======================================================

app.get("/api/rooms", async (req, res) => {
  try {
    const hotelId = getHotelId(req);

    if (!hotelId) {
      return res.status(400).json({
        success: false,
        message: "Hotel is required",
      });
    }

    const rooms = await query(
      `SELECT id, hotel_id, room_number, room_type, price, status,
              description, created_at
       FROM rooms WHERE hotel_id = ? ORDER BY id DESC`,
      [hotelId]
    );

    return res.json({ success: true, rooms });
  } catch (error) {
    return sendError(res, "Could not fetch rooms", error);
  }
});

app.post("/api/rooms", async (req, res) => {
  try {
    const hotelId = getHotelId(req);
    const { room_number, room_type, price, status, description } = req.body;

    if (!hotelId) {
      return res.status(400).json({
        success: false,
        message: "Hotel is required",
      });
    }

    if (!room_number || !room_type || price === undefined || !status) {
      return res.status(400).json({
        success: false,
        message: "Room number, room type, price and status are required",
      });
    }

    if (!(await hotelExists(hotelId))) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found",
      });
    }

    const existing = await query(
      "SELECT id FROM rooms WHERE hotel_id = ? AND room_number = ? LIMIT 1",
      [hotelId, room_number]
    );

    if (existing.length) {
      return res.status(409).json({
        success: false,
        message: "This room number already exists in this hotel",
      });
    }

    const result = await query(
      `INSERT INTO rooms
       (hotel_id, room_number, room_type, price, status, description)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [hotelId, room_number, room_type, price, status, description || ""]
    );

    return res.status(201).json({
      success: true,
      message: "Room added successfully",
      room: {
        id: result.insertId,
        hotel_id: hotelId,
        room_number,
        room_type,
        price,
        status,
        description: description || "",
      },
    });
  } catch (error) {
    return sendError(res, "Could not add room", error);
  }
});

app.put("/api/rooms/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const hotelId = getHotelId(req);
    const { room_number, room_type, price, status, description } = req.body;

    if (!hotelId) {
      return res.status(400).json({
        success: false,
        message: "Hotel is required",
      });
    }

    if (!room_number || !room_type || price === undefined || !status) {
      return res.status(400).json({
        success: false,
        message: "Room number, room type, price and status are required",
      });
    }

    const result = await query(
      `UPDATE rooms SET room_number = ?, room_type = ?, price = ?,
       status = ?, description = ? WHERE id = ? AND hotel_id = ?`,
      [room_number, room_type, price, status, description || "", id, hotelId]
    );

    if (!result.affectedRows) {
      const room = await query(
        "SELECT id FROM rooms WHERE id = ? AND hotel_id = ?",
        [id, hotelId]
      );

      if (!room.length) {
        return res.status(404).json({
          success: false,
          message: "Room not found",
        });
      }
    }

    return res.json({
      success: true,
      message: "Room updated successfully",
    });
  } catch (error) {
    return sendError(res, "Could not update room", error);
  }
});

app.delete("/api/rooms/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const hotelId = getHotelId(req);

    if (!hotelId) {
      return res.status(400).json({
        success: false,
        message: "Hotel is required",
      });
    }

    const result = await query(
      "DELETE FROM rooms WHERE id = ? AND hotel_id = ?",
      [id, hotelId]
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    return res.json({
      success: true,
      message: "Room deleted successfully",
    });
  } catch (error) {
    return sendError(res, "Could not delete room", error);
  }
});

// ======================================================
// RESERVATIONS
// ======================================================

app.get("/api/reservations", async (req, res) => {
  try {
    const hotelId = getHotelId(req);

    if (!hotelId) {
      return res.status(400).json({
        success: false,
        message: "Hotel is required",
      });
    }

    const reservations = await query(
      `SELECT
         r.id, r.hotel_id, r.user_id, r.room_id, r.check_in,
         r.check_out, r.guests, r.status, r.created_at,
         u.full_name AS guest_name, u.email AS guest_email,
         u.phone AS guest_phone,
         rm.room_number, rm.room_type, rm.price AS room_price
       FROM reservations r
       LEFT JOIN users u ON r.user_id = u.id AND u.hotel_id = r.hotel_id
       LEFT JOIN rooms rm ON r.room_id = rm.id AND rm.hotel_id = r.hotel_id
       WHERE r.hotel_id = ?
       ORDER BY r.created_at DESC`,
      [hotelId]
    );

    return res.json({ success: true, reservations });
  } catch (error) {
    return sendError(res, "Could not fetch reservations", error);
  }
});

app.post("/api/reservations", async (req, res) => {
  try {
    const hotelId = getHotelId(req);
    const {
      user_id,
      room_id,
      check_in,
      check_out,
      guests,
      status = "pending",
    } = req.body;

    if (!hotelId) {
      return res.status(400).json({
        success: false,
        message: "Hotel is required",
      });
    }

    if (!user_id || !room_id || !check_in || !check_out || !guests) {
      return res.status(400).json({
        success: false,
        message: "User, room, check-in, check-out and guest count are required",
      });
    }

    if (new Date(check_out) <= new Date(check_in)) {
      return res.status(400).json({
        success: false,
        message: "Check-out must be after check-in",
      });
    }

    const users = await query(
      `SELECT id FROM users
       WHERE id = ? AND hotel_id = ? AND role = 'customer' LIMIT 1`,
      [user_id, hotelId]
    );

    if (!users.length) {
      return res.status(404).json({
        success: false,
        message: "Guest does not belong to this hotel",
      });
    }

    const rooms = await query(
      "SELECT id FROM rooms WHERE id = ? AND hotel_id = ? LIMIT 1",
      [room_id, hotelId]
    );

    if (!rooms.length) {
      return res.status(404).json({
        success: false,
        message: "Room does not belong to this hotel",
      });
    }

    const result = await query(
      `INSERT INTO reservations
       (hotel_id, user_id, room_id, check_in, check_out, guests, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [hotelId, user_id, room_id, check_in, check_out, guests, status]
    );

    return res.status(201).json({
      success: true,
      message: "Reservation created successfully",
      reservation: {
        id: result.insertId,
        hotel_id: hotelId,
        user_id,
        room_id,
        check_in,
        check_out,
        guests,
        status,
      },
    });
  } catch (error) {
    return sendError(res, "Could not create reservation", error);
  }
});

app.put("/api/reservations/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const hotelId = getHotelId(req);
    const {
      user_id,
      room_id,
      check_in,
      check_out,
      guests,
      status,
    } = req.body;

    if (!hotelId) {
      return res.status(400).json({
        success: false,
        message: "Hotel is required",
      });
    }

    // Allow updating only the reservation status.
    if (status && !user_id && !room_id && !check_in && !check_out && !guests) {
      const result = await query(
        "UPDATE reservations SET status = ? WHERE id = ? AND hotel_id = ?",
        [status, id, hotelId]
      );

      if (!result.affectedRows) {
        const rows = await query(
          "SELECT id FROM reservations WHERE id = ? AND hotel_id = ?",
          [id, hotelId]
        );

        if (!rows.length) {
          return res.status(404).json({
            success: false,
            message: "Reservation not found",
          });
        }
      }

      return res.json({
        success: true,
        message: "Reservation status updated successfully",
      });
    }

    if (!user_id || !room_id || !check_in || !check_out || !guests || !status) {
      return res.status(400).json({
        success: false,
        message: "All reservation fields are required",
      });
    }

    if (new Date(check_out) <= new Date(check_in)) {
      return res.status(400).json({
        success: false,
        message: "Check-out must be after check-in",
      });
    }

    const userCheck = await query(
      `SELECT id FROM users
       WHERE id = ? AND hotel_id = ? AND role = 'customer' LIMIT 1`,
      [user_id, hotelId]
    );

    if (!userCheck.length) {
      return res.status(404).json({
        success: false,
        message: "Guest does not belong to this hotel",
      });
    }

    const roomCheck = await query(
      "SELECT id FROM rooms WHERE id = ? AND hotel_id = ? LIMIT 1",
      [room_id, hotelId]
    );

    if (!roomCheck.length) {
      return res.status(404).json({
        success: false,
        message: "Room does not belong to this hotel",
      });
    }

    const result = await query(
      `UPDATE reservations SET user_id = ?, room_id = ?, check_in = ?,
       check_out = ?, guests = ?, status = ?
       WHERE id = ? AND hotel_id = ?`,
      [user_id, room_id, check_in, check_out, guests, status, id, hotelId]
    );

    if (!result.affectedRows) {
      const rows = await query(
        "SELECT id FROM reservations WHERE id = ? AND hotel_id = ?",
        [id, hotelId]
      );

      if (!rows.length) {
        return res.status(404).json({
          success: false,
          message: "Reservation not found",
        });
      }
    }

    return res.json({
      success: true,
      message: "Reservation updated successfully",
    });
  } catch (error) {
    return sendError(res, "Could not update reservation", error);
  }
});

app.delete("/api/reservations/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const hotelId = getHotelId(req);

    if (!hotelId) {
      return res.status(400).json({
        success: false,
        message: "Hotel is required",
      });
    }

    const result = await query(
      "DELETE FROM reservations WHERE id = ? AND hotel_id = ?",
      [id, hotelId]
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found",
      });
    }

    return res.json({
      success: true,
      message: "Reservation deleted successfully",
    });
  } catch (error) {
    return sendError(res, "Could not delete reservation", error);
  }
});

// ======================================================
// PAYMENTS
// ======================================================

app.get("/api/payments", async (req, res) => {
  try {
    const hotelId = getHotelId(req);

    if (!hotelId) {
      return res.status(400).json({
        success: false,
        message: "Hotel is required",
      });
    }

    const payments = await query(
      `SELECT
         p.id, p.hotel_id, p.reservation_id, p.amount,
         p.payment_method, p.status, p.transaction_id, p.created_at,
         r.user_id, r.room_id, r.check_in, r.check_out,
         u.full_name AS guest_name, u.email AS guest_email,
         rm.room_number, rm.room_type
       FROM payments p
       LEFT JOIN reservations r
         ON p.reservation_id = r.id AND r.hotel_id = p.hotel_id
       LEFT JOIN users u
         ON r.user_id = u.id AND u.hotel_id = p.hotel_id
       LEFT JOIN rooms rm
         ON r.room_id = rm.id AND rm.hotel_id = p.hotel_id
       WHERE p.hotel_id = ?
       ORDER BY p.created_at DESC`,
      [hotelId]
    );

    return res.json({ success: true, payments });
  } catch (error) {
    return sendError(res, "Could not fetch payments", error);
  }
});

app.post("/api/payments", async (req, res) => {
  try {
    const hotelId = getHotelId(req);
    const {
      reservation_id,
      amount,
      payment_method,
      status = "pending",
      transaction_id,
    } = req.body;

    if (!hotelId) {
      return res.status(400).json({
        success: false,
        message: "Hotel is required",
      });
    }

    if (!reservation_id || amount === undefined || !payment_method) {
      return res.status(400).json({
        success: false,
        message: "Reservation, amount and payment method are required",
      });
    }

    if (!Number.isFinite(Number(amount)) || Number(amount) < 0) {
      return res.status(400).json({
        success: false,
        message: "Payment amount must be a valid non-negative number",
      });
    }

    const reservations = await query(
      "SELECT id FROM reservations WHERE id = ? AND hotel_id = ? LIMIT 1",
      [reservation_id, hotelId]
    );

    if (!reservations.length) {
      return res.status(404).json({
        success: false,
        message: "Reservation does not belong to this hotel",
      });
    }

    const result = await query(
      `INSERT INTO payments
       (hotel_id, reservation_id, amount, payment_method, status, transaction_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        hotelId,
        reservation_id,
        amount,
        payment_method,
        status,
        transaction_id || null,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Payment created successfully",
      payment: {
        id: result.insertId,
        hotel_id: hotelId,
        reservation_id,
        amount,
        payment_method,
        status,
        transaction_id: transaction_id || null,
      },
    });
  } catch (error) {
    return sendError(res, "Could not create payment", error);
  }
});

app.put("/api/payments/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const hotelId = getHotelId(req);
    const { status } = req.body;
    const allowedStatuses = ["pending", "paid", "refunded"];

    if (!hotelId) {
      return res.status(400).json({
        success: false,
        message: "Hotel is required",
      });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment status",
      });
    }

    const result = await query(
      "UPDATE payments SET status = ? WHERE id = ? AND hotel_id = ?",
      [status, id, hotelId]
    );

    if (!result.affectedRows) {
      const rows = await query(
        "SELECT id FROM payments WHERE id = ? AND hotel_id = ?",
        [id, hotelId]
      );

      if (!rows.length) {
        return res.status(404).json({
          success: false,
          message: "Payment not found",
        });
      }
    }

    return res.json({
      success: true,
      message: "Payment status updated successfully",
    });
  } catch (error) {
    return sendError(res, "Could not update payment", error);
  }
});

// ======================================================
// SETTINGS
// ======================================================

app.get("/api/settings", async (req, res) => {
  try {
    const hotelId = getHotelId(req);

    if (!hotelId) {
      return res.status(400).json({
        success: false,
        message: "Hotel is required",
      });
    }

    const settings = await query(
      `SELECT setting_key, setting_value, updated_at
       FROM settings WHERE hotel_id = ? ORDER BY setting_key ASC`,
      [hotelId]
    );

    return res.json({ success: true, settings });
  } catch (error) {
    return sendError(res, "Could not fetch settings", error);
  }
});

app.get("/api/settings/:key", async (req, res) => {
  try {
    const hotelId = getHotelId(req);
    const { key } = req.params;

    if (!hotelId) {
      return res.status(400).json({
        success: false,
        message: "Hotel is required",
      });
    }

    const results = await query(
      `SELECT setting_key, setting_value, updated_at
       FROM settings WHERE hotel_id = ? AND setting_key = ? LIMIT 1`,
      [hotelId, key]
    );

    if (!results.length) {
      return res.status(404).json({
        success: false,
        message: "Setting not found",
      });
    }

    return res.json({ success: true, setting: results[0] });
  } catch (error) {
    return sendError(res, "Could not fetch setting", error);
  }
});

app.put("/api/settings", async (req, res) => {
  try {
    const hotelId = getHotelId(req);
    const settings = req.body;

    if (!hotelId) {
      return res.status(400).json({
        success: false,
        message: "Hotel is required",
      });
    }

    if (!settings || typeof settings !== "object" || Array.isArray(settings)) {
      return res.status(400).json({
        success: false,
        message: "Settings object is required",
      });
    }

    const keys = Object.keys(settings);

    if (!keys.length) {
      return res.status(400).json({
        success: false,
        message: "No settings provided",
      });
    }

    for (const key of keys) {
      const value =
        settings[key] === null || settings[key] === undefined
          ? ""
          : String(settings[key]);

      const existing = await query(
        "SELECT id FROM settings WHERE hotel_id = ? AND setting_key = ? LIMIT 1",
        [hotelId, key]
      );

      if (existing.length) {
        await query(
          "UPDATE settings SET setting_value = ? WHERE id = ?",
          [value, existing[0].id]
        );
      } else {
        await query(
          "INSERT INTO settings (hotel_id, setting_key, setting_value) VALUES (?, ?, ?)",
          [hotelId, key, value]
        );
      }
    }

    return res.json({
      success: true,
      message: "Settings updated successfully",
    });
  } catch (error) {
    return sendError(res, "Could not update settings", error);
  }
});

// ======================================================
// 404
// ======================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// ======================================================
// GLOBAL ERROR HANDLER
// ======================================================

app.use((err, req, res, next) => {
  console.error("GLOBAL SERVER ERROR:", err);

  if (res.headersSent) {
    return next(err);
  }

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

// ======================================================
// EXPORT FOR VERCEL
// START LOCALLY ONLY WHEN RUN DIRECTLY
// ======================================================

module.exports = app;

if (require.main === module) {
  startupPromise
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Growth Lodge backend running on http://localhost:${PORT}`);
      });
    })
    .catch((error) => {
      console.error("SERVER STARTUP FAILED:", error.message);
      process.exitCode = 1;
    });
}
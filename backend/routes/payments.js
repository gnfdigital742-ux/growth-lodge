const express = require("express");
const db = require("../db");

const router = express.Router();

/*
==================================================
GET ALL PAYMENTS
GET /api/payments
==================================================
*/

router.get("/", (req, res) => {
  const sql = `
    SELECT
      p.id,
      p.transaction_number,
      p.reservation_id,
      r.reservation_number,
      u.full_name AS customer_name,
      rm.room_number,
      p.amount,
      p.payment_method,
      p.status,
      p.payment_date
    FROM payments p
    JOIN reservations r
      ON p.reservation_id = r.id
    JOIN users u
      ON r.customer_id = u.id
    JOIN rooms rm
      ON r.room_id = rm.id
    ORDER BY p.id DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Get payments error:", err);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch payments.",
      });
    }

    res.json({
      success: true,
      count: results.length,
      payments: results,
    });
  });
});


/*
==================================================
GET ONE PAYMENT
GET /api/payments/:id
==================================================
*/

router.get("/:id", (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid payment ID.",
    });
  }

  const sql = `
    SELECT
      p.id,
      p.transaction_number,
      p.reservation_id,
      r.reservation_number,
      u.full_name AS customer_name,
      u.email AS customer_email,
      rm.room_number,
      rm.room_type,
      p.amount,
      p.payment_method,
      p.status,
      p.payment_date
    FROM payments p
    JOIN reservations r
      ON p.reservation_id = r.id
    JOIN users u
      ON r.customer_id = u.id
    JOIN rooms rm
      ON r.room_id = rm.id
    WHERE p.id = ?
  `;

  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error("Get payment error:", err);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch payment.",
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Payment not found.",
      });
    }

    res.json({
      success: true,
      payment: results[0],
    });
  });
});


/*
==================================================
CREATE PAYMENT
POST /api/payments
==================================================
*/

router.post("/", (req, res) => {
  const {
    reservation_id,
    amount,
    payment_method,
    status,
  } = req.body;

  if (
    !reservation_id ||
    amount === undefined ||
    !payment_method
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Reservation, amount and payment method are required.",
    });
  }

  if (isNaN(reservation_id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid reservation ID.",
    });
  }

  if (isNaN(amount) || Number(amount) <= 0) {
    return res.status(400).json({
      success: false,
      message: "Amount must be greater than zero.",
    });
  }

  const allowedMethods = [
    "cash",
    "card",
    "bank_transfer",
    "online",
  ];

  if (!allowedMethods.includes(payment_method)) {
    return res.status(400).json({
      success: false,
      message:
        "Payment method must be cash, card, bank_transfer or online.",
    });
  }

  const allowedStatuses = [
    "pending",
    "paid",
    "failed",
  ];

  const paymentStatus = status || "paid";

  if (!allowedStatuses.includes(paymentStatus)) {
    return res.status(400).json({
      success: false,
      message:
        "Payment status must be pending, paid or failed.",
    });
  }

  // Check reservation exists
  db.query(
    "SELECT id FROM reservations WHERE id = ?",
    [reservation_id],
    (err, reservationResults) => {
      if (err) {
        console.error(err);

        return res.status(500).json({
          success: false,
          message: "Database error.",
        });
      }

      if (reservationResults.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Reservation not found.",
        });
      }

      const transactionNumber =
        "GL-PAY-" +
        Date.now().toString().slice(-8);

      const sql = `
        INSERT INTO payments
        (
          transaction_number,
          reservation_id,
          amount,
          payment_method,
          status
        )
        VALUES (?, ?, ?, ?, ?)
      `;

      db.query(
        sql,
        [
          transactionNumber,
          reservation_id,
          Number(amount),
          payment_method,
          paymentStatus,
        ],
        (err, result) => {
          if (err) {
            console.error(
              "Create payment error:",
              err
            );

            return res.status(500).json({
              success: false,
              message: "Failed to create payment.",
            });
          }

          res.status(201).json({
            success: true,
            message: "Payment created successfully.",
            paymentId: result.insertId,
            transactionNumber,
          });
        }
      );
    }
  );
});


/*
==================================================
UPDATE PAYMENT STATUS
PUT /api/payments/:id
==================================================
*/

router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const allowedStatuses = [
    "pending",
    "paid",
    "failed",
  ];

  if (!id || isNaN(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid payment ID.",
    });
  }

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message:
        "Status must be pending, paid or failed.",
    });
  }

  const sql = `
    UPDATE payments
    SET status = ?
    WHERE id = ?
  `;

  db.query(sql, [status, id], (err, result) => {
    if (err) {
      console.error("Update payment error:", err);

      return res.status(500).json({
        success: false,
        message: "Failed to update payment.",
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Payment not found.",
      });
    }

    res.json({
      success: true,
      message: "Payment updated successfully.",
    });
  });
});


module.exports = router;
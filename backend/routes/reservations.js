const express = require("express");
const db = require("../db");

const router = express.Router();

/*
==================================================
GET ALL RESERVATIONS
GET /api/reservations
==================================================
*/

router.get("/", (req, res) => {
  const sql = `
    SELECT
      r.id,
      r.reservation_number,
      r.customer_id,
      u.full_name AS customer_name,
      u.email AS customer_email,
      r.room_id,
      rm.room_number,
      rm.room_type,
      r.check_in,
      r.check_out,
      r.guests,
      r.amount,
      r.status,
      r.created_at
    FROM reservations r
    JOIN users u ON r.customer_id = u.id
    JOIN rooms rm ON r.room_id = rm.id
    ORDER BY r.id DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Get reservations error:", err);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch reservations.",
      });
    }

    res.json({
      success: true,
      count: results.length,
      reservations: results,
    });
  });
});


/*
==================================================
GET ONE RESERVATION
GET /api/reservations/:id
==================================================
*/

router.get("/:id", (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid reservation ID.",
    });
  }

  const sql = `
    SELECT
      r.id,
      r.reservation_number,
      r.customer_id,
      u.full_name AS customer_name,
      u.email AS customer_email,
      u.phone AS customer_phone,
      r.room_id,
      rm.room_number,
      rm.room_type,
      rm.price AS room_price,
      r.check_in,
      r.check_out,
      r.guests,
      r.amount,
      r.status,
      r.created_at
    FROM reservations r
    JOIN users u ON r.customer_id = u.id
    JOIN rooms rm ON r.room_id = rm.id
    WHERE r.id = ?
  `;

  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error("Get reservation error:", err);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch reservation.",
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found.",
      });
    }

    res.json({
      success: true,
      reservation: results[0],
    });
  });
});


/*
==================================================
CREATE RESERVATION
POST /api/reservations
==================================================
*/

router.post("/", (req, res) => {
  const {
    customer_id,
    room_id,
    check_in,
    check_out,
    guests,
    amount,
  } = req.body;

  if (
    !customer_id ||
    !room_id ||
    !check_in ||
    !check_out ||
    guests === undefined ||
    amount === undefined
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Customer, room, check-in, check-out, guests and amount are required.",
    });
  }

  if (isNaN(customer_id) || isNaN(room_id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid customer or room ID.",
    });
  }

  if (isNaN(guests) || Number(guests) < 1) {
    return res.status(400).json({
      success: false,
      message: "Guests must be at least 1.",
    });
  }

  if (isNaN(amount) || Number(amount) < 0) {
    return res.status(400).json({
      success: false,
      message: "Amount must be a valid number.",
    });
  }

  if (new Date(check_out) <= new Date(check_in)) {
    return res.status(400).json({
      success: false,
      message: "Check-out date must be after check-in date.",
    });
  }

  // Check customer
  db.query(
    "SELECT id FROM users WHERE id = ? AND role = 'customer'",
    [customer_id],
    (err, customerResults) => {
      if (err) {
        console.error(err);

        return res.status(500).json({
          success: false,
          message: "Database error.",
        });
      }

      if (customerResults.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Customer not found.",
        });
      }

      // Check room
      db.query(
        "SELECT id, status FROM rooms WHERE id = ?",
        [room_id],
        (err, roomResults) => {
          if (err) {
            console.error(err);

            return res.status(500).json({
              success: false,
              message: "Database error.",
            });
          }

          if (roomResults.length === 0) {
            return res.status(404).json({
              success: false,
              message: "Room not found.",
            });
          }

          if (roomResults[0].status === "maintenance") {
            return res.status(409).json({
              success: false,
              message: "This room is under maintenance.",
            });
          }

          // Check overlapping reservation
          const overlapSql = `
            SELECT id
            FROM reservations
            WHERE room_id = ?
              AND status IN ('pending', 'confirmed')
              AND check_in < ?
              AND check_out > ?
          `;

          db.query(
            overlapSql,
            [room_id, check_out, check_in],
            (err, overlapResults) => {
              if (err) {
                console.error(err);

                return res.status(500).json({
                  success: false,
                  message: "Database error.",
                });
              }

              if (overlapResults.length > 0) {
                return res.status(409).json({
                  success: false,
                  message:
                    "This room is already reserved for those dates.",
                });
              }

              const reservationNumber =
                "GL-" +
                Date.now().toString().slice(-8);

              const sql = `
                INSERT INTO reservations
                (
                  reservation_number,
                  customer_id,
                  room_id,
                  check_in,
                  check_out,
                  guests,
                  amount,
                  status
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
              `;

              db.query(
                sql,
                [
                  reservationNumber,
                  customer_id,
                  room_id,
                  check_in,
                  check_out,
                  Number(guests),
                  Number(amount),
                ],
                (err, result) => {
                  if (err) {
                    console.error(
                      "Create reservation error:",
                      err
                    );

                    return res.status(500).json({
                      success: false,
                      message:
                        "Failed to create reservation.",
                    });
                  }

                  res.status(201).json({
                    success: true,
                    message:
                      "Reservation created successfully.",
                    reservationId: result.insertId,
                    reservationNumber,
                  });
                }
              );
            }
          );
        }
      );
    }
  );
});


/*
==================================================
UPDATE RESERVATION STATUS
PUT /api/reservations/:id
==================================================
*/

router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const allowedStatuses = [
    "pending",
    "confirmed",
    "completed",
    "cancelled",
  ];

  if (!id || isNaN(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid reservation ID.",
    });
  }

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message:
        "Status must be pending, confirmed, completed or cancelled.",
    });
  }

  const sql = `
    UPDATE reservations
    SET status = ?
    WHERE id = ?
  `;

  db.query(sql, [status, id], (err, result) => {
    if (err) {
      console.error("Update reservation error:", err);

      return res.status(500).json({
        success: false,
        message: "Failed to update reservation.",
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found.",
      });
    }

    res.json({
      success: true,
      message: "Reservation updated successfully.",
    });
  });
});


/*
==================================================
DELETE / CANCEL RESERVATION
DELETE /api/reservations/:id
==================================================
*/

router.delete("/:id", (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid reservation ID.",
    });
  }

  const sql = `
    UPDATE reservations
    SET status = 'cancelled'
    WHERE id = ?
  `;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Cancel reservation error:", err);

      return res.status(500).json({
        success: false,
        message: "Failed to cancel reservation.",
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found.",
      });
    }

    res.json({
      success: true,
      message: "Reservation cancelled successfully.",
    });
  });
});


module.exports = router;
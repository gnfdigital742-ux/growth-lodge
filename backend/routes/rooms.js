const express = require("express");
const db = require("../db");

const router = express.Router();

/*
==================================================
GET ALL ROOMS
GET /api/rooms
==================================================
*/

router.get("/", (req, res) => {
  const sql = `
    SELECT
      id,
      room_number,
      room_type,
      price,
      capacity,
      status,
      description,
      created_at
    FROM rooms
    ORDER BY id DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Get rooms error:", err);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch rooms.",
      });
    }

    return res.status(200).json({
      success: true,
      count: results.length,
      rooms: results,
    });
  });
});


/*
==================================================
GET ONE ROOM
GET /api/rooms/:id
==================================================
*/

router.get("/:id", (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid room ID.",
    });
  }

  const sql = `
    SELECT
      id,
      room_number,
      room_type,
      price,
      capacity,
      status,
      description,
      created_at
    FROM rooms
    WHERE id = ?
  `;

  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error("Get room error:", err);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch room.",
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Room not found.",
      });
    }

    return res.status(200).json({
      success: true,
      room: results[0],
    });
  });
});


/*
==================================================
CREATE ROOM
POST /api/rooms
==================================================
*/

router.post("/", (req, res) => {
  const {
    room_number,
    room_type,
    price,
    capacity,
    status,
    description,
  } = req.body;

  if (
    !room_number ||
    !room_type ||
    price === undefined ||
    capacity === undefined
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Room number, room type, price and capacity are required.",
    });
  }

  if (isNaN(price) || Number(price) < 0) {
    return res.status(400).json({
      success: false,
      message: "Price must be a valid positive number.",
    });
  }

  if (isNaN(capacity) || Number(capacity) < 1) {
    return res.status(400).json({
      success: false,
      message: "Capacity must be at least 1.",
    });
  }

  const allowedStatuses = [
    "available",
    "occupied",
    "maintenance",
  ];

  const roomStatus = status || "available";

  if (!allowedStatuses.includes(roomStatus)) {
    return res.status(400).json({
      success: false,
      message:
        "Status must be available, occupied or maintenance.",
    });
  }

  const sql = `
    INSERT INTO rooms
    (
      room_number,
      room_type,
      price,
      capacity,
      status,
      description
    )
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      room_number.trim(),
      room_type.trim(),
      Number(price),
      Number(capacity),
      roomStatus,
      description ? description.trim() : "",
    ],
    (err, result) => {
      if (err) {
        console.error("Create room error:", err);

        if (err.code === "ER_DUP_ENTRY") {
          return res.status(409).json({
            success: false,
            message: "Room number already exists.",
          });
        }

        return res.status(500).json({
          success: false,
          message: "Failed to create room.",
        });
      }

      return res.status(201).json({
        success: true,
        message: "Room created successfully.",
        roomId: result.insertId,
      });
    }
  );
});


/*
==================================================
UPDATE ROOM
PUT /api/rooms/:id
==================================================
*/

router.put("/:id", (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid room ID.",
    });
  }

  const {
    room_number,
    room_type,
    price,
    capacity,
    status,
    description,
  } = req.body;

  if (
    !room_number ||
    !room_type ||
    price === undefined ||
    capacity === undefined ||
    !status
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Room number, room type, price, capacity and status are required.",
    });
  }

  if (isNaN(price) || Number(price) < 0) {
    return res.status(400).json({
      success: false,
      message: "Price must be a valid positive number.",
    });
  }

  if (isNaN(capacity) || Number(capacity) < 1) {
    return res.status(400).json({
      success: false,
      message: "Capacity must be at least 1.",
    });
  }

  const allowedStatuses = [
    "available",
    "occupied",
    "maintenance",
  ];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message:
        "Status must be available, occupied or maintenance.",
    });
  }

  const sql = `
    UPDATE rooms
    SET
      room_number = ?,
      room_type = ?,
      price = ?,
      capacity = ?,
      status = ?,
      description = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [
      room_number.trim(),
      room_type.trim(),
      Number(price),
      Number(capacity),
      status,
      description ? description.trim() : "",
      id,
    ],
    (err, result) => {
      if (err) {
        console.error("Update room error:", err);

        if (err.code === "ER_DUP_ENTRY") {
          return res.status(409).json({
            success: false,
            message: "Room number already exists.",
          });
        }

        return res.status(500).json({
          success: false,
          message: "Failed to update room.",
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Room not found.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Room updated successfully.",
      });
    }
  );
});


/*
==================================================
DELETE ROOM
DELETE /api/rooms/:id
==================================================
*/

router.delete("/:id", (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid room ID.",
    });
  }

  const sql = `
    DELETE FROM rooms
    WHERE id = ?
  `;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Delete room error:", err);

      if (
        err.code === "ER_ROW_IS_REFERENCED_2" ||
        err.code === "ER_ROW_IS_REFERENCED"
      ) {
        return res.status(409).json({
          success: false,
          message:
            "This room cannot be deleted because it has reservations.",
        });
      }

      return res.status(500).json({
        success: false,
        message: "Failed to delete room.",
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Room not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Room deleted successfully.",
    });
  });
});


module.exports = router;
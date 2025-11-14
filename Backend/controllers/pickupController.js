<<<<<<< HEAD
// controllers/pickupController.js
=======
>>>>>>> 01c123bc57e31401aa3b9e5d1f67dee9e1186cb0
import Pickup from "../models/Pickup.js";

/**
 * GET /api/pickups
<<<<<<< HEAD
 * Fetch all pickups (Admin only)
=======
 * Fetch all pickups (populated with user & center)
>>>>>>> 01c123bc57e31401aa3b9e5d1f67dee9e1186cb0
 */
export const getAllPickups = async (req, res) => {
  try {
    const pickups = await Pickup.find()
      .populate("userId", "name email")
      .populate("centerId", "name location")
      .sort({ createdAt: -1 });

    res.json({ success: true, pickups });
  } catch (error) {
    console.error("Error fetching pickups:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
<<<<<<< HEAD
 * POST /api/pickups
 * Create a new pickup
 */
export const createPickup = async (req, res) => {
  try {
    const { items, address, pickupTime, time_slot, weight, instructions } = req.body;

    // ✅ validation
    if (!address || !items || !weight || !pickupTime || !time_slot) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const pickup = await Pickup.create({
      userId: req.userId, // من الـ token
      address,
      items,
      weight,
      instructions,
      pickupTime: new Date(pickupTime),
      time_slot,
    });

    res.status(201).json({ success: true, pickup });
  } catch (error) {
    console.error("Error creating pickup:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PUT /api/pickups/:id
 * Update pickup (status or reschedule)
=======
 * PUT /api/pickups/:id
 * Update pickup (status or schedule)
>>>>>>> 01c123bc57e31401aa3b9e5d1f67dee9e1186cb0
 */
export const updatePickup = async (req, res) => {
  try {
    const { id } = req.params;
<<<<<<< HEAD
    const { status, pickupTime } = req.body;

    const updated = await Pickup.findByIdAndUpdate(
      id,
      { status, pickupTime },
=======
    const { pickup_status, scheduled_date } = req.body;

    const updated = await Pickup.findByIdAndUpdate(
      id,
      { pickup_status, scheduled_date },
>>>>>>> 01c123bc57e31401aa3b9e5d1f67dee9e1186cb0
      { new: true }
    )
      .populate("userId", "name email")
      .populate("centerId", "name location");

    if (!updated)
      return res
        .status(404)
        .json({ success: false, message: "Pickup not found" });

    res.json({ success: true, pickup: updated });
  } catch (error) {
    console.error("Error updating pickup:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

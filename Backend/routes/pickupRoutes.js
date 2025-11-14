import express from "express";
import Pickup from "../models/pickupModel.js";
import userModel from "../models/userModel.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleAuth from "../middleware/roleAuth.js";

const router = express.Router();

// // 🧾 Get all pickups (Admin only)

router.get("/", authMiddleware, roleAuth("admin"), async (req, res) => {
  try {
    const pickups = await Pickup.find()
      .populate("userId", "name email")     // ✅ populate user info
      .populate("centerId", "name location") // ✅ populate center info
      .populate("deliveryAgentId", "name email role")
      .sort({ createdAt: -1 });

    res.json({ success: true, pickups });
  } catch (error) {
    console.error("Error fetching pickups:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

//Get pickups for a specific user(admin or same user)
router.get("/user/:userId", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
  
    if (req.userRole !== "admin" && req.userId !== userId) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }
    const pickups = await Pickup.find({ userId })
    .populate("userId", "name email")     // ✅ populate user info
    .sort({ createdAt: -1 });

    res.json({ success: true, pickups });
  } catch (error) {
    console.error("Error fetching user pickups:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});


// ♻️ Create a new pickup (user only)
router.post("/", authMiddleware, async (req, res) => {
  try{
    const {items, address, pickupTime, time_slot, weight, instructions} = req.body;

    //Validation
    if(!address || !items || !weight || !pickupTime || !time_slot) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing required fields: address, items, weight, pickupTime, and time_slot are required" 
      });
    }
   
    //create pickup
    const pickup = await Pickup.create({
      userId: req.userId, 
      address,
      items,
      weight,
      instructions,
      pickupTime: new Date(pickupTime),
      time_slot
    });

    res.status(201).json({ success: true, pickup });
  } catch (error) {
    console.error("Error creating pickup:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 👤 Get current user's pickups (user)
router.get("/my", authMiddleware, async (req, res) => {
  try {
    console.log("🔍 GET /my called");
    console.log("User ID:", req.userId);
    console.log("User Role:", req.userRole);
    
    const pickups = await Pickup.find({ userId: req.userId })
      .sort({ createdAt: -1 });
    
    console.log(`✅ Found ${pickups.length} pickups for user ${req.userId}`);
    
    res.json({ success: true, pickups });
  } catch (error) {
    console.error("❌ Error in /my route:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete pickup (user can delete their own, admin can delete any)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    console.log("=== 🗑️ DELETE PICKUP ===");
    console.log("Pickup ID:", id);
    console.log("User ID:", req.userId);
    console.log("User Role:", req.userRole);
    
    const pickup = await Pickup.findById(id);
    
    if (!pickup) {
      return res.status(404).json({ success: false, message: "Pickup not found" });
    }
    
    // Check authorization: user can delete their own, admin can delete any
    if (req.userRole !== "admin" && pickup.userId.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this pickup" });
    }
    
    // Don't allow deletion of completed pickups
    if (pickup.status === "completed") {
      return res.status(400).json({ success: false, message: "Cannot delete completed pickups" });
    }
    
    await Pickup.findByIdAndDelete(id);
    
    console.log("✅ Pickup deleted successfully");
    res.json({ success: true, message: "Pickup deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting pickup:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update pickup (user can update their own pending pickups)
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { address, items, weight, instructions, pickupTime, time_slot } = req.body;
    
    console.log("=== ✏️ UPDATE PICKUP ===");
    console.log("Pickup ID:", id);
    console.log("User ID:", req.userId);
    console.log("Update data:", req.body);
    
    const pickup = await Pickup.findById(id);
    
    if (!pickup) {
      return res.status(404).json({ success: false, message: "Pickup not found" });
    }
    
    // Check authorization
    if (req.userRole !== "admin" && pickup.userId.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: "Not authorized to update this pickup" });
    }
    
    // Only allow updates to pending pickups
    if (pickup.status !== "pending") {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot modify ${pickup.status} pickups. Only pending pickups can be modified.` 
      });
    }
    
    // Update fields
    if (address) pickup.address = address;
    if (items) pickup.items = items;
    if (weight) pickup.weight = weight;
    if (instructions !== undefined) pickup.instructions = instructions;
    if (pickupTime) pickup.pickupTime = new Date(pickupTime);
    if (time_slot) pickup.time_slot = time_slot;
    
    await pickup.save();
    
    console.log("✅ Pickup updated successfully");
    res.json({ success: true, pickup, message: "Pickup updated successfully" });
  } catch (error) {
    console.error("❌ Error updating pickup:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 🚚 Assign pickup to agent (admin)
router.put("/:id/assign", authMiddleware, roleAuth("admin"), async (req, res) => {
  try {
    const { id } = req.params;
    const { deliveryAgentId, pickupTime } = req.body;

    const pickup = await Pickup.findById(id);
    if (!pickup) return res.status(404).json({ success: false, message: "Pickup not found" });

    pickup.deliveryAgentId = deliveryAgentId;
    pickup.pickupTime = pickupTime ? new Date(pickupTime) : new Date();
    pickup.status = "assigned";
    await pickup.save();

    res.json({ success: true, pickup });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ Mark pickup as completed (admin or assigned agent)
router.put("/:id/complete", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const pickup = await Pickup.findById(id);
    if (!pickup) return res.status(404).json({ success: false, message: "Pickup not found" });

    if (
      req.userRole !== "admin" &&
      pickup.deliveryAgentId?.toString() !== req.userId
    ) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    if (pickup.status === "completed") {
      return res.status(400).json({ success: false, message: "Already completed" });
    }

    // Calculate points
    const POINTS_PER_KG = {
      Plastic: 10,
      Paper: 8,
      Metal: 15,
      Glass: 6,
      "E-Waste": 20,
    };
    const totalPoints = pickup.items.reduce((acc, item) => {
      const perKg = POINTS_PER_KG[items] || 0;
      return acc + perKg * (weight || 0);
    }, 0);

    pickup.status = "completed";
    pickup.awardedPoints = totalPoints;
    await pickup.save();

    // Update user points
    await userModel.findByIdAndUpdate(pickup.userId, {
      $inc: { points: totalPoints },
      $push: {
        activity: {
          action: `Completed pickup worth${totalPoints} points`,
          points: totalPoints,
        },
      },
    });

    res.json({ success: true, pickup, awardedPoints: totalPoints });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});



export default router;

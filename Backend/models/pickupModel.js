// models/Pickup.js
import mongoose from "mongoose";

const pickupSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    centerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Center",
    },
    deliveryAgentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeliveryAgent",
    },
    status: {
      type: String,
      enum: ["pending", "assigned", "completed"],
      default: "pending",
    },
    pickupTime: {
      type: Date,
    },
    items: 
      {
      type: [String],
      required: true,
      },
    weight: {
      type: Number,
      required: true,
    },
    address: {
      type: String,  
      required: true,
    },
    instructions: {
      type: String,
      default: "",
    },
    time_slot: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Pickup", pickupSchema);


// import mongoose from "mongoose";

// const itemSchema = new mongoose.Schema({
//   category: { type: String, required: true },
//   weight: { type: Number, required: true },
// });

// const pickupSchema = new mongoose.Schema(
//   {
//     userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//     centerId: { type: mongoose.Schema.Types.ObjectId, ref: "Center", default: null },

//     userName: { type: String, required: true },
//     items: [itemSchema],
//     status: {
//       type: String,
//       enum: ["pending", "assigned", "completed"],
//       default: "pending",
//     },
//     deliveryAgentId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       default: null,
//     },
//     pickupTime: { type: Date, default: null },
//     awardedPoints: { type: Number, default: 0 },

//   },
//   { timestamps: true }
// );

// export default mongoose.model("Pickup", pickupSchema);

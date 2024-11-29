const mongoose = require("mongoose");

// Subschema for Public Pools
const publicPoolSchema = new mongoose.Schema({
  minimumOracles: { type: Number, required: true },
  maximumOracles: { type: Number, required: true },
  rewardType: {
    type: String,
    enum: ["fixedAmount", "baseAmountPlusBonus"],
    required: true,
  },
  rewardDetails: {
    fixedAmount: {
      rewardAmountPerOracle: { type: Number },
    },
    baseAmountPlusBonus: {
      baseAmountPerOracle: { type: Number },
      associatedDealSize: { type: Number },
      bonusPercentage: { type: Number },
    },
  },
  timeZone: { type: String, required: true },
  duration: { type: Number, required: true }, // duration must be in days
});

const poolSchema = new mongoose.Schema(
  {
    questionImage: { type: String, required: true },
    question: { type: String, required: true },
    options: [
      {
        optionName: { type: String, required: true },
        optionImage: { type: String },
      },
    ],
    tags: {
      type: [String],
      validate: [arrayLimit, "Tags cannot exceed 8"],
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isPrivate: { type: Boolean, default: false },
    liquidityMax: { type: Number, required: true },
    startDate: { type: Date, required: true },

    poolTypeData: [publicPoolSchema],
  },
  { timestamps: true }
);

// Validator for tags array (max 8 tags)
function arrayLimit(val) {
  return val.length <= 8;
}
// Pre-save hook to modify/remove fields based on the pool type (public/private)
poolSchema.pre("save", function (next) {
  if (this.isPrivate) {
    this.poolTypeData = undefined;
  }

  if (!this.isPrivate) {
    if (!this.poolTypeData || this.poolTypeData.length === 0) {
      throw new Error("Pool type data is required for public pools.");
    }
  }

  next();
});

module.exports = mongoose.model("Pool", poolSchema);

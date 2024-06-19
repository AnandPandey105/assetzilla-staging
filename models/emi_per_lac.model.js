const { Schema, model } = require("mongoose");

const EMIPerLacSchema = Schema(
  {
    emi_per_lac: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

module.exports = model("EMIPerLacSchema", EMIPerLacSchema);

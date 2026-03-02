import mongoose, { Schema } from "mongoose";

const ImeiUnitSchema = new Schema(
  {
    brand: { type: String, required: true, index: true },
    model: { type: String, required: true, index: true },
    color: { type: String },
    storage: { type: String },

    imei1: { type: String, required: true, unique: true, index: true },
    imei2: { type: String, unique: true, sparse: true },

    purchasePrice: { type: Number, required: true },
    sellingPrice: { type: Number, required: true },

    status: {
      type: String,
      enum: ["IN_STOCK", "SOLD", "RETURNED", "IN_REPAIR"],
      default: "IN_STOCK",
      index: true,
    },

    warrantyMonths: { type: Number, default: 12 },

    purchaseDate: { type: Date },
    soldAt: { type: Date },
    saleId: { type: Schema.Types.ObjectId, ref: "Sale" },
  },
  { timestamps: true }
);

export default mongoose.models.ImeiUnit || mongoose.model("ImeiUnit", ImeiUnitSchema);

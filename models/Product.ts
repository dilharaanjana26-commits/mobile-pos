import mongoose, { Schema } from "mongoose";

const ProductSchema = new Schema(
  {
    sku: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, index: true },
    brand: { type: String },
    category: { type: String, default: "Accessories", index: true },
    barcode: { type: String, unique: true, sparse: true },

    purchasePrice: { type: Number, required: true },
    sellingPrice: { type: Number, required: true },

    stockQty: { type: Number, required: true, default: 0 },
    reorderLevel: { type: Number, default: 0 },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);

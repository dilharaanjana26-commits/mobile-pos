import mongoose, { Schema } from "mongoose";

const SaleSchema = new Schema(
  {
    invoiceNo: { type: String, required: true, unique: true, index: true },
    date: { type: Date, default: Date.now, index: true },

    customer: {
      name: { type: String },
      phone: { type: String },
    },

    items: [
      {
        type: { type: String, enum: ["PRODUCT", "IMEI"], required: true },
        productId: { type: Schema.Types.ObjectId, ref: "Product" },
        imeiUnitId: { type: Schema.Types.ObjectId, ref: "ImeiUnit" },
        name: { type: String, required: true },
        qty: { type: Number, required: true },
        unitPrice: { type: Number, required: true },
        cost: { type: Number, required: true },
      },
    ],

    subTotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },

    payment: {
      method: { type: String, enum: ["CASH", "CARD", "UPI", "MIXED"], required: true },
      paidAmount: { type: Number, required: true },
      balance: { type: Number, required: true },
      ref: { type: String },
    },

    cashier: {
      userId: { type: Schema.Types.ObjectId, ref: "User" },
      username: { type: String },
    },

    status: { type: String, enum: ["COMPLETED", "VOID"], default: "COMPLETED", index: true },
  },
  { timestamps: true }
);

export default mongoose.models.Sale || mongoose.model("Sale", SaleSchema);

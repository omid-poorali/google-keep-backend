import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema({
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "account",
    required: true
  },
  token: {
    index: true,
    type: String,
    required: true,
    unique: true
  },
  expiredAt: {
    type: Number,
    required: true,
  }
});

export const RefreshToken = mongoose.model("refresh-token", refreshTokenSchema);
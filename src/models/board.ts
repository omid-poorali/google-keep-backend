import mongoose from "mongoose";

export type Board = {
  _id: mongoose.Schema.Types.ObjectId;
  account: mongoose.Schema.Types.ObjectId;
  tags: {
    _id: mongoose.Schema.Types.ObjectId;
    name: string;
    createdAt: number;
    updatedAt: number;
  }[];
  notes: {
    _id: mongoose.Schema.Types.ObjectId;
    title: string;
    body: string;
    tags: string[];
    createdAt: number;
    updatedAt: number;
  }[];
}

const boardSchema = new mongoose.Schema<Board>({
  account: {
    index: true,
    unique: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: "account",
  },
  tags: [{
    name: {
      type: String,
      trim: true,
      lowercase: true,
    },
    createdAt: {
      type: Number,
      required: true
    },
    updatedAt: {
      type: Number,
      required: true
    },
  }],
  notes: [
    {
      title: {
        type: String,
        trim: true
      },
      body: {
        type: String,
        trim: true
      },
      tags: [{
        type: mongoose.Schema.Types.ObjectId,
        default: []
      }],
      createdAt: {
        type: Number,
        required: true
      },
      updatedAt: {
        type: Number,
        required: true
      },
    }
  ]
});

export const Board = mongoose.model("board", boardSchema);
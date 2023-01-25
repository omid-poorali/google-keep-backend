import { Enums } from "commons";
import mongoose, { Model } from "mongoose";
import bcrypt from "bcrypt";

export type Account = {
  _id: mongoose.Schema.Types.ObjectId;
  email: string;
  password: string;
  emailStatus: Enums.EmailStatus;
  role: Enums.Role[];
  createdAt: number;
  updatedAt: number;
}

type AccountMethods = {
  comparePassword(_password: string): Promise<boolean>;
}

type AccountModel = Model<Account, {}, AccountMethods>;


const accountSchema = new mongoose.Schema<Account, AccountModel, AccountMethods>({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  emailStatus: {
    type: String,
    required: true,
    default: Enums.EmailStatus.UNVERIFIED,
    enum: [Enums.EmailStatus.UNVERIFIED, Enums.EmailStatus.VERIFIED]
  },
  role: {
    type: [String],
    required: true,
    default: [Enums.Role.USER],
    enum: [Enums.Role.USER, Enums.Role.ADMIN]
  },
  createdAt: {
    type: Number,
    required: true
  },
  updatedAt: {
    type: Number,
    required: true
  }
});


accountSchema.pre("save", function (next) {
  const account = this
  if (this.isModified("password") || this.isNew) {
    bcrypt.genSalt(10, function (err, salt) {
      if (err) next(err);
      else {
        bcrypt.hash(account.password, salt, function (err, hash) {
          if (err) next(err);
          else {
            account.password = hash
            next()
          }
        });
      }
    });
  } else next()
})


accountSchema.method('comparePassword', function comparePassword(password: string) {
  return new Promise<boolean>((resolve, reject) => {
    bcrypt.compare(password, this.password, function (err, isMatch) {
      if (isMatch) {
        resolve(true);
      }
      else resolve(false);
    });
  });
});


export const Account = mongoose.model("account", accountSchema);
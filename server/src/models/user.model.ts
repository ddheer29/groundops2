import mongoose, { Document, Schema, Model, Types } from 'mongoose';
import { UserRole, UserStatus } from '@groundops/contracts';

export interface IUserDocument extends Document {
  firstName: string;
  lastName: string;
  email: string;
  passwordHash?: string;
  role: UserRole;
  organisationId: Types.ObjectId;
  invitedBy?: Types.ObjectId | null;
  status: UserStatus;
  emailVerified: boolean;
  lastLoginAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUserDocument>(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: false,
    },
    role: {
      type: String,
      enum: ['ADMIN', 'MANAGER', 'TECHNICIAN'],
      required: true,
      default: 'TECHNICIAN',
      index: true,
    },
    organisationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organisation',
      required: [true, 'Organisation ID is required'],
      index: true,
    },
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    status: {
      type: String,
      enum: ['INVITED', 'ACTIVE', 'DISABLED'],
      default: 'INVITED',
      index: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const UserModel: Model<IUserDocument> =
  mongoose.models.User || mongoose.model<IUserDocument>('User', UserSchema);

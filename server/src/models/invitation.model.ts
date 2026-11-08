import mongoose, { Document, Schema, Model, Types } from 'mongoose';
import { UserRole, InvitationStatus } from '@groundops/contracts';

export interface IInvitationDocument extends Document {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  organisationId: Types.ObjectId;
  invitedBy: Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
  status: InvitationStatus;
  acceptedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const InvitationSchema = new Schema<IInvitationDocument>(
  {
    email: {
      type: String,
      required: [true, 'Invited email is required'],
      trim: true,
      lowercase: true,
      index: true,
    },
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
    role: {
      type: String,
      enum: ['ADMIN', 'MANAGER', 'TECHNICIAN'],
      default: 'TECHNICIAN',
      required: true,
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
      required: [true, 'Inviting admin ID is required'],
    },
    tokenHash: {
      type: String,
      required: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED'],
      default: 'PENDING',
      index: true,
    },
    acceptedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const InvitationModel: Model<IInvitationDocument> =
  mongoose.models.Invitation ||
  mongoose.model<IInvitationDocument>('Invitation', InvitationSchema);

import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export interface IRefreshTokenDocument extends Document {
  tokenHash: string;
  userId: Types.ObjectId;
  organisationId: Types.ObjectId;
  expiresAt: Date;
  isRevoked: boolean;
  replacedByTokenHash?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const RefreshTokenSchema = new Schema<IRefreshTokenDocument>(
  {
    tokenHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    organisationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organisation',
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    isRevoked: {
      type: Boolean,
      default: false,
      index: true,
    },
    replacedByTokenHash: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const RefreshTokenModel: Model<IRefreshTokenDocument> =
  mongoose.models.RefreshToken ||
  mongoose.model<IRefreshTokenDocument>('RefreshToken', RefreshTokenSchema);

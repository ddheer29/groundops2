import mongoose, { Document, Schema, Model } from 'mongoose';
import { OrganisationStatus } from '@groundops/contracts';

export interface IOrganisationDocument extends Document {
  name: string;
  organisationCode: string;
  email: string;
  status: OrganisationStatus;
  createdAt: Date;
  updatedAt: Date;
}

const OrganisationSchema = new Schema<IOrganisationDocument>(
  {
    name: {
      type: String,
      required: [true, 'Organisation name is required'],
      trim: true,
    },
    organisationCode: {
      type: String,
      required: [true, 'Organisation code is required'],
      trim: true,
      uppercase: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: [true, 'Organisation email is required'],
      trim: true,
      lowercase: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE',
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const OrganisationModel: Model<IOrganisationDocument> =
  mongoose.models.Organisation ||
  mongoose.model<IOrganisationDocument>('Organisation', OrganisationSchema);

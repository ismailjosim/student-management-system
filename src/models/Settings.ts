import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ISettings {
  ownerId: string;
  currentAssignment: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SettingsDocument extends ISettings, Document<Types.ObjectId> {
  _id: Types.ObjectId;
}

const settingsSchema = new Schema<SettingsDocument>(
  {
    ownerId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    currentAssignment: {
      type: String,
      default: 'A-01',
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

export const Settings =
  mongoose.models.Settings || mongoose.model<SettingsDocument>('Settings', settingsSchema);

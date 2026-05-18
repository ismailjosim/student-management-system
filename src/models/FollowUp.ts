import mongoose, { Schema, Document } from 'mongoose';

export type FollowUpStatus = 'pending' | 'completed' | 'overdue';

export interface FollowUpDocument {
  _id?: string;
  ownerId: string;
  date: Date;
  note: string;
  status?: FollowUpStatus;
  completedDate?: Date;
  studentId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

type FollowUpDocumentWithMongoose = FollowUpDocument & Document;

const FollowUpSchema = new Schema<FollowUpDocumentWithMongoose>(
  {
    ownerId: {
      type: String,
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: [true, 'Follow-up date is required'],
      default: function () {
        // If not provided, default to 7 days from now
        const date = new Date();
        date.setDate(date.getDate() + 7);
        return date;
      },
    },
    note: {
      type: String,
      required: [true, 'Follow-up note is required'],
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'completed', 'overdue'],
        message: 'Status must be one of: pending, completed, overdue',
      },
      default: 'pending',
    },
    completedDate: {
      type: Date,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student ID is required'],
    } as unknown as typeof Schema.Types.ObjectId,
  },
  { timestamps: true }
);

// Create indexes for optimal performance
FollowUpSchema.index({ ownerId: 1, studentId: 1 });
FollowUpSchema.index({ ownerId: 1, date: -1 });

export default mongoose.models.FollowUp ||
  mongoose.model<FollowUpDocumentWithMongoose>('FollowUp', FollowUpSchema);

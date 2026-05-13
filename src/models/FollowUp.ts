import mongoose, { Schema, Document } from 'mongoose';

export interface FollowUpDocument {
  _id?: string;
  date: Date;
  note: string;
  studentId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

type FollowUpDocumentWithMongoose = FollowUpDocument & Document;

const FollowUpSchema = new Schema<FollowUpDocumentWithMongoose>(
  {
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
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student ID is required'],
    } as unknown as typeof Schema.Types.ObjectId,
  },
  { timestamps: true }
);

// Create indexes for optimal performance
FollowUpSchema.index({ studentId: 1 });
FollowUpSchema.index({ date: -1 });

export default mongoose.models.FollowUp ||
  mongoose.model<FollowUpDocumentWithMongoose>('FollowUp', FollowUpSchema);

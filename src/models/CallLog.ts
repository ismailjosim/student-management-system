import mongoose, { Schema, Document } from 'mongoose';

export interface CallLogDocument {
  _id?: string;
  studentId: string;
  callDate: Date;
  duration: number;
  notes: string;
  nextCallDate?: Date;
  status: 'completed' | 'missed' | 'scheduled';
  callType: 'phone' | 'video' | 'message';
  createdAt?: Date;
  updatedAt?: Date;
}

type CallLogDocumentWithMongoose = CallLogDocument & Document;

const CallLogSchema = new Schema<CallLogDocumentWithMongoose>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Please provide a student ID'],
    } as unknown as typeof Schema.Types.ObjectId,
    callDate: {
      type: Date,
      required: [true, 'Please provide a call date'],
      default: Date.now,
    },
    duration: {
      type: Number,
      required: [true, 'Please provide duration in minutes'],
      min: 0,
    },
    notes: {
      type: String,
      required: [true, 'Please provide call notes'],
    },
    nextCallDate: Date,
    status: {
      type: String,
      enum: ['completed', 'missed', 'scheduled'],
      default: 'completed',
    },
    callType: {
      type: String,
      enum: ['phone', 'video', 'message'],
      required: [true, 'Please provide a call type'],
    },
  },
  { timestamps: true }
);

export default mongoose.models.CallLog ||
  mongoose.model<CallLogDocumentWithMongoose>('CallLog', CallLogSchema);

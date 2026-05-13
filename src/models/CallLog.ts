import mongoose, { Schema, Document } from 'mongoose';

export type CallLogStatus =
  | 'RECEIVED'
  | 'NOT_RECEIVED'
  | 'PHONE_OFF'
  | 'SWITCHED_OFF'
  | 'FOREIGN_NUMBER';

export interface CallLogDocument {
  _id?: string;
  date: Date;
  status: CallLogStatus;
  notes?: string;
  calledBy?: string;
  issues?: string;
  promised?: string;
  studentId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

type CallLogDocumentWithMongoose = CallLogDocument & Document;

const CallLogSchema = new Schema<CallLogDocumentWithMongoose>(
  {
    date: {
      type: Date,
      required: [true, 'Call date is required'],
      validate: {
        validator: (value: Date) => {
          return value <= new Date();
        },
        message: 'Date cannot be in the future',
      },
    },
    status: {
      type: String,
      enum: {
        values: ['RECEIVED', 'NOT_RECEIVED', 'PHONE_OFF', 'SWITCHED_OFF', 'FOREIGN_NUMBER'],
        message:
          'Status must be one of: RECEIVED, NOT_RECEIVED, PHONE_OFF, SWITCHED_OFF, FOREIGN_NUMBER',
      },
      required: [true, 'Call status is required'],
    },
    notes: String,
    calledBy: String,
    issues: String,
    promised: String,
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student ID is required'],
    } as unknown as typeof Schema.Types.ObjectId,
  },
  { timestamps: true }
);

// Create indexes for optimal performance
CallLogSchema.index({ studentId: 1 });
CallLogSchema.index({ date: -1 });

export default mongoose.models.CallLog ||
  mongoose.model<CallLogDocumentWithMongoose>('CallLog', CallLogSchema);

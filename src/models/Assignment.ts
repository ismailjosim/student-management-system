import mongoose, { Schema, Document } from 'mongoose';

export type AssignmentStatus = 'PENDING' | 'SUBMITTED' | 'COMPLETED' | 'NOT_DEFINED';

export interface AssignmentDocument {
  _id?: string;
  assignmentNumber: number;
  status: AssignmentStatus;
  completedDate?: Date;
  notes?: string;
  studentId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

type AssignmentDocumentWithMongoose = AssignmentDocument & Document;

const AssignmentSchema = new Schema<AssignmentDocumentWithMongoose>(
  {
    assignmentNumber: {
      type: Number,
      required: [true, 'Assignment number is required'],
      min: [1, 'Assignment number must be between 1 and 10'],
      max: [10, 'Assignment number must be between 1 and 10'],
    },
    status: {
      type: String,
      enum: {
        values: ['PENDING', 'SUBMITTED', 'COMPLETED', 'NOT_DEFINED'],
        message: 'Status must be one of: PENDING, SUBMITTED, COMPLETED, NOT_DEFINED',
      },
      default: 'NOT_DEFINED',
    },
    completedDate: Date,
    notes: String,
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student ID is required'],
    } as unknown as typeof Schema.Types.ObjectId,
  },
  { timestamps: true }
);

// Create unique compound index on (studentId, assignmentNumber)
AssignmentSchema.index({ studentId: 1, assignmentNumber: 1 }, { unique: true });
// Create index on status for filtering
AssignmentSchema.index({ status: 1 });

export default mongoose.models.Assignment ||
  mongoose.model<AssignmentDocumentWithMongoose>('Assignment', AssignmentSchema);

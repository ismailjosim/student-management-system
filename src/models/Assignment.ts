import mongoose, { Schema, Document } from 'mongoose';

export interface AssignmentDocument {
  _id?: string;
  studentId: string;
  title: string;
  description: string;
  dueDate: Date;
  submittedDate?: Date;
  status: 'pending' | 'submitted' | 'graded' | 'overdue';
  grade?: number;
  feedback?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

type AssignmentDocumentWithMongoose = AssignmentDocument & Document;

const AssignmentSchema = new Schema<AssignmentDocumentWithMongoose>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Please provide a student ID'],
    } as unknown as typeof Schema.Types.ObjectId,
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
    },
    dueDate: {
      type: Date,
      required: [true, 'Please provide a due date'],
    },
    submittedDate: Date,
    status: {
      type: String,
      enum: ['pending', 'submitted', 'graded', 'overdue'],
      default: 'pending',
    },
    grade: {
      type: Number,
      min: 0,
      max: 100,
    },
    feedback: String,
  },
  { timestamps: true }
);

export default mongoose.models.Assignment ||
  mongoose.model<AssignmentDocumentWithMongoose>('Assignment', AssignmentSchema);

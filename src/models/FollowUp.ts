import mongoose, { Schema, Document } from 'mongoose';

export interface FollowUpDocument {
  _id?: string;
  studentId: string;
  title: string;
  description: string;
  dueDate: Date;
  completedDate?: Date;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed';
  assignedTo?: string;
  tags?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

type FollowUpDocumentWithMongoose = FollowUpDocument & Document;

const FollowUpSchema = new Schema<FollowUpDocumentWithMongoose>(
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
    completedDate: Date,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed'],
      default: 'pending',
    },
    assignedTo: String,
    tags: [String],
  },
  { timestamps: true }
);

export default mongoose.models.FollowUp ||
  mongoose.model<FollowUpDocumentWithMongoose>('FollowUp', FollowUpSchema);

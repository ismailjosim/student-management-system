import mongoose, { Schema, Document } from 'mongoose';

export interface StudentDocument {
  _id?: string;
  name: string;
  email: string;
  phone: string;
  enrollmentDate: Date;
  status: 'active' | 'inactive' | 'graduated' | 'dropped';
  currentGrade?: number;
  address?: string;
  parentName?: string;
  parentPhone?: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

type StudentDocumentWithMongoose = StudentDocument & Document;

const StudentSchema = new Schema<StudentDocumentWithMongoose>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    phone: {
      type: String,
      required: [true, 'Please provide a phone number'],
      trim: true,
    },
    enrollmentDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'graduated', 'dropped'],
      default: 'active',
    },
    currentGrade: {
      type: Number,
      min: 0,
      max: 100,
    },
    address: String,
    parentName: String,
    parentPhone: String,
    notes: String,
  },
  { timestamps: true }
);

export default mongoose.models.Student ||
  mongoose.model<StudentDocumentWithMongoose>('Student', StudentSchema);

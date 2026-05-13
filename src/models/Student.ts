import mongoose, { Schema, Document } from 'mongoose';

export type AgeRange = '16-17' | '18-19' | '20-25' | '26-30' | '31-40' | '41-50' | '50+';
export type WorkingDevice = 'Laptop' | 'Desktop' | 'Mobile';
export type StudentStatus = 'On Track' | 'Behind' | 'At Risk' | 'Dropped' | 'Completed';
export type LastCompletedAssignment =
  | 'A-01'
  | 'A-02'
  | 'A-03'
  | 'A-04'
  | 'A-05'
  | 'A-06'
  | 'A-07'
  | 'A-08'
  | 'A-09'
  | 'A-10'
  | 'None';

export interface StudentDocument {
  _id?: string;
  // Basic Info
  name: string;
  email: string;
  phone: string;
  whatsapp?: string;

  // Location
  division?: string;
  district?: string;
  town?: string;
  livingArea?: string;

  // Academic
  occupation?: string;
  institute?: string;
  educationalBackground?: string;
  currentYear?: string;
  ageRange?: AgeRange;

  // Device
  workingDevice?: WorkingDevice;

  // Progress
  currentStatus?: StudentStatus;
  lastCompletedAssignment?: LastCompletedAssignment;
  mentorshipJoiningStatus?: boolean;

  // Relations
  callLogs?: string[];
  assignments?: string[];
  followUps?: string[];

  // Metadata
  comments?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

type StudentDocumentWithMongoose = StudentDocument & Document;

const StudentSchema = new Schema<StudentDocumentWithMongoose>(
  {
    // Basic Info
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
    whatsapp: {
      type: String,
      trim: true,
    },

    // Location
    division: String,
    district: String,
    town: String,
    livingArea: String,

    // Academic
    occupation: String,
    institute: String,
    educationalBackground: String,
    currentYear: String,
    ageRange: {
      type: String,
      enum: ['16-17', '18-19', '20-25', '26-30', '31-40', '41-50', '50+'],
    },

    // Device
    workingDevice: {
      type: String,
      enum: ['Laptop', 'Desktop', 'Mobile'],
    },

    // Progress
    currentStatus: {
      type: String,
      enum: ['On Track', 'Behind', 'At Risk', 'Dropped', 'Completed'],
      default: 'On Track',
    },
    lastCompletedAssignment: {
      type: String,
      enum: [
        'A-01',
        'A-02',
        'A-03',
        'A-04',
        'A-05',
        'A-06',
        'A-07',
        'A-08',
        'A-09',
        'A-10',
        'None',
      ],
      default: 'None',
    },
    mentorshipJoiningStatus: {
      type: Boolean,
      default: false,
    },

    // Relations
    callLogs: [
      {
        type: Schema.Types.ObjectId,
        ref: 'CallLog',
      },
    ],
    assignments: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Assignment',
      },
    ],
    followUps: [
      {
        type: Schema.Types.ObjectId,
        ref: 'FollowUp',
      },
    ],

    // Metadata
    comments: [String],
  },
  {
    timestamps: true,
  }
);

// Create indexes for optimal performance
StudentSchema.index({ email: 1, currentStatus: 1 });
StudentSchema.index({ createdAt: -1 });

export default mongoose.models.Student ||
  mongoose.model<StudentDocumentWithMongoose>('Student', StudentSchema);

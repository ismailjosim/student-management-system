/* eslint-disable @typescript-eslint/no-explicit-any */
import CallLog from '@/models/CallLog';
import FollowUp from '@/models/FollowUp';
import Student from '@/models/Student';
import { ObjectId } from 'mongodb';

const FOLLOW_UP_DAYS = 7; // Default days for follow-up after a call

/**
 * Calculate next follow-up date from a given date
 * Default: date + 7 days
 */
export const calculateNextFollowUp = (date: Date, daysAfter: number = FOLLOW_UP_DAYS): Date => {
  const followUpDate = new Date(date);
  followUpDate.setDate(followUpDate.getDate() + daysAfter);
  return followUpDate;
};

/**
 * Get all overdue follow-ups
 */
export const getOverdueFollowUps = async () => {
  try {
    const now = new Date();
    const overdueFollowUps = await FollowUp.find({
      date: { $lt: now },
      status: { $ne: 'completed' },
    }).populate('studentId');

    return overdueFollowUps;
  } catch (error) {
    throw new Error(`Failed to fetch overdue follow-ups: ${error}`);
  }
};

/**
 * Get upcoming follow-ups for specified number of days
 */
export const getUpcomingFollowUps = async (daysAhead: number = 7) => {
  try {
    const now = new Date();
    const futureDate = new Date(now);
    futureDate.setDate(futureDate.getDate() + daysAhead);

    const upcomingFollowUps = await FollowUp.find({
      date: { $gte: now, $lte: futureDate },
      status: 'pending',
    })
      .populate('studentId')
      .sort({ date: 1 });

    return upcomingFollowUps;
  } catch (error) {
    throw new Error(`Failed to fetch upcoming follow-ups: ${error}`);
  }
};

/**
 * Auto-create follow-up after a call log is created
 */
export const autoCreateFollowUp = async (
  callLogId: string,
  studentId: string,
  daysAfter: number = FOLLOW_UP_DAYS
) => {
  try {
    const callLog = await CallLog.findById(callLogId);
    if (!callLog) throw new Error('Call log not found');

    const followUpDate = calculateNextFollowUp(callLog.date, daysAfter);

    const followUp = new FollowUp({
      date: followUpDate,
      note: `Follow-up from call on ${callLog.date.toLocaleDateString()}`,
      studentId,
      status: 'pending',
    });

    await followUp.save();
    return followUp;
  } catch (error) {
    throw new Error(`Failed to auto-create follow-up: ${error}`);
  }
};

/**
 * Check if follow-up is needed for a student
 * Returns true if:
 * - No calls made yet, OR
 * - Last call was > 7 days ago, OR
 * - Has overdue follow-ups
 */
export const isFollowUpNeeded = async (studentId: string): Promise<boolean> => {
  try {
    // Check for existing pending follow-ups
    const pendingFollowUps = await FollowUp.findOne({
      studentId,
      status: 'pending',
    });

    if (pendingFollowUps) {
      return false; // Already has a pending follow-up
    }

    // Check if overdue follow-up exists
    const overdueFollowUp = await FollowUp.findOne({
      studentId,
      date: { $lt: new Date() },
      status: { $ne: 'completed' },
    });

    if (overdueFollowUp) {
      return true; // Has overdue follow-up
    }

    // Check last call
    const lastCall = await CallLog.findOne({ studentId }).sort({ date: -1 });

    if (!lastCall) {
      return true; // Never called
    }

    // Check if last call was more than 7 days ago
    const daysSinceLastCall = Math.floor(
      (new Date().getTime() - lastCall.date.getTime()) / (1000 * 60 * 60 * 24)
    );

    return daysSinceLastCall > FOLLOW_UP_DAYS;
  } catch (error) {
    throw new Error(`Failed to check if follow-up needed: ${error}`);
  }
};

/**
 * Get students needing calls (call queue)
 * Returns students with:
 * - Overdue follow-ups
 * - No calls in X days
 * - Pending assignments
 */
export const getCallQueue = async (limit: number = 50) => {
  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Get students with overdue follow-ups
    const overdueFollowUps = await FollowUp.find({
      date: { $lt: now },
      status: { $ne: 'completed' },
    }).distinct('studentId');

    // Get students not called in 7 days
    const recentCallStudents = await CallLog.find({
      date: { $gte: sevenDaysAgo },
    }).distinct('studentId');

    const notCalledInSevenDays = await Student.find({
      _id: { $nin: recentCallStudents.map((id: any) => new ObjectId(id.toString())) },
    }).limit(limit);

    // Combine and sort by priority (overdue first)
    const students = await Student.find({
      _id: {
        $in: [
          ...overdueFollowUps.map((id: any) => new ObjectId(id.toString())),
          ...notCalledInSevenDays.map((s: any) => s._id),
        ],
      },
    }).limit(limit);

    // Enrich with last call and follow-up info
    const queue = await Promise.all(
      students.map(async (student) => {
        const lastCall = await CallLog.findOne({ studentId: student._id }).sort({ date: -1 });
        const nextFollowUp = await FollowUp.findOne({
          studentId: student._id,
          status: 'pending',
        });
        const overdueFollowUp = await FollowUp.findOne({
          studentId: student._id,
          date: { $lt: now },
          status: { $ne: 'completed' },
        });

        return {
          ...student.toObject(),
          lastCall,
          nextFollowUp,
          overdueFollowUp,
          priority: overdueFollowUp ? 'high' : 'normal',
        };
      })
    );

    // Sort by priority and date
    return queue.sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority === 'high' ? -1 : 1;
      }
      return (b.lastCall?.date || 0) - (a.lastCall?.date || 0);
    });
  } catch (error) {
    throw new Error(`Failed to get call queue: ${error}`);
  }
};

/**
 * Update follow-up status to overdue if date passed
 */
export const updateOverdueStatus = async () => {
  try {
    const now = new Date();
    const result = await FollowUp.updateMany(
      {
        date: { $lt: now },
        status: 'pending',
      },
      {
        $set: { status: 'overdue' },
      }
    );

    return result;
  } catch (error) {
    throw new Error(`Failed to update overdue status: ${error}`);
  }
};

/**
 * Mark follow-up as completed
 */
export const completeFollowUp = async (followUpId: string) => {
  try {
    const followUp = await FollowUp.findByIdAndUpdate(
      followUpId,
      {
        status: 'completed',
        completedDate: new Date(),
      },
      { new: true }
    );

    return followUp;
  } catch (error) {
    throw new Error(`Failed to complete follow-up: ${error}`);
  }
};

/**
 * Get call statistics
 */
export const getCallStatistics = async () => {
  try {
    const totalCalls = await CallLog.countDocuments();
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const callsThisWeek = await CallLog.countDocuments({
      date: { $gte: weekAgo },
    });

    const callsByStatus = await CallLog.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const studentsWithCalls = await CallLog.distinct('studentId');
    const totalStudents = await Student.countDocuments();
    const studentsNeverCalled = totalStudents - studentsWithCalls.length;

    const avgCallsPerStudent = totalStudents > 0 ? totalCalls / studentsWithCalls.length : 0;

    // Calculate average days between calls
    const callsData = await CallLog.find().sort({ date: -1 }).limit(100);
    let totalDaysBetween = 0;
    let gaps = 0;

    for (let i = 1; i < callsData.length; i++) {
      const daysBetween = Math.floor(
        (callsData[i - 1].date.getTime() - callsData[i].date.getTime()) / (1000 * 60 * 60 * 24)
      );
      totalDaysBetween += daysBetween;
      gaps++;
    }

    const avgDaysBetweenCalls = gaps > 0 ? totalDaysBetween / gaps : 0;

    // Reachability metrics
    const reachability = {
      high: 0, // RECEIVED calls
      medium: 0, // NOT_RECEIVED
      low: 0, // PHONE_OFF, SWITCHED_OFF, FOREIGN_NUMBER
    };

    callsByStatus.forEach((item: any) => {
      if (item._id === 'RECEIVED') {
        reachability.high = item.count;
      } else if (item._id === 'NOT_RECEIVED') {
        reachability.medium = item.count;
      } else {
        reachability.low += item.count;
      }
    });

    const successRate = totalCalls > 0 ? ((reachability.high / totalCalls) * 100).toFixed(1) : '0';

    return {
      totalCalls,
      callsThisWeek,
      callsByStatus: Object.fromEntries(callsByStatus.map((item: any) => [item._id, item.count])),
      successRate: `${successRate}%`,
      averageCallsPerStudent: Number(avgCallsPerStudent.toFixed(2)),
      studentsNeverCalled,
      avgDaysBetweenCalls: Number(avgDaysBetweenCalls.toFixed(1)),
      reachability,
    };
  } catch (error) {
    throw new Error(`Failed to get call statistics: ${error}`);
  }
};

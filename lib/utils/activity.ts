import connectToDatabase from '../db/mongodb';
import Activity from '../db/models/Activity';

export interface ActivityData {
  type: 'user_signup' | 'user_login' | 'profile_approved' | 'profile_rejected' | 'user_activated' | 'user_deactivated' | 'email_sent' | 'password_reset' | 'admin_action' | 'email_verification' | string;
  description: string;
  userId?: string;
  userEmail?: string;
  adminId?: string;
  adminEmail?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Log an activity to the database
 * This is the main function to use for logging activities across all modules
 */
export const logActivity = async (activityData: ActivityData): Promise<{ success: boolean; activity?: ActivityData & { _id: string; createdAt: Date }; error?: string }> => {
  try {
    await connectToDatabase();

    const activity = new Activity({
      ...activityData,
      // Ensure type is valid (will throw error if invalid)
    });

    const savedActivity = await activity.save();

    // Debug log removed

    return { success: true, activity: savedActivity };
  } catch (error) {
    console.error('❌ Error logging activity:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred while logging activity'
    };
  }
};

/**
 * Helper function to log user-related activities
 */
export const logUserActivity = async (
  type: string,
  description: string,
  userId: string,
  userEmail: string,
  metadata?: Record<string, unknown>,
  ipAddress?: string,
  userAgent?: string
) => {
  return await logActivity({
    type,
    description,
    userId,
    userEmail,
    metadata,
    ipAddress,
    userAgent,
  });
};

/**
 * Helper function to log admin-related activities
 */
export const logAdminActivity = async (
  type: string,
  description: string,
  adminId: string,
  adminEmail: string,
  userId?: string,
  userEmail?: string,
  metadata?: Record<string, unknown>,
  ipAddress?: string,
  userAgent?: string
) => {
  return await logActivity({
    type,
    description,
    adminId,
    adminEmail,
    userId,
    userEmail,
    metadata,
    ipAddress,
    userAgent,
  });
};

/**
 * Helper function to log system activities (no user/admin context)
 */
export const logSystemActivity = async (
  type: string,
  description: string,
  metadata?: Record<string, unknown>,
  ipAddress?: string,
  userAgent?: string
) => {
  return await logActivity({
    type,
    description,
    metadata,
    ipAddress,
    userAgent,
  });
};

/**
 * Get recent activities with optional filtering
 */
export const getActivities = async (options: {
  type?: string;
  userId?: string;
  adminId?: string;
  limit?: number;
} = {}) => {
  try {
    await connectToDatabase();

    const { type, userId, adminId, limit = 50 } = options;

    const query: Record<string, string> = {};
    if (type) query.type = type;
    if (userId) query.userId = userId;
    if (adminId) query.adminId = adminId;

    const activities = await Activity.find(query)
      .populate('userId', 'name email')
      .populate('adminId', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit);

    return { success: true, activities };
  } catch (error) {
    console.error('Error fetching activities:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      activities: []
    };
  }
};

/**
 * Create a new activity type (for extending the system)
 * Note: This requires updating the enum in the Activity model
 */
export const createActivityType = async (activityData: ActivityData) => {
  // This will validate against the enum in the model
  return await logActivity(activityData);
};

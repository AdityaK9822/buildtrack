const { getFirebaseAdmin } = require('../config/firebase');
const User = require('../models/User');
const Notification = require('../models/Notification');

class FCMService {
  async registerToken(userId, token) {
    // Limit FCM tokens to prevent unbounded array growth
    // First, remove any existing token to avoid duplicates
    await User.findByIdAndUpdate(userId, {
      $pull: { fcmTokens: token },
    });
    
    // Add new token
    await User.findByIdAndUpdate(userId, {
      $addToSet: { fcmTokens: token },
    });
    
    // Clean up old tokens if array exceeds limit (max 10 tokens per user)
    const user = await User.findById(userId);
    if (user && user.fcmTokens && user.fcmTokens.length > 10) {
      const tokensToRemove = user.fcmTokens.slice(0, user.fcmTokens.length - 10);
      await User.findByIdAndUpdate(userId, {
        $pull: { fcmTokens: { $in: tokensToRemove } },
      });
      console.log(`Cleaned up ${tokensToRemove.length} old FCM tokens for user ${userId}`);
    }
  }

  async removeToken(userId, token) {
    await User.findByIdAndUpdate(userId, {
      $pull: { fcmTokens: token },
    });
  }

  async sendToUser(userId, notificationData) {
    const user = await User.findById(userId);

    if (!user || !user.fcmTokens || user.fcmTokens.length === 0) {
      console.log('No FCM tokens for user:', userId);
      return null;
    }

    const message = {
      notification: {
        title: notificationData.title,
        body: notificationData.message,
      },
      data: {
        type: notificationData.type,
        projectId: notificationData.relatedProject?.toString() || '',
        milestoneId: notificationData.relatedMilestone?.toString() || '',
        clickAction: 'FLUTTER_NOTIFICATION_CLICK',
      },
      tokens: user.fcmTokens,
    };

    const admin = getFirebaseAdmin();
    if (!admin) {
      console.log('Firebase Admin not initialized');
      return null;
    }

    try {
      const response = await admin.messaging().sendMulticast(message);
      console.log('Successfully sent message:', response.successCount);

      // Save notification to database
      await Notification.create({
        recipientId: userId,
        ...notificationData,
        sentVia: { inApp: true, push: true },
      });

      // Clean invalid tokens
      if (response.failureCount > 0) {
        const invalidTokens = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success && resp.error) {
            invalidTokens.push(user.fcmTokens[idx]);
          }
        });

        if (invalidTokens.length > 0) {
          await User.findByIdAndUpdate(userId, {
            $pull: { fcmTokens: { $in: invalidTokens } },
          });
        }
      }

      return response;
    } catch (error) {
      console.error('Error sending message:', error);
      return null;
    }
  }

  async sendToMultiple(userIds, notificationData) {
    const users = await User.find({ _id: { $in: userIds } });
    const allTokens = users.flatMap((u) => u.fcmTokens).filter((t) => t);

    if (!allTokens.length) {
      console.log('No FCM tokens found');
      return null;
    }

    const message = {
      notification: {
        title: notificationData.title,
        body: notificationData.message,
      },
      data: notificationData.data || {},
      tokens: allTokens,
    };

    const admin = getFirebaseAdmin();
    if (!admin) {
      return null;
    }

    try {
      const response = await admin.messaging().sendMulticast(message);

      // Create notifications for each user
      const notifications = userIds.map((userId) => ({
        recipientId: userId,
        ...notificationData,
        sentVia: { inApp: true, push: true },
      }));
      await Notification.insertMany(notifications);

      return response;
    } catch (error) {
      console.error('Error sending multicast message:', error);
      return null;
    }
  }

  async sendMilestoneApproval(milestone, projectId, clientId) {
    // Notify contractor
    await this.sendToUser(milestone.approvalRequest.requestedBy, {
      title: 'Milestone Approved! 🎉',
      message: `Your milestone "${milestone.name}" has been approved.`,
      type: 'milestone-approved',
      relatedProject: projectId,
      relatedMilestone: milestone._id,
    });

    // Notify client
    if (clientId) {
      await this.sendToUser(clientId, {
        title: 'Milestone Completed',
        message: `Milestone "${milestone.name}" is complete.`,
        type: 'milestone-completed',
        relatedProject: projectId,
        relatedMilestone: milestone._id,
      });
    }
  }
}

module.exports = new FCMService();

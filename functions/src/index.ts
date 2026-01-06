import * as admin from 'firebase-admin';
import { onRequest } from 'firebase-functions/v2/https';

admin.initializeApp();

export const sendNotification = onRequest(
  { region: 'asia-southeast1' },
    async (req, res): Promise<void> => {
    try{
      const { fcmToken, targetUserId, title, body } = req.body;

      if (!fcmToken || !targetUserId || !title || !body) {
        res.status(400).json({
          error: 'Missing required fields',
        });
      }

      await admin.messaging().send({
        token: fcmToken,
        notification: {
          title,
          body,
        },
        android: {
          priority: 'high',
          notification: {
            channelId: 'newTask',
            sound: 'New Task',
          },
        },
      });

      res.json({ success: true });
    } catch(e) {
        console.error(e);
        res.status(500).json({ error: 'Internal error' });
    }
  }
);

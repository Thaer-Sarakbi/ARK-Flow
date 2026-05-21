export const pushNotification = async (fcmToken: string, assignedToId: string, title: string, body: string, screenName: string) => {
  await fetch(
      'https://sendnotification-jx5tc6ooqq-as.a.run.app',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fcmToken,
          targetUserId: assignedToId,
          title,
          body,
          screenName
        }),
      }
    );
}
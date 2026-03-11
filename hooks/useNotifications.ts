import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { NotificationTone } from './useSettings';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const CHANNEL_ID = 'mindfuel_daily';

export type NotificationPayload = {
  quoteText: string;
  author?: string;
  category?: string;
  tone: NotificationTone;
};

function buildNotification(payload: NotificationPayload): { title: string; body: string } {
  const { quoteText, author, category, tone } = payload;

  switch (tone) {
    case 'quote':
      return {
        title: 'Your daily fuel 🔥',
        body: author ? `"${quoteText}" — ${author}` : `"${quoteText}"`,
      };
    case 'teaser':
      return {
        title: 'MindFuel is ready for you',
        body: 'Tap to fuel your mind for the day 💡',
      };
    case 'category':
      return {
        title: `${(category ?? 'Mind').replace('_', ' ')} time 🌟`,
        body: `Your ${category?.replace('_', ' ') ?? 'daily'} quote is waiting`,
      };
    case 'personalized':
      const preview = quoteText.split(' ').slice(0, 6).join(' ');
      return {
        title: `"${preview}..."`,
        body: 'Read your full quote for today →',
      };
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleDaily(
  timeStr: string, // "HH:mm"
  payload: NotificationPayload
): Promise<void> {
  await cancelDaily();

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Daily Quote',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const [hour, minute] = timeStr.split(':').map(Number);
  const { title, body } = buildNotification(payload);

  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
      data: { type: 'daily_quote' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
      channelId: CHANNEL_ID,
    },
  });
}

export async function cancelDaily(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

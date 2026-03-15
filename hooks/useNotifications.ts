/**
 * useNotifications — Expo Go safe
 *
 * expo-notifications removed remote push support from Expo Go in SDK 53.
 * Any attempt to register for push tokens at module-load time crashes the app.
 * All functions here are wrapped in try/catch so the app works in both
 * Expo Go (silent no-ops) and a real dev/prod build (full functionality).
 */
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { NotificationTone } from './useSettings';

// ─── Detect Expo Go ──────────────────────────────────────────────────────────
const isExpoGo =
  Constants.appOwnership === 'expo' ||
  (Constants.executionEnvironment as string) === 'storeClient';

// ─── Safe handler setup ──────────────────────────────────────────────────────
// Only call setNotificationHandler in real builds — Expo Go will throw.
if (!isExpoGo) {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  } catch (_) {}
}

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
      return { title: 'MindFuel is ready for you', body: 'Tap to fuel your mind for the day 💡' };
    case 'category':
      return {
        title: `${(category ?? 'Mind').replace('_', ' ')} time 🌟`,
        body: `Your ${category?.replace('_', ' ') ?? 'daily'} quote is waiting`,
      };
    case 'personalized':
    default:
      const preview = quoteText.split(' ').slice(0, 6).join(' ');
      return { title: `"${preview}..."`, body: 'Read your full quote for today \u2192' };
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (isExpoGo) return false;
  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === 'granted') return true;
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch (_) {
    return false;
  }
}

export async function scheduleDaily(
  timeStr: string,
  payload: NotificationPayload
): Promise<void> {
  if (isExpoGo) return;
  try {
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
      content: { title, body, sound: true, data: { type: 'daily_quote' } },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
        channelId: CHANNEL_ID,
      },
    });
  } catch (_) {}
}

export async function cancelDaily(): Promise<void> {
  if (isExpoGo) return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (_) {}
}

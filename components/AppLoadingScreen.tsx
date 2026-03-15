/**
 * AppLoadingScreen
 *
 * Shows every time the app opens while AsyncStorage / settings are loading.
 * Displays: app icon, app name, and a random motivational phrase.
 * Fades in smoothly, then fades out when the app is ready.
 */
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PHRASES = [
  'Your best chapter starts today.',
  'Small steps build great lives.',
  'You are stronger than you think.',
  'Progress, not perfection.',
  'Every day is a fresh start.',
  'The work you do today matters.',
  'Believe in who you are becoming.',
  'Show up. Do the work. Repeat.',
  'One moment of courage changes everything.',
  'Growth lives outside your comfort zone.',
];

function pickPhrase(): string {
  return PHRASES[Math.floor(Math.random() * PHRASES.length)];
}

type Props = {
  onDone: () => void;
  minDuration?: number; // minimum ms to show the screen, default 1400
};

export default function AppLoadingScreen({ onDone, minDuration = 1400 }: Props) {
  const phrase = useRef(pickPhrase()).current;

  // Animations
  const iconScale  = useRef(new Animated.Value(0.7)).current;
  const iconOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 1. Icon pops in
    Animated.parallel([
      Animated.spring(iconScale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 60,
        friction: 7,
      }),
      Animated.timing(iconOpacity, {
        toValue: 1,
        duration: 320,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Text fades in slightly after
    Animated.timing(textOpacity, {
      toValue: 1,
      duration: 400,
      delay: 250,
      useNativeDriver: true,
    }).start();

    // 3. After minDuration, fade out and call onDone
    const timer = setTimeout(() => {
      Animated.timing(screenOpacity, {
        toValue: 0,
        duration: 380,
        useNativeDriver: true,
      }).start(() => onDone());
    }, minDuration);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View style={[styles.root, { opacity: screenOpacity }]}>
      <SafeAreaView style={styles.safe}>
        {/* Top spacer */}
        <View style={{ flex: 1 }} />

        {/* Icon + app name */}
        <Animated.View
          style={[
            styles.logoBlock,
            { opacity: iconOpacity, transform: [{ scale: iconScale }] },
          ]}
        >
          {/* Icon circle */}
          <View style={styles.iconRing}>
            <View style={styles.iconCircle}>
              <Text style={styles.iconEmoji}>⚡</Text>
            </View>
          </View>

          <Text style={styles.appName}>MindFuel</Text>
          <Text style={styles.appTagline}>Fuel Your Mind Daily</Text>
        </Animated.View>

        {/* Motivational phrase */}
        <Animated.View style={[styles.phraseBlock, { opacity: textOpacity }]}>
          <Text style={styles.phrase}>"{phrase}"</Text>
        </Animated.View>

        {/* Bottom: loading dots */}
        <View style={{ flex: 1, justifyContent: 'flex-end', paddingBottom: 48, alignItems: 'center' }}>
          <LoadingDots />
        </View>
      </SafeAreaView>
    </Animated.View>
  );
}

// Simple animated loading dots
function LoadingDots() {
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0.3, duration: 300, useNativeDriver: true }),
          Animated.delay(600),
        ])
      ).start();

    pulse(dot1, 0);
    pulse(dot2, 200);
    pulse(dot3, 400);
  }, []);

  const dotStyle = (anim: Animated.Value) => ({
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(167,139,250,0.9)',
    opacity: anim,
  });

  return (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      <Animated.View style={dotStyle(dot1)} />
      <Animated.View style={dotStyle(dot2)} />
      <Animated.View style={dotStyle(dot3)} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#08080E',
    zIndex: 999,
  },
  safe: {
    flex: 1,
    alignItems: 'center',
  },
  logoBlock: {
    alignItems: 'center',
    gap: 16,
  },
  iconRing: {
    width: 110,
    height: 110,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: 'rgba(124,92,252,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(124,92,252,0.08)',
  },
  iconCircle: {
    width: 86,
    height: 86,
    borderRadius: 22,
    backgroundColor: 'rgba(124,92,252,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconEmoji: {
    fontSize: 46,
  },
  appName: {
    fontSize: 36,
    fontWeight: '800',
    color: '#F0F0FA',
    letterSpacing: -0.8,
    marginTop: 4,
  },
  appTagline: {
    fontSize: 14,
    color: '#4A4A65',
    letterSpacing: 0.5,
    fontWeight: '500',
  },
  phraseBlock: {
    marginTop: 56,
    paddingHorizontal: 40,
  },
  phrase: {
    fontSize: 18,
    color: 'rgba(167,139,250,0.85)',
    textAlign: 'center',
    lineHeight: 28,
    fontStyle: 'italic',
    fontWeight: '400',
    letterSpacing: 0.2,
  },
});

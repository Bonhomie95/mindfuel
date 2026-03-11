import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import {
  Alert,
  FlatList,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MOOD_LABELS, useJournal, type JournalEntry } from '../../hooks/useJournal';
import { theme } from '../../constants/theme';

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function EntryCard({ entry, onDelete }: { entry: JournalEntry; onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => setExpanded(!expanded)}
      style={styles.entryCard}
    >
      <View style={styles.entryHeader}>
        <View style={styles.entryMeta}>
          {entry.mood && <Text style={styles.entryMood}>{entry.mood}</Text>}
          <Text style={styles.entryDate}>{formatDate(entry.createdAt)}</Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            Alert.alert('Delete Entry', 'Remove this journal entry?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', style: 'destructive', onPress: onDelete },
            ]);
          }}
          style={styles.deleteBtn}
        >
          <Ionicons name="trash-outline" size={16} color={theme.colors.textMuted} />
        </TouchableOpacity>
      </View>

      <Text style={styles.entryQuote} numberOfLines={expanded ? undefined : 2}>
        "{entry.quoteText}"
      </Text>
      {entry.quoteAuthor && (
        <Text style={styles.entryAuthor}>— {entry.quoteAuthor}</Text>
      )}

      {expanded && (
        <>
          {entry.prompt && (
            <View style={styles.promptChip}>
              <Text style={styles.promptChipText}>{entry.prompt}</Text>
            </View>
          )}
          <Text style={styles.entryNote}>{entry.note}</Text>
        </>
      )}

      {!expanded && (
        <Text style={styles.entryNotePeek} numberOfLines={2}>
          {entry.note}
        </Text>
      )}

      <Text style={styles.expandHint}>{expanded ? 'Tap to collapse' : 'Tap to read'}</Text>
    </TouchableOpacity>
  );
}

export default function JournalScreen() {
  const { entries, deleteEntry } = useJournal();

  return (
    <View style={styles.root}>
      <SafeAreaView>
        <View style={styles.header}>
          <Text style={styles.title}>Journal</Text>
          <Text style={styles.sub}>
            {entries.length > 0
              ? `${entries.length} entr${entries.length !== 1 ? 'ies' : 'y'}`
              : 'Your reflections live here'}
          </Text>
        </View>
      </SafeAreaView>

      {entries.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>📓</Text>
          <Text style={styles.emptyTitle}>Your journal is empty</Text>
          <Text style={styles.emptySub}>
            Tap the pencil icon on any quote to start reflecting. Writing even one line makes a difference.
          </Text>
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <EntryCard entry={item} onDelete={() => deleteEntry(item.id)} />
          )}
          contentContainerStyle={{ paddingBottom: 100, paddingTop: 8 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.bg },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  title: { fontSize: 28, fontWeight: '800', color: theme.colors.text, letterSpacing: -0.5 },
  sub: { fontSize: 14, color: theme.colors.textSub, marginTop: 4 },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 48,
    gap: 16,
  },
  emptyEmoji: { fontSize: 56 },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.textSub,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 14,
    color: theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  entryCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 10,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  entryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  entryMood: { fontSize: 20 },
  entryDate: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  deleteBtn: { padding: 4 },
  entryQuote: {
    color: theme.colors.textSub,
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  entryAuthor: {
    color: theme.colors.textMuted,
    fontSize: 12,
  },
  promptChip: {
    backgroundColor: theme.colors.primaryDim,
    borderRadius: theme.radius.sm,
    padding: 10,
    borderWidth: 1,
    borderColor: theme.colors.primaryDim,
  },
  promptChipText: {
    color: theme.colors.primaryLight,
    fontSize: 12,
    lineHeight: 18,
  },
  entryNote: {
    color: theme.colors.text,
    fontSize: 15,
    lineHeight: 24,
  },
  entryNotePeek: {
    color: theme.colors.text,
    fontSize: 15,
    lineHeight: 22,
  },
  expandHint: {
    color: theme.colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'right',
    marginTop: 4,
  },
});

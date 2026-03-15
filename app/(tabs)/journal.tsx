import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Alert, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MOOD_LABELS, useJournal, type JournalEntry } from '../../hooks/useJournal';
import { useTheme } from '../../contexts/ThemeContext';

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function EntryCard({ entry, onDelete, theme }: { entry: JournalEntry; onDelete: () => void; theme: any }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={() => setExpanded(!expanded)}
      style={{ marginHorizontal: 16, marginVertical: 8, backgroundColor: theme.colors.card, borderRadius: theme.radius.lg, padding: 18, borderWidth: 1, borderColor: theme.colors.border, gap: 10 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {entry.mood && <Text style={{ fontSize: 20 }}>{entry.mood}</Text>}
          <Text style={{ color: theme.colors.textMuted, fontSize: 12, fontWeight: '600' }}>{formatDate(entry.createdAt)}</Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            Alert.alert('Delete Entry', 'Remove this journal entry?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', style: 'destructive', onPress: onDelete },
            ]);
          }}
          style={{ padding: 4 }}>
          <Ionicons name="trash-outline" size={16} color={theme.colors.textMuted} />
        </TouchableOpacity>
      </View>

      <View style={{ borderLeftWidth: 2, borderLeftColor: theme.colors.primaryDim, paddingLeft: 10 }}>
        <Text style={{ color: theme.colors.textSub, fontSize: 14, fontStyle: 'italic', lineHeight: 20 }} numberOfLines={expanded ? undefined : 2}>
          "{entry.quoteText}"
        </Text>
        {entry.quoteAuthor && <Text style={{ color: theme.colors.textMuted, fontSize: 12, marginTop: 2 }}>— {entry.quoteAuthor}</Text>}
      </View>

      {expanded && (
        <>
          {entry.prompt && (
            <View style={{ backgroundColor: theme.colors.primaryDim, borderRadius: theme.radius.sm, padding: 10, borderWidth: 1, borderColor: theme.colors.primaryDim }}>
              <Text style={{ color: theme.colors.primaryLight, fontSize: 12, lineHeight: 18 }}>{entry.prompt}</Text>
            </View>
          )}
          <Text style={{ color: theme.colors.text, fontSize: 15, lineHeight: 24 }}>{entry.note}</Text>
        </>
      )}

      {!expanded && (
        <Text style={{ color: theme.colors.text, fontSize: 15, lineHeight: 22 }} numberOfLines={2}>{entry.note}</Text>
      )}

      <Text style={{ color: theme.colors.textMuted, fontSize: 11, fontWeight: '600', textAlign: 'right', marginTop: 4 }}>
        {expanded ? 'Tap to collapse' : 'Tap to read'}
      </Text>
    </TouchableOpacity>
  );
}

export default function JournalScreen() {
  const { theme } = useTheme();
  const { entries, deleteEntry } = useJournal();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <SafeAreaView>
        <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 }}>
          <Text style={{ fontSize: 28, fontWeight: '800', color: theme.colors.text, letterSpacing: -0.5 }}>Journal</Text>
          <Text style={{ fontSize: 14, color: theme.colors.textSub, marginTop: 4 }}>
            {entries.length > 0 ? `${entries.length} entr${entries.length !== 1 ? 'ies' : 'y'}` : 'Your reflections live here'}
          </Text>
        </View>
      </SafeAreaView>

      {entries.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 48, gap: 16 }}>
          <Text style={{ fontSize: 56 }}>📓</Text>
          <Text style={{ fontSize: 20, fontWeight: '700', color: theme.colors.textSub, textAlign: 'center' }}>Your journal is empty</Text>
          <Text style={{ fontSize: 14, color: theme.colors.textMuted, textAlign: 'center', lineHeight: 22 }}>
            Tap the pencil icon on any quote to start reflecting. Writing even one line makes a difference.
          </Text>
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <EntryCard entry={item} onDelete={() => deleteEntry(item.id)} theme={theme} />}
          contentContainerStyle={{ paddingBottom: 100, paddingTop: 8 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

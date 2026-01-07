import { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  RefreshControl,
  StyleSheet,
  Platform,
  Pressable,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import {
  useJournalStore,
  getTodayPrompt,
  getRandomGratitudePrompt,
  JournalEntryType,
} from '../../stores/journalStore';
import { JournalEntryEditor, JournalCard } from '../../components/JournalEntry';

type EditorState = {
  visible: boolean;
  type: JournalEntryType;
  prompt?: string;
  editId?: string;
};

export default function JournalScreen() {
  const { entries, getTodayEntries, getStreak, deleteEntry } = useJournalStore();
  const [editor, setEditor] = useState<EditorState>({
    visible: false,
    type: 'freeform',
  });
  const [refreshing, setRefreshing] = useState(false);

  const todayEntries = getTodayEntries();
  const streak = getStreak();
  const todayPrompt = getTodayPrompt();

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 300);
  }, []);

  const openEditor = (type: JournalEntryType, prompt?: string) => {
    setEditor({ visible: true, type, prompt });
  };

  const handleDeleteEntry = (id: string) => {
    Alert.alert(
      'حذف المدخل',
      'هل أنت متأكد من حذف هذا المدخل؟ لا يمكن التراجع عن هذا الإجراء.',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: () => deleteEntry(id),
        },
      ]
    );
  };

  const handleEditEntry = (id: string) => {
    const entry = entries.find((e) => e.id === id);
    if (entry) {
      setEditor({
        visible: true,
        type: entry.type,
        prompt: entry.prompt,
        editId: id,
      });
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#5a9470"
          />
        }
      >
        {/* Stats Card */}
        <Animated.View
          entering={FadeInDown.delay(100).springify()}
          style={styles.statsCard}
        >
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{streak}</Text>
              <Text style={styles.statLabel}>يوم متتالي</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{entries.length}</Text>
              <Text style={styles.statLabel}>مدخلات</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{todayEntries.length}</Text>
              <Text style={styles.statLabel}>اليوم</Text>
            </View>
          </View>
        </Animated.View>

        {/* Today's Prompt */}
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <Pressable
            onPress={() => openEditor('reflection', todayPrompt)}
            style={styles.promptCard}
          >
            <Text style={styles.promptLabel}>تأمل اليوم</Text>
            <Text style={styles.promptText}>"{todayPrompt}"</Text>
            <Text style={styles.promptHint}>اضغط للكتابة</Text>
          </Pressable>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View
          entering={FadeInDown.delay(300).springify()}
          style={styles.quickActions}
        >
          <Pressable
            onPress={() => openEditor('gratitude', getRandomGratitudePrompt())}
            style={styles.actionButton}
          >
            <Text style={styles.actionTitle}>الامتنان</Text>
            <Text style={styles.actionSubtitle}>ما الذي تشكر عليه؟</Text>
          </Pressable>
          <Pressable
            onPress={() => openEditor('freeform')}
            style={[styles.actionButton, styles.actionButtonAlt]}
          >
            <Text style={[styles.actionTitle, styles.actionTitleAlt]}>كتابة حرة</Text>
            <Text style={[styles.actionSubtitle, styles.actionSubtitleAlt]}>اكتب أي شيء يدور بذهنك</Text>
          </Pressable>
        </Animated.View>

        {/* Recent Entries */}
        <Animated.View entering={FadeInDown.delay(400).springify()}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>المدخلات الأخيرة</Text>
            {entries.length > 0 && (
              <Text style={styles.sectionCount}>{entries.length}</Text>
            )}
          </View>

          {entries.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>ابدأ يومياتك</Text>
              <Text style={styles.emptyText}>
                اضغط على تأمل اليوم أعلاه لكتابة أول مدخل لك.
                كل شيء يُحفظ محلياً على جهازك.
              </Text>
            </View>
          ) : (
            entries.slice(0, 10).map((entry, index) => (
              <Animated.View
                key={entry.id}
                entering={FadeInUp.delay(index * 50)}
              >
                <JournalCard
                  entry={entry}
                  onPress={() => handleEditEntry(entry.id)}
                  onDelete={() => handleDeleteEntry(entry.id)}
                />
              </Animated.View>
            ))
          )}

          {entries.length > 10 && (
            <Pressable style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>
                عرض كل المدخلات ({entries.length})
              </Text>
            </Pressable>
          )}
        </Animated.View>

        {/* Privacy Note */}
        <Animated.View
          entering={FadeInDown.delay(500).springify()}
          style={styles.privacyNote}
        >
          <Text style={styles.privacyTitle}>خاص وبدون إنترنت</Text>
          <Text style={styles.privacyText}>
            مدخلات يومياتك تُخزن فقط على هذا الجهاز. لا يتم رفعها أو مشاركتها أبداً.
          </Text>
        </Animated.View>
      </ScrollView>

      {/* Editor Modal */}
      <Modal
        visible={editor.visible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <JournalEntryEditor
          type={editor.type}
          prompt={editor.prompt}
          editId={editor.editId}
          onSave={() => setEditor({ visible: false, type: 'freeform' })}
          onCancel={() => setEditor({ visible: false, type: 'freeform' })}
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fefdfb',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 32 : 24,
  },

  // Stats Card
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#2d3a2e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 28,
    color: '#5a9470',
  },
  statLabel: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: '#a69889',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#f0ebe4',
  },

  // Prompt Card
  promptCard: {
    backgroundColor: '#5a9470',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  promptLabel: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  promptText: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 18,
    color: '#fff',
    lineHeight: 26,
  },
  promptHint: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 14,
  },

  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#fff8f0',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f5ebe0',
  },
  actionButtonAlt: {
    backgroundColor: '#f0f7f1',
    borderColor: '#dcedde',
  },
  actionTitle: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 15,
    color: '#c97d52',
    marginBottom: 4,
  },
  actionTitleAlt: {
    color: '#5a9470',
  },
  actionSubtitle: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: '#c97d52',
    opacity: 0.7,
  },
  actionSubtitleAlt: {
    color: '#5a9470',
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 18,
    color: '#2d3a2e',
  },
  sectionCount: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 13,
    color: '#5a9470',
    backgroundColor: '#dcedde',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#faf7f2',
    borderRadius: 14,
  },
  emptyTitle: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 16,
    color: '#2d3a2e',
    marginBottom: 8,
  },
  emptyText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: '#a69889',
    textAlign: 'center',
    lineHeight: 20,
  },

  // View All Button
  viewAllButton: {
    padding: 16,
    alignItems: 'center',
  },
  viewAllText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 14,
    color: '#5a9470',
  },

  // Privacy Note
  privacyNote: {
    marginTop: 16,
    padding: 14,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
  },
  privacyTitle: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 13,
    color: '#757575',
    marginBottom: 4,
  },
  privacyText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: '#9e9e9e',
    lineHeight: 18,
  },
});

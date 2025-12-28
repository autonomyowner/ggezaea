import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useJournalStore, JournalEntryType } from '../stores/journalStore';

interface JournalEntryEditorProps {
  type: JournalEntryType;
  prompt?: string;
  onSave: () => void;
  onCancel: () => void;
  editId?: string;
}

const MOOD_OPTIONS = [
  { value: 1, emoji: '😔', label: 'Struggling' },
  { value: 2, emoji: '😕', label: 'Low' },
  { value: 3, emoji: '😐', label: 'Okay' },
  { value: 4, emoji: '🙂', label: 'Good' },
  { value: 5, emoji: '😊', label: 'Great' },
];

export function JournalEntryEditor({
  type,
  prompt,
  onSave,
  onCancel,
  editId,
}: JournalEntryEditorProps) {
  const { addEntry, updateEntry, getEntry } = useJournalStore();
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (editId) {
      const entry = getEntry(editId);
      if (entry) {
        setContent(entry.content);
        setMood(entry.mood);
      }
    }
  }, [editId, getEntry]);

  const handleSave = () => {
    if (!content.trim()) return;

    if (editId) {
      updateEntry(editId, content.trim());
    } else {
      addEntry({
        type,
        content: content.trim(),
        prompt,
        mood,
      });
    }

    onSave();
  };

  const getTitle = () => {
    switch (type) {
      case 'gratitude':
        return 'Gratitude';
      case 'reflection':
        return 'Daily Reflection';
      default:
        return 'Journal Entry';
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#fefdfb' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <Animated.View
          entering={FadeIn}
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
          }}
        >
          <TouchableOpacity onPress={onCancel} style={{ padding: 8 }}>
            <Ionicons name="close" size={24} color="#5a5347" />
          </TouchableOpacity>
          <Text
            style={{
              fontFamily: 'DMSerifDisplay_400Regular',
              fontSize: 20,
              color: '#2d3a2e',
            }}
          >
            {getTitle()}
          </Text>
          <TouchableOpacity
            onPress={handleSave}
            disabled={!content.trim()}
            style={{
              backgroundColor: content.trim() ? '#5a9470' : '#e5ddd5',
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 16,
            }}
          >
            <Text
              style={{
                color: content.trim() ? 'white' : '#a69889',
                fontWeight: '600',
              }}
            >
              Save
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Prompt */}
        {prompt && (
          <Animated.View
            entering={FadeInDown.delay(100)}
            style={{
              backgroundColor: '#f0f7f1',
              borderRadius: 12,
              padding: 16,
              marginBottom: 20,
              borderLeftWidth: 4,
              borderLeftColor: '#5a9470',
            }}
          >
            <Text
              style={{
                color: '#3d654c',
                fontSize: 16,
                lineHeight: 24,
                fontStyle: 'italic',
              }}
            >
              {prompt}
            </Text>
          </Animated.View>
        )}

        {/* Mood selector */}
        {type === 'reflection' && (
          <Animated.View entering={FadeInDown.delay(150)} style={{ marginBottom: 20 }}>
            <Text
              style={{
                color: '#5a5347',
                fontSize: 14,
                marginBottom: 12,
                fontWeight: '500',
              }}
            >
              How are you feeling?
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              {MOOD_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => setMood(option.value)}
                  style={{
                    alignItems: 'center',
                    padding: 8,
                    borderRadius: 12,
                    backgroundColor:
                      mood === option.value ? '#dcedde' : 'transparent',
                  }}
                >
                  <Text style={{ fontSize: 28 }}>{option.emoji}</Text>
                  <Text
                    style={{
                      fontSize: 11,
                      color: mood === option.value ? '#3d654c' : '#a69889',
                      marginTop: 4,
                    }}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        )}

        {/* Text input */}
        <Animated.View entering={FadeInDown.delay(200)} style={{ flex: 1 }}>
          <TextInput
            style={{
              backgroundColor: 'white',
              borderRadius: 16,
              padding: 16,
              fontSize: 16,
              lineHeight: 24,
              color: '#2d3a2e',
              minHeight: 200,
              textAlignVertical: 'top',
              borderWidth: 1,
              borderColor: '#f5ebe0',
            }}
            placeholder="Start writing..."
            placeholderTextColor="#c4b8ac"
            value={content}
            onChangeText={setContent}
            multiline
            autoFocus
          />
        </Animated.View>

        {/* Tips */}
        <Animated.View
          entering={FadeInDown.delay(300)}
          style={{
            marginTop: 20,
            padding: 16,
            backgroundColor: '#fff8f0',
            borderRadius: 12,
          }}
        >
          <Text style={{ color: '#c97d52', fontSize: 13, lineHeight: 20 }}>
            {type === 'gratitude'
              ? 'Tip: Focus on the feeling of gratitude, not just listing things. How does it make you feel?'
              : 'Tip: Write freely without judgment. This is your private space for self-reflection.'}
          </Text>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

interface JournalCardProps {
  entry: {
    id: string;
    type: JournalEntryType;
    content: string;
    prompt?: string;
    mood?: number;
    createdAt: string;
  };
  onPress: () => void;
  onDelete: () => void;
}

export function JournalCard({ entry, onPress, onDelete }: JournalCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'long' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const getTypeLabel = () => {
    switch (entry.type) {
      case 'gratitude':
        return 'Gratitude';
      case 'reflection':
        return 'Reflection';
      default:
        return 'Journal';
    }
  };

  const getTypeColor = () => {
    switch (entry.type) {
      case 'gratitude':
        return '#c97d52';
      case 'reflection':
        return '#5a9470';
      default:
        return '#6b9ac4';
    }
  };

  const moodEmoji = entry.mood
    ? MOOD_OPTIONS.find((m) => m.value === entry.mood)?.emoji
    : null;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#f5ebe0',
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
          <View
            style={{
              backgroundColor: getTypeColor() + '20',
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 12,
            }}
          >
            <Text
              style={{
                color: getTypeColor(),
                fontSize: 12,
                fontWeight: '600',
              }}
            >
              {getTypeLabel()}
            </Text>
          </View>
          {moodEmoji && <Text style={{ fontSize: 16 }}>{moodEmoji}</Text>}
        </View>
        <Text style={{ color: '#c4b8ac', fontSize: 12, marginRight: 28 }}>
          {formatDate(entry.createdAt)}
        </Text>
      </View>

      {entry.prompt && (
        <Text
          style={{
            color: '#a69889',
            fontSize: 13,
            fontStyle: 'italic',
            marginBottom: 8,
          }}
          numberOfLines={1}
        >
          {entry.prompt}
        </Text>
      )}

      <Text
        style={{
          color: '#2d3a2e',
          fontSize: 15,
          lineHeight: 22,
        }}
        numberOfLines={3}
      >
        {entry.content}
      </Text>

      <TouchableOpacity
        onPress={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          padding: 4,
        }}
      >
        <Ionicons name="trash-outline" size={18} color="#d9d0c5" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

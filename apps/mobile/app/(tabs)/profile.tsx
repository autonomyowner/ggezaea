import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
  StyleSheet,
  Dimensions,
  Alert,
  Pressable,
  Modal,
} from 'react-native';
import { useGoalsStore, Goal, Todo, FinishedGoal, getRandomCelebrationMessage } from '../../stores/goalsStore';

const { width, height } = Dimensions.get('window');

// Floating particle for celebration
function FloatingParticle({ delay, startX }: { delay: number; startX: number }) {
  const translateY = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timeout = setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -height * 0.6,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.delay(2000),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 700,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(scale, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: (Math.random() - 0.5) * 100,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(rotate, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);

    return () => clearTimeout(timeout);
  }, []);

  const size = 8 + Math.random() * 12;
  const colors = ['#5a9470', '#7db88f', '#a8d5ba', '#c97d52', '#dcedde'];
  const color = colors[Math.floor(Math.random() * colors.length)];

  return (
    <Animated.View
      style={{
        position: 'absolute',
        bottom: 100,
        left: startX,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        opacity,
        transform: [
          { translateY },
          { translateX },
          { scale },
          {
            rotate: rotate.interpolate({
              inputRange: [0, 1],
              outputRange: ['0deg', '360deg'],
            }),
          },
        ],
      }}
    />
  );
}

// Celebration Modal
function CelebrationModal({
  visible,
  goalTitle,
  onClose,
}: {
  visible: boolean;
  goalTitle: string;
  onClose: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const message = useRef(getRandomCelebrationMessage()).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    delay: i * 100,
    startX: (width / 20) * i,
  }));

  return (
    <Modal visible={visible} transparent animationType="none">
      <Animated.View style={[styles.modalOverlay, { opacity: opacityAnim }]}>
        {/* Floating particles */}
        {particles.map((p) => (
          <FloatingParticle key={p.id} delay={p.delay} startX={p.startX} />
        ))}

        <Animated.View
          style={[
            styles.celebrationCard,
            {
              transform: [{ scale: scaleAnim }, { scale: pulseAnim }],
            },
          ]}
        >
          {/* Decorative circles */}
          <View style={styles.decorCircle1} />
          <View style={styles.decorCircle2} />
          <View style={styles.decorCircle3} />

          {/* Success badge */}
          <View style={styles.successBadge}>
            <Text style={styles.successCheck}>✓</Text>
          </View>

          {/* Content */}
          <Text style={styles.celebrationTitle}>{message.title}</Text>
          <Text style={styles.celebrationGoal}>"{goalTitle}"</Text>
          <Text style={styles.celebrationSubtitle}>{message.subtitle}</Text>

          {/* Continue button */}
          <TouchableOpacity
            style={styles.continueButton}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

// Animated checkbox without icons
function AnimatedCheckbox({
  checked,
  onPress,
  priority,
}: {
  checked: boolean;
  onPress: () => void;
  priority: Todo['priority'];
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const fillAnim = useRef(new Animated.Value(checked ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(fillAnim, {
      toValue: checked ? 1 : 0,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  }, [checked]);

  const handlePress = () => {
    Animated.sequence([
      Animated.spring(scale, {
        toValue: 0.8,
        useNativeDriver: true,
        tension: 200,
        friction: 10,
      }),
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 200,
        friction: 10,
      }),
    ]).start();
    onPress();
  };

  const priorityColors = {
    high: '#c97d52',
    medium: '#5a9470',
    low: '#a69889',
  };

  return (
    <Pressable onPress={handlePress}>
      <Animated.View
        style={[
          styles.checkbox,
          {
            transform: [{ scale }],
            borderColor: priorityColors[priority],
          },
        ]}
      >
        <Animated.View
          style={[
            styles.checkboxFill,
            {
              backgroundColor: priorityColors[priority],
              opacity: fillAnim,
              transform: [{ scale: fillAnim }],
            },
          ]}
        />
      </Animated.View>
    </Pressable>
  );
}

// Todo item component
function TodoItem({ todo, onToggle, onDelete }: { todo: Todo; onToggle: () => void; onDelete: () => void }) {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }).start();
  }, []);

  const handleDelete = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => onDelete());
  };

  return (
    <Animated.View
      style={[
        styles.todoItem,
        {
          opacity: opacityAnim,
          transform: [
            {
              translateX: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-50, 0],
              }),
            },
          ],
        },
      ]}
    >
      <AnimatedCheckbox
        checked={todo.completed}
        onPress={onToggle}
        priority={todo.priority}
      />
      <TouchableOpacity
        style={styles.todoContent}
        onLongPress={handleDelete}
        delayLongPress={500}
      >
        <Text
          style={[
            styles.todoText,
            todo.completed && styles.todoTextCompleted,
          ]}
        >
          {todo.text}
        </Text>
        <Text style={styles.todoPriority}>
          {todo.priority === 'high' ? 'urgent' : todo.priority}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// Goal card component
function GoalCard({
  goal,
  onUpdate,
  onDelete,
  onComplete,
}: {
  goal: Goal;
  onUpdate: (value: number) => void;
  onDelete: () => void;
  onComplete: () => void;
}) {
  const progress = (goal.currentValue / goal.targetValue) * 100;
  const progressAnim = useRef(new Animated.Value(progress)).current;

  useEffect(() => {
    Animated.spring(progressAnim, {
      toValue: progress,
      tension: 40,
      friction: 8,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const handleIncrement = () => {
    if (goal.currentValue < goal.targetValue) {
      const newValue = goal.currentValue + 1;
      onUpdate(newValue);

      // Check if goal is now complete
      if (newValue >= goal.targetValue) {
        setTimeout(() => {
          onComplete();
        }, 300);
      }
    }
  };

  return (
    <TouchableOpacity
      style={styles.goalCard}
      onPress={handleIncrement}
      onLongPress={() => {
        Alert.alert(
          goal.title,
          'What would you like to do?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Reset Progress',
              onPress: () => onUpdate(0),
            },
            {
              text: 'Delete Goal',
              style: 'destructive',
              onPress: onDelete,
            },
          ]
        );
      }}
      activeOpacity={0.8}
    >
      <View style={styles.goalHeader}>
        <View style={[styles.goalAccent, { backgroundColor: goal.color }]} />
        <View style={styles.goalInfo}>
          <Text style={styles.goalTitle}>{goal.title}</Text>
          <Text style={styles.goalProgress}>
            {goal.currentValue} / {goal.targetValue} {goal.unit}
          </Text>
        </View>
      </View>
      {/* Progress bar */}
      <View style={styles.goalProgressBar}>
        <Animated.View
          style={[
            styles.goalProgressFill,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              }),
              backgroundColor: goal.color,
            },
          ]}
        />
      </View>
      <Text style={styles.goalTapHint}>tap to add progress</Text>
    </TouchableOpacity>
  );
}

// Finished goal card
function FinishedGoalCard({ goal, onDelete }: { goal: FinishedGoal; onDelete: () => void }) {
  const completedDate = new Date(goal.completedAt).toLocaleDateString('ar-SA', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <TouchableOpacity
      style={styles.finishedGoalCard}
      onLongPress={() => {
        Alert.alert('إزالة الإنجاز', 'هل تريد إزالة هذا من إنجازاتك؟', [
          { text: 'إلغاء', style: 'cancel' },
          { text: 'إزالة', style: 'destructive', onPress: onDelete },
        ]);
      }}
      activeOpacity={0.9}
    >
      <View style={styles.finishedGoalBadge}>
        <Text style={styles.finishedGoalCheck}>✓</Text>
      </View>
      <View style={styles.finishedGoalInfo}>
        <Text style={styles.finishedGoalTitle}>{goal.title}</Text>
        <Text style={styles.finishedGoalMeta}>
          {goal.targetValue} {goal.unit} · {goal.daysToComplete} {goal.daysToComplete === 1 ? 'يوم' : 'أيام'}
        </Text>
      </View>
      <Text style={styles.finishedGoalDate}>{completedDate}</Text>
    </TouchableOpacity>
  );
}

// Week streak view
function WeekStreak() {
  const { getWeeklyProgress, currentStreak } = useGoalsStore();
  const weekProgress = getWeeklyProgress();
  const days = ['ن', 'ث', 'ر', 'خ', 'ج', 'س', 'ح'];

  return (
    <View style={styles.weekContainer}>
      <View style={styles.weekHeader}>
        <Text style={styles.weekTitle}>هذا الأسبوع</Text>
        <View style={styles.streakBadge}>
          <Text style={styles.streakNumber}>{currentStreak}</Text>
          <Text style={styles.streakLabel}>يوم متتالي</Text>
        </View>
      </View>
      <View style={styles.weekDays}>
        {weekProgress.map((day, index) => {
          const isToday = index === 6;
          const hasActivity = day.completedTodos > 0;
          const intensity = day.totalTodos > 0 ? day.completedTodos / day.totalTodos : 0;

          return (
            <View key={day.date} style={styles.dayColumn}>
              <View
                style={[
                  styles.dayDot,
                  hasActivity && styles.dayDotActive,
                  hasActivity && {
                    opacity: 0.4 + intensity * 0.6,
                  },
                  isToday && styles.dayDotToday,
                ]}
              />
              <Text style={[styles.dayLabel, isToday && styles.dayLabelToday]}>
                {days[index]}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

// Add goal modal
function AddGoalSection({ onAdd }: { onAdd: (title: string, target: number, unit: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('');
  const [unit, setUnit] = useState('مرات');
  const heightAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(heightAnim, {
      toValue: expanded ? 1 : 0,
      useNativeDriver: false,
      tension: 50,
      friction: 10,
    }).start();
  }, [expanded]);

  const handleAdd = () => {
    if (title.trim() && parseInt(target) > 0) {
      onAdd(title.trim(), parseInt(target), unit);
      setTitle('');
      setTarget('');
      setExpanded(false);
    }
  };

  return (
    <View style={styles.addSection}>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <Text style={styles.addButtonText}>
          {expanded ? 'إلغاء' : 'هدف جديد'}
        </Text>
      </TouchableOpacity>

      <Animated.View
        style={[
          styles.addForm,
          {
            maxHeight: heightAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 200],
            }),
            opacity: heightAnim,
          },
        ]}
      >
        <TextInput
          style={styles.input}
          placeholder="عنوان الهدف..."
          placeholderTextColor="#c4b8ab"
          value={title}
          onChangeText={setTitle}
        />
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, styles.inputSmall]}
            placeholder="الهدف"
            placeholderTextColor="#c4b8ab"
            keyboardType="numeric"
            value={target}
            onChangeText={setTarget}
          />
          <TextInput
            style={[styles.input, styles.inputSmall]}
            placeholder="الوحدة"
            placeholderTextColor="#c4b8ab"
            value={unit}
            onChangeText={setUnit}
          />
        </View>
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleAdd}
          activeOpacity={0.7}
        >
          <Text style={styles.submitButtonText}>إضافة هدف</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

// Add todo section
function AddTodoSection({ onAdd }: { onAdd: (text: string, priority: Todo['priority']) => void }) {
  const [text, setText] = useState('');
  const [priority, setPriority] = useState<Todo['priority']>('medium');

  const handleAdd = () => {
    if (text.trim()) {
      onAdd(text.trim(), priority);
      setText('');
    }
  };

  return (
    <View style={styles.addTodoSection}>
      <View style={styles.todoInputRow}>
        <TextInput
          style={styles.todoInput}
          placeholder="What needs to be done?"
          placeholderTextColor="#c4b8ab"
          value={text}
          onChangeText={setText}
          onSubmitEditing={handleAdd}
          returnKeyType="done"
        />
        <TouchableOpacity
          style={[styles.addTodoButton, !text.trim() && styles.addTodoButtonDisabled]}
          onPress={handleAdd}
          activeOpacity={0.7}
          disabled={!text.trim()}
        >
          <Text style={styles.addTodoButtonText}>Add</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.priorityRow}>
        {(['low', 'medium', 'high'] as const).map((p) => (
          <TouchableOpacity
            key={p}
            style={[
              styles.priorityButton,
              priority === p && styles.priorityButtonActive,
            ]}
            onPress={() => setPriority(p)}
          >
            <Text
              style={[
                styles.priorityButtonText,
                priority === p && styles.priorityButtonTextActive,
              ]}
            >
              {p === 'high' ? 'urgent' : p}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// Stats summary
function StatsSummary() {
  const { getTotalCompleted, getCompletionRate, totalGoalsCompleted } = useGoalsStore();

  return (
    <View style={styles.statsContainer}>
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{getTotalCompleted()}</Text>
        <Text style={styles.statLabel}>tasks done</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{totalGoalsCompleted}</Text>
        <Text style={styles.statLabel}>goals achieved</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{getCompletionRate()}%</Text>
        <Text style={styles.statLabel}>success rate</Text>
      </View>
    </View>
  );
}

export default function FocusScreen() {
  const {
    goals,
    finishedGoals,
    todos,
    addGoal,
    updateGoalProgress,
    deleteGoal,
    completeGoal,
    deleteFinishedGoal,
    addTodo,
    toggleTodo,
    deleteTodo,
    clearCompletedTodos,
  } = useGoalsStore();

  const [celebrationVisible, setCelebrationVisible] = useState(false);
  const [celebratingGoal, setCelebratingGoal] = useState<string>('');

  const activeTodos = todos.filter((t) => !t.completed);
  const completedTodos = todos.filter((t) => t.completed);

  const handleGoalComplete = (goal: Goal) => {
    setCelebratingGoal(goal.title);
    setCelebrationVisible(true);
  };

  const handleCelebrationClose = () => {
    setCelebrationVisible(false);
    // Move goal to finished after celebration
    const goal = goals.find((g) => g.title === celebratingGoal);
    if (goal) {
      completeGoal(goal.id);
    }
  };

  return (
    <View style={styles.container}>
      <CelebrationModal
        visible={celebrationVisible}
        goalTitle={celebratingGoal}
        onClose={handleCelebrationClose}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Week Streak */}
        <WeekStreak />

        {/* Stats */}
        <StatsSummary />

        {/* Goals Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Goals</Text>
          {goals.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                Set meaningful goals to track your progress
              </Text>
            </View>
          ) : (
            goals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onUpdate={(value) => updateGoalProgress(goal.id, value)}
                onDelete={() => deleteGoal(goal.id)}
                onComplete={() => handleGoalComplete(goal)}
              />
            ))
          )}
          <AddGoalSection
            onAdd={(title, target, unit) =>
              addGoal({
                title,
                targetValue: target,
                unit,
                category: 'custom',
                color: '#5a9470',
              })
            }
          />
        </View>

        {/* Finished Goals Section */}
        {finishedGoals.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Achievements</Text>
              <Text style={styles.achievementCount}>{finishedGoals.length}</Text>
            </View>
            {finishedGoals.slice(0, 5).map((goal) => (
              <FinishedGoalCard
                key={goal.id}
                goal={goal}
                onDelete={() => deleteFinishedGoal(goal.id)}
              />
            ))}
            {finishedGoals.length > 5 && (
              <Text style={styles.moreAchievements}>
                +{finishedGoals.length - 5} more achievements
              </Text>
            )}
          </View>
        )}

        {/* Todos Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today</Text>
            {completedTodos.length > 0 && (
              <TouchableOpacity onPress={clearCompletedTodos}>
                <Text style={styles.clearButton}>clear done</Text>
              </TouchableOpacity>
            )}
          </View>

          <AddTodoSection onAdd={addTodo} />

          {activeTodos.length === 0 && completedTodos.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                Add tasks to stay focused and productive
              </Text>
            </View>
          ) : (
            <>
              {activeTodos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onToggle={() => toggleTodo(todo.id)}
                  onDelete={() => deleteTodo(todo.id)}
                />
              ))}
              {completedTodos.length > 0 && (
                <View style={styles.completedSection}>
                  <Text style={styles.completedLabel}>
                    {completedTodos.length} completed
                  </Text>
                  {completedTodos.slice(0, 3).map((todo) => (
                    <TodoItem
                      key={todo.id}
                      todo={todo}
                      onToggle={() => toggleTodo(todo.id)}
                      onDelete={() => deleteTodo(todo.id)}
                    />
                  ))}
                </View>
              )}
            </>
          )}
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>
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
  },

  // Celebration Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(45, 58, 46, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  celebrationCard: {
    backgroundColor: '#fefdfb',
    borderRadius: 28,
    padding: 40,
    width: width - 60,
    alignItems: 'center',
    overflow: 'hidden',
  },
  decorCircle1: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#dcedde',
    opacity: 0.5,
  },
  decorCircle2: {
    position: 'absolute',
    bottom: -20,
    left: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f5ebe0',
    opacity: 0.6,
  },
  decorCircle3: {
    position: 'absolute',
    top: 60,
    left: -40,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#dcedde',
    opacity: 0.3,
  },
  successBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#5a9470',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#5a9470',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  successCheck: {
    fontSize: 36,
    color: '#fff',
    fontWeight: '300',
  },
  celebrationTitle: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 32,
    color: '#2d3a2e',
    marginBottom: 8,
  },
  celebrationGoal: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 16,
    color: '#5a9470',
    marginBottom: 12,
    textAlign: 'center',
  },
  celebrationSubtitle: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    color: '#a69889',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
    paddingHorizontal: 10,
  },
  continueButton: {
    backgroundColor: '#5a9470',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 14,
  },
  continueButtonText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 16,
    color: '#fff',
  },

  // Week streak
  weekContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#2d3a2e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  weekTitle: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 18,
    color: '#2d3a2e',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  streakNumber: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 28,
    color: '#5a9470',
    marginRight: 6,
  },
  streakLabel: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: '#a69889',
  },
  weekDays: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayColumn: {
    alignItems: 'center',
  },
  dayDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f5ebe0',
    marginBottom: 8,
  },
  dayDotActive: {
    backgroundColor: '#5a9470',
  },
  dayDotToday: {
    borderWidth: 2,
    borderColor: '#5a9470',
  },
  dayLabel: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 12,
    color: '#c4b8ab',
  },
  dayLabelToday: {
    color: '#5a9470',
  },

  // Stats
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#2d3a2e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 24,
    color: '#2d3a2e',
  },
  statLabel: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: '#a69889',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#f0ebe4',
    marginVertical: 4,
  },

  // Sections
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 22,
    color: '#2d3a2e',
    marginBottom: 16,
  },
  clearButton: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 13,
    color: '#a69889',
  },
  achievementCount: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 14,
    color: '#5a9470',
    backgroundColor: '#dcedde',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },

  // Empty state
  emptyState: {
    backgroundColor: '#faf7f2',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  emptyStateText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: '#a69889',
    textAlign: 'center',
  },

  // Goal cards
  goalCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 18,
    marginBottom: 12,
    shadowColor: '#2d3a2e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  goalAccent: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 14,
  },
  goalInfo: {
    flex: 1,
  },
  goalTitle: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 16,
    color: '#2d3a2e',
  },
  goalProgress: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: '#a69889',
    marginTop: 2,
  },
  goalProgressBar: {
    height: 6,
    backgroundColor: '#f0ebe4',
    borderRadius: 3,
    overflow: 'hidden',
  },
  goalProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  goalTapHint: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
    color: '#c4b8ab',
    textAlign: 'center',
    marginTop: 10,
  },

  // Finished goals
  finishedGoalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8faf8',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#dcedde',
  },
  finishedGoalBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#5a9470',
    justifyContent: 'center',
    alignItems: 'center',
  },
  finishedGoalCheck: {
    fontSize: 16,
    color: '#fff',
  },
  finishedGoalInfo: {
    flex: 1,
    marginLeft: 12,
  },
  finishedGoalTitle: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 15,
    color: '#2d3a2e',
  },
  finishedGoalMeta: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: '#a69889',
    marginTop: 2,
  },
  finishedGoalDate: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 12,
    color: '#5a9470',
  },
  moreAchievements: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: '#a69889',
    textAlign: 'center',
    marginTop: 8,
  },

  // Todo items
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#2d3a2e',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxFill: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  todoContent: {
    flex: 1,
    marginLeft: 14,
  },
  todoText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 15,
    color: '#2d3a2e',
  },
  todoTextCompleted: {
    color: '#c4b8ab',
    textDecorationLine: 'line-through',
  },
  todoPriority: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
    color: '#c4b8ab',
    marginTop: 2,
  },

  // Completed section
  completedSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0ebe4',
  },
  completedLabel: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 12,
    color: '#c4b8ab',
    marginBottom: 12,
  },

  // Add sections
  addSection: {
    marginTop: 8,
  },
  addButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: '#f5ebe0',
    borderRadius: 12,
    alignItems: 'center',
  },
  addButtonText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 14,
    color: '#5a9470',
  },
  addForm: {
    overflow: 'hidden',
    marginTop: 12,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    color: '#2d3a2e',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#f0ebe4',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  inputSmall: {
    flex: 1,
  },
  submitButton: {
    backgroundColor: '#5a9470',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  submitButtonText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 14,
    color: '#fff',
  },

  // Add todo
  addTodoSection: {
    marginBottom: 16,
  },
  todoInputRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  todoInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    color: '#2d3a2e',
    borderWidth: 1,
    borderColor: '#f0ebe4',
  },
  addTodoButton: {
    backgroundColor: '#5a9470',
    borderRadius: 12,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addTodoButtonDisabled: {
    backgroundColor: '#c4b8ab',
  },
  addTodoButtonText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 14,
    color: '#fff',
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#f5ebe0',
    borderRadius: 8,
    alignItems: 'center',
  },
  priorityButtonActive: {
    backgroundColor: '#5a9470',
  },
  priorityButtonText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 12,
    color: '#a69889',
  },
  priorityButtonTextActive: {
    color: '#fff',
  },
});

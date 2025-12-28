import { View, Text, TouchableOpacity, ScrollView, Linking, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface Resource {
  name: string;
  description: string;
  phone?: string;
  text?: string;
  website?: string;
  available: string;
}

const CRISIS_RESOURCES: Resource[] = [
  {
    name: '988 Suicide & Crisis Lifeline',
    description: 'Free, confidential support for people in distress',
    phone: '988',
    text: '988',
    website: 'https://988lifeline.org',
    available: '24/7',
  },
  {
    name: 'Crisis Text Line',
    description: 'Text HOME to connect with a crisis counselor',
    text: '741741',
    website: 'https://crisistextline.org',
    available: '24/7',
  },
  {
    name: 'SAMHSA National Helpline',
    description: 'Treatment referral and information service',
    phone: '1-800-662-4357',
    website: 'https://samhsa.gov/find-help/national-helpline',
    available: '24/7',
  },
  {
    name: 'NAMI Helpline',
    description: 'Mental health support and resources',
    phone: '1-800-950-6264',
    text: '62640',
    website: 'https://nami.org/help',
    available: 'Mon-Fri, 10am-10pm ET',
  },
  {
    name: 'Veterans Crisis Line',
    description: 'Support for veterans and their families',
    phone: '988',
    text: '838255',
    website: 'https://veteranscrisisline.net',
    available: '24/7',
  },
];

const COPING_STRATEGIES = [
  'Take slow, deep breaths - breathe in for 4 counts, hold for 4, breathe out for 4',
  'Ground yourself: Name 5 things you can see, 4 you can touch, 3 you can hear',
  'Splash cold water on your face or hold an ice cube',
  'Call or text a trusted friend or family member',
  'Step outside and take a short walk',
  'Write down your thoughts without judgment',
];

function ResourceCard({ resource }: { resource: Resource }) {
  const handleCall = (phone: string) => {
    Alert.alert(
      'Call ' + resource.name,
      'This will open your phone app to call ' + phone,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: () => Linking.openURL(`tel:${phone}`) },
      ]
    );
  };

  const handleText = (number: string) => {
    const message = resource.name === 'Crisis Text Line' ? 'HOME' : '';
    Linking.openURL(`sms:${number}${message ? `&body=${message}` : ''}`);
  };

  const handleWebsite = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <View style={{
      backgroundColor: 'white',
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: '#f5ebe0',
    }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: '600', color: '#2d3a2e', fontSize: 16 }}>
            {resource.name}
          </Text>
          <Text style={{ color: '#5a5347', fontSize: 14, marginTop: 4 }}>
            {resource.description}
          </Text>
          <Text style={{ color: '#a69889', fontSize: 12, marginTop: 4 }}>
            {resource.available}
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
        {resource.phone && (
          <TouchableOpacity
            onPress={() => handleCall(resource.phone!)}
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#5a9470',
              borderRadius: 8,
              paddingVertical: 10,
              gap: 6,
            }}
          >
            <Ionicons name="call-outline" size={18} color="white" />
            <Text style={{ color: 'white', fontWeight: '500' }}>Call</Text>
          </TouchableOpacity>
        )}

        {resource.text && (
          <TouchableOpacity
            onPress={() => handleText(resource.text!)}
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#dcedde',
              borderRadius: 8,
              paddingVertical: 10,
              gap: 6,
            }}
          >
            <Ionicons name="chatbubble-outline" size={18} color="#3d654c" />
            <Text style={{ color: '#3d654c', fontWeight: '500' }}>Text</Text>
          </TouchableOpacity>
        )}

        {resource.website && (
          <TouchableOpacity
            onPress={() => handleWebsite(resource.website!)}
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f5ebe0',
              borderRadius: 8,
              paddingVertical: 10,
              gap: 6,
            }}
          >
            <Ionicons name="globe-outline" size={18} color="#5a5347" />
            <Text style={{ color: '#5a5347', fontWeight: '500' }}>Web</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

export default function CrisisScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fefdfb' }} edges={['top']}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f5ebe0' }}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
          <Ionicons name="arrow-back" size={24} color="#2d3a2e" />
        </TouchableOpacity>
        <Text style={{ flex: 1, fontFamily: 'DMSerifDisplay_400Regular', fontSize: 24, color: '#2d3a2e', marginLeft: 8 }}>
          Support Resources
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
        {/* Emergency Banner */}
        <View style={{
          backgroundColor: '#ffebee',
          borderRadius: 12,
          padding: 16,
          marginBottom: 20,
          borderWidth: 1,
          borderColor: '#ffcdd2',
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Ionicons name="warning-outline" size={20} color="#c62828" />
            <Text style={{ fontWeight: '600', color: '#c62828', marginLeft: 8, fontSize: 16 }}>
              If you're in immediate danger
            </Text>
          </View>
          <Text style={{ color: '#5a5347', lineHeight: 20 }}>
            Call <Text style={{ fontWeight: '600' }}>911</Text> or go to your nearest emergency room. Your safety is the priority.
          </Text>
          <TouchableOpacity
            onPress={() => Linking.openURL('tel:911')}
            style={{
              backgroundColor: '#c62828',
              borderRadius: 8,
              paddingVertical: 12,
              marginTop: 12,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>
              Call 911
            </Text>
          </TouchableOpacity>
        </View>

        {/* Coping Strategies */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontWeight: '600', color: '#2d3a2e', fontSize: 18, marginBottom: 12 }}>
            Right now, try this:
          </Text>
          <View style={{
            backgroundColor: '#fff8f0',
            borderRadius: 12,
            padding: 16,
            borderWidth: 1,
            borderColor: '#f5ebe0',
          }}>
            {COPING_STRATEGIES.slice(0, 3).map((strategy, index) => (
              <View key={index} style={{ flexDirection: 'row', marginBottom: index < 2 ? 12 : 0 }}>
                <Text style={{ color: '#c97d52', fontWeight: '600', marginRight: 8 }}>{index + 1}.</Text>
                <Text style={{ color: '#5a5347', flex: 1, lineHeight: 20 }}>{strategy}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Helpful Resources */}
        <Text style={{ fontWeight: '600', color: '#2d3a2e', fontSize: 18, marginBottom: 12 }}>
          Helpful Resources
        </Text>
        <Text style={{ color: '#a69889', marginBottom: 16 }}>
          Free, confidential support from trained professionals
        </Text>

        {CRISIS_RESOURCES.map((resource) => (
          <ResourceCard key={resource.name} resource={resource} />
        ))}

        {/* Disclaimer */}
        <View style={{
          backgroundColor: '#f5f5f5',
          borderRadius: 12,
          padding: 16,
          marginTop: 8,
          marginBottom: 32,
        }}>
          <Text style={{ color: '#757575', fontSize: 12, lineHeight: 18 }}>
            Matcha is a wellness companion for self-reflection, not a substitute for professional care. The resources listed above are provided by independent organizations. Please reach out to them directly if you need support.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

import { useSignIn, useOAuth } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState<'google' | 'facebook' | null>(null);
  const [error, setError] = useState('');

  const { startOAuthFlow: startGoogleOAuth } = useOAuth({ strategy: 'oauth_google' });
  const { startOAuthFlow: startFacebookOAuth } = useOAuth({ strategy: 'oauth_facebook' });

  const handleOAuth = useCallback(async (provider: 'google' | 'facebook') => {
    try {
      setIsOAuthLoading(provider);
      setError('');
      const startOAuth = provider === 'google' ? startGoogleOAuth : startFacebookOAuth;
      const { createdSessionId, setActive: setOAuthActive } = await startOAuth({
        redirectUrl: Linking.createURL('/(tabs)', { scheme: 'matcha' }),
      });
      if (createdSessionId && setOAuthActive) {
        await setOAuthActive({ session: createdSessionId });
        router.replace('/(tabs)');
      }
    } catch (err: any) {
      console.error('OAuth error:', err);
      setError(err.errors?.[0]?.message || 'Failed to sign in with ' + provider);
    } finally {
      setIsOAuthLoading(null);
    }
  }, [startGoogleOAuth, startFacebookOAuth, router]);

  const handleSignIn = async () => {
    if (!isLoaded) return;
    setIsLoading(true);
    setError('');
    try {
      const result = await signIn.create({ identifier: email, password });
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.replace('/(tabs)');
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fefdfb' }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 48, paddingBottom: 32 }}>
            <View style={{ alignItems: 'center', marginBottom: 48 }}>
              <Text style={{ fontFamily: 'DMSerifDisplay_400Regular', fontSize: 36, color: '#5a9470' }}>Matcha</Text>
              <Text style={{ color: '#a69889', marginTop: 8 }}>AI at the service of your mind</Text>
            </View>
            <View>
              <Text style={{ fontFamily: 'DMSans_700Bold', fontSize: 24, color: '#2d3a2e', marginBottom: 24 }}>Welcome back</Text>
              {error ? (<View style={{ backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca', borderRadius: 12, padding: 16, marginBottom: 16 }}><Text style={{ color: '#dc2626' }}>{error}</Text></View>) : null}
              <View style={{ marginBottom: 24 }}>
                <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white', borderWidth: 1, borderColor: '#e5ddd5', borderRadius: 12, paddingVertical: 14, marginBottom: 12 }} onPress={() => handleOAuth('google')} disabled={isOAuthLoading !== null}>
                  {isOAuthLoading === 'google' ? <ActivityIndicator color="#5a9470" /> : (<><Text style={{ fontSize: 18, marginRight: 12, fontWeight: 'bold', color: '#4285F4' }}>G</Text><Text style={{ color: '#2d3a2e', fontFamily: 'DMSans_500Medium', fontSize: 16 }}>Continue with Google</Text></>)}
                </TouchableOpacity>
                <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1877F2', borderRadius: 12, paddingVertical: 14 }} onPress={() => handleOAuth('facebook')} disabled={isOAuthLoading !== null}>
                  {isOAuthLoading === 'facebook' ? <ActivityIndicator color="white" /> : (<><Text style={{ fontSize: 18, color: 'white', marginRight: 12, fontWeight: 'bold' }}>f</Text><Text style={{ color: 'white', fontFamily: 'DMSans_500Medium', fontSize: 16 }}>Continue with Facebook</Text></>)}
                </TouchableOpacity>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
                <View style={{ flex: 1, height: 1, backgroundColor: '#e5ddd5' }} />
                <Text style={{ marginHorizontal: 16, color: '#a69889' }}>or</Text>
                <View style={{ flex: 1, height: 1, backgroundColor: '#e5ddd5' }} />
              </View>
              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: '#6b5c4c', marginBottom: 8, fontFamily: 'DMSans_500Medium' }}>Email</Text>
                <TextInput style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#e5ddd5', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, color: '#2d3a2e', fontSize: 16 }} placeholder="your@email.com" placeholderTextColor="#a69889" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
              </View>
              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: '#6b5c4c', marginBottom: 8, fontFamily: 'DMSans_500Medium' }}>Password</Text>
                <TextInput style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#e5ddd5', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, color: '#2d3a2e', fontSize: 16 }} placeholder="Enter your password" placeholderTextColor="#a69889" value={password} onChangeText={setPassword} secureTextEntry autoComplete="password" />
              </View>
              <TouchableOpacity style={{ backgroundColor: '#5a9470', borderRadius: 12, paddingVertical: 16, marginTop: 8, opacity: isLoading ? 0.7 : 1 }} onPress={handleSignIn} disabled={isLoading}>
                {isLoading ? <ActivityIndicator color="white" /> : <Text style={{ color: 'white', textAlign: 'center', fontFamily: 'DMSans_700Bold', fontSize: 18 }}>Sign In</Text>}
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 32 }}>
              <Text style={{ color: '#a69889' }}>No account yet? </Text>
              <Link href="/(auth)/signup" asChild><TouchableOpacity><Text style={{ color: '#5a9470', fontFamily: 'DMSans_700Bold' }}>Sign Up</Text></TouchableOpacity></Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

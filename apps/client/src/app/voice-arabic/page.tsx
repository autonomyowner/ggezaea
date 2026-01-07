'use client';

import { useState } from 'react';
import { VocodeChatArabic } from '@/components/VocodeChatArabic';
import { useLanguage } from '@/components/LanguageProvider';

export default function VoiceArabicPage() {
  const { language, t } = useLanguage();
  const [sessionTranscript, setSessionTranscript] = useState<Array<{ role: 'USER' | 'ASSISTANT'; content: string }>>([]);

  return (
    <div className="min-h-screen" style={{ background: 'var(--cream-50)' }}>
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1
            className="text-4xl md:text-5xl mb-4"
            style={{
              fontFamily: 'var(--font-dm-serif), Georgia, serif',
              color: 'var(--text-primary)',
            }}
            dir={language === 'ar' ? 'rtl' : 'ltr'}
          >
            {language === 'ar' ? 'المحادثة الصوتية' : 'Voice Conversation'}
          </h1>
          <p
            className="text-lg max-w-2xl mx-auto"
            style={{ color: 'var(--text-secondary)' }}
            dir={language === 'ar' ? 'rtl' : 'ltr'}
          >
            {language === 'ar'
              ? 'تحدث مع WA3i بصوتك. مدعوم بالذكاء الاصطناعي للصحة النفسية باللغة العربية.'
              : 'Talk to WA3i with your voice. Powered by AI for mental health support in Arabic.'}
          </p>
        </div>

        {/* Main Voice Interface */}
        <div
          className="rounded-3xl p-8 md:p-12 text-center"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-soft)',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <div className="mb-8">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm"
              style={{
                background: 'var(--matcha-100)',
                color: 'var(--matcha-700)',
              }}
            >
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              {language === 'ar' ? 'جاهز للمحادثة' : 'Ready to chat'}
            </div>
          </div>

          {/* Voice Chat Component */}
          <div className="flex justify-center mb-8">
            <VocodeChatArabic
              onTranscript={setSessionTranscript}
              onSessionEnd={() => {
                console.log('Session ended. Transcript:', sessionTranscript);
              }}
            />
          </div>

          <p
            className="text-sm"
            style={{ color: 'var(--text-muted)' }}
            dir={language === 'ar' ? 'rtl' : 'ltr'}
          >
            {language === 'ar'
              ? 'انقر على زر الميكروفون لبدء المحادثة'
              : 'Click the microphone button to start a conversation'}
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          {[
            {
              icon: '🎤',
              titleAr: 'تحدث بصوتك',
              titleEn: 'Speak Naturally',
              descAr: 'تحدث بالعربية أو الإنجليزية بشكل طبيعي',
              descEn: 'Talk in Arabic or English naturally',
            },
            {
              icon: '🧠',
              titleAr: 'تحليل ذكي',
              titleEn: 'Smart Analysis',
              descAr: 'يفهم أنماط تفكيرك ويقدم رؤى مخصصة',
              descEn: 'Understands your thought patterns and provides insights',
            },
            {
              icon: '💚',
              titleAr: 'دعم مستمر',
              titleEn: 'Continuous Support',
              descAr: 'متاح على مدار الساعة لدعم صحتك النفسية',
              descEn: 'Available 24/7 for your mental health support',
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="rounded-2xl p-6"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-soft)',
              }}
              dir={language === 'ar' ? 'rtl' : 'ltr'}
            >
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h3
                className="text-lg font-semibold mb-2"
                style={{ color: 'var(--text-primary)' }}
              >
                {language === 'ar' ? feature.titleAr : feature.titleEn}
              </h3>
              <p
                className="text-sm"
                style={{ color: 'var(--text-secondary)' }}
              >
                {language === 'ar' ? feature.descAr : feature.descEn}
              </p>
            </div>
          ))}
        </div>

        {/* Instructions */}
        <div
          className="mt-12 rounded-2xl p-6"
          style={{
            background: 'var(--matcha-50)',
            border: '1px solid var(--matcha-200)',
          }}
          dir={language === 'ar' ? 'rtl' : 'ltr'}
        >
          <h3
            className="text-lg font-semibold mb-4"
            style={{ color: 'var(--matcha-800)' }}
          >
            {language === 'ar' ? 'كيفية الاستخدام' : 'How to Use'}
          </h3>
          <ol
            className="space-y-2 text-sm"
            style={{ color: 'var(--matcha-700)' }}
          >
            {language === 'ar' ? (
              <>
                <li>1. انقر على زر الميكروفون لبدء الجلسة</li>
                <li>2. اسمح للمتصفح بالوصول للميكروفون</li>
                <li>3. انقر على الدائرة الخضراء للتحدث</li>
                <li>4. انتظر رد WA3i الصوتي</li>
                <li>5. يمكنك أيضاً الكتابة في حقل النص</li>
                <li>6. انقر "إنهاء المحادثة" عند الانتهاء</li>
              </>
            ) : (
              <>
                <li>1. Click the microphone button to start a session</li>
                <li>2. Allow browser access to your microphone</li>
                <li>3. Click the green circle to speak</li>
                <li>4. Wait for WA3i's voice response</li>
                <li>5. You can also type in the text field</li>
                <li>6. Click "End Conversation" when done</li>
              </>
            )}
          </ol>
        </div>
      </div>
    </div>
  );
}

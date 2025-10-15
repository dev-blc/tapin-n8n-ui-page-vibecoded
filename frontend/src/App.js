// This is a demo version that uses mock data for testing the results UI
// To use this, replace App.js with this file temporarily

import React, { useState } from 'react';
import { Download, Sparkles } from 'lucide-react';
import { toPng } from 'html-to-image';
import './App.css';

// Mock response for testing
const MOCK_RESPONSE = [
  {
    "affirmation": {
      "tool_type": "affirmation",
      "tool_text": "I am worthy even when things do not go my way. I trust myself to find grounding in every moment. I give myself permission to rest and regain strength.",
      "metadata": {
        "tags": ["worthiness", "grounding", "permission-for-rest"],
        "start_phrase": "I am"
      }
    },
    "meditation": {
      "tool_type": "meditation",
      "tool_text": "Begin by settling into a comfortable position. Close your eyes gently if that feels safe for you. Take a deep breath in through your nose, feeling the breath fill your belly [pause]. Slowly exhale through your mouth, letting go of any tension [pause]. Continue this deep, natural breathing as you bring your focus to the sensations at your feet. Feel the ground beneath you supporting your weight [pause]. Notice the connection between your body and the earth, solid and steady. Imagine you are standing barefoot on soft, warm sand at the edge of a calm beach. Feel the gentle warmth of the sun on your skin and a soft breeze brushing past you [pause]. With each breath, visualize a gentle wave rolling in, brushing over your feet and then receding back into the sea. Notice how the water leaves the sand refreshed, safe, and steady. As you continue to breathe, feel a sense of worthiness growing inside you, like the sun melting any fear or doubt away [pause]. Let the rhythm of the waves and your steady breath ground you in this moment of calm power. When you are ready, slowly begin to bring awareness back to your physical body. Gently wiggle your fingers and toes [pause]. When you feel ready, open your eyes softly. Remember, you are worthy and deeply supported in this present moment.",
      "metadata": {
        "tags": ["grounding", "short-guided"],
        "duration_sec": 195
      }
    }
  }
];

function App() {
  const [showResults] = useState(true); // Always show results in demo
  const [response] = useState(MOCK_RESPONSE);

  const downloadCard = async (elementId, filename) => {
    const element = document.getElementById(elementId);
    if (element) {
      try {
        const dataUrl = await toPng(element, { quality: 0.95, pixelRatio: 2 });
        const link = document.createElement('a');
        link.download = filename;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error('Error downloading card:', err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-100 via-sage-50 to-cream-200 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-sage-600" />
            <h1 className="text-5xl font-serif font-bold text-sage-900">Your TapIn Results</h1>
          </div>
          <p className="text-sage-600 text-lg">Generated with care for your journey</p>
        </div>

        {/* Results Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {response[0]?.affirmation && (
            <div id="affirmation-card" className="bg-gradient-to-br from-sage-400 to-sage-600 rounded-3xl p-8 shadow-2xl text-white">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-serif font-bold">Affirmation</h2>
                <button
                  onClick={() => downloadCard('affirmation-card', 'affirmation.png')}
                  className="bg-white/20 hover:bg-white/30 p-3 rounded-full transition-all"
                >
                  <Download className="w-5 h-5" />
                </button>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-4">
                <p className="text-xl leading-relaxed font-light">{response[0].affirmation.tool_text}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {response[0].affirmation.metadata?.tags?.map((tag, idx) => (
                  <span key={idx} className="bg-white/20 px-3 py-1 rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {response[0]?.meditation && (
            <div id="meditation-card" className="bg-gradient-to-br from-sage-700 to-sage-900 rounded-3xl p-8 shadow-2xl text-white">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-serif font-bold">Meditation</h2>
                <button
                  onClick={() => downloadCard('meditation-card', 'meditation.png')}
                  className="bg-white/20 hover:bg-white/30 p-3 rounded-full transition-all"
                >
                  <Download className="w-5 h-5" />
                </button>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-4 max-h-96 overflow-y-auto">
                <p className="text-lg leading-relaxed font-light whitespace-pre-line">
                  {response[0].meditation.tool_text}
                </p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                {response[0].meditation.metadata?.duration_sec && (
                  <span className="bg-white/20 px-3 py-1 rounded-full">
                    {Math.floor(response[0].meditation.metadata.duration_sec / 60)} min
                  </span>
                )}
                <div className="flex flex-wrap gap-2">
                  {response[0].meditation.metadata?.tags?.map((tag, idx) => (
                    <span key={idx} className="bg-white/20 px-3 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

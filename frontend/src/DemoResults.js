import React from 'react';
import ResultsDisplay from './ResultsDisplay';

const mockResponse = [
  {
    "mimeType": "audio/mp3",
    "fileType": "audio",
    "fileExtension": "mp3",
    "fileName": "audio.mp3",
    "id": "filesystem-v2:workflows/AKqi4mYvohKhq2pC/executions/52/binary_data/d47d90c3-ce1e-4b57-b93f-3fb5b1ffbb62",
    "fileSize": "1.51 MB",
    "affirmation": {
      "tool_type": "affirmation",
      "tool_text": "I am validated and enough, no matter my pace. I trust my journey and give myself permission to rest when I need it. I release worry and embrace relief.",
      "metadata": {
        "source": "quick_shift",
        "tags": [
          "validation",
          "relief",
          "trust"
        ],
        "start_phrase": "I am",
        "duration_sec": null,
        "escalation_flag": false
      }
    },
    "meditation": {
      "tool_type": "meditation",
      "tool_text": "Find a comfortable seat and gently close your eyes if it feels safe. Begin by bringing your attention to your breath. Take a deep inhalation, filling your lungs fully, and then exhale slowly and completely. Repeat this breathing pattern three more times, letting your body settle deeper with each breath. [pause] Now bring your focus to the sensations in your body. Notice the weight of your body where it connects with the surface beneath you. Feel the support holding you up, steady and strong. Allow yourself to feel grounded in this moment. [pause] Imagine a calm river flowing gently near you. See its clear water moving smoothly, carrying any feelings of worry away from you. The river flows with ease and confidence, just like your own path. Breathe in the sense of relief that comes as you watch the water move. [pause] Feel how this relief softens your tired body. Let your shoulders relax and your jaw unclench. With each breath, you feel lighter and more validated. Your pace is yours, and that is enough. [pause] When you are ready, begin to bring your attention back to your breath. Notice its rhythm once again. Slowly open your eyes if closed, and carry the feeling of calm with you. Remember, you are validated and safe.",
      "metadata": {
        "source": "quick_shift",
        "tags": [
          "grounding",
          "short-guided"
        ],
        "duration_sec": 190,
        "tts_ready": true,
        "escalation_flag": false,
        "safe_response_template": null
      }
    }
  }
];

function DemoResults() {
  const handleReset = () => {
    console.log('Reset clicked');
  };

  return <ResultsDisplay response={mockResponse} onReset={handleReset} />;
}

export default DemoResults;

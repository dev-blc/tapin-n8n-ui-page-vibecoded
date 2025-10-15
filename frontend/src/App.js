import React, { useState } from 'react';
import { Download, Sparkles, ChevronRight, ChevronLeft, TestTube, Zap } from 'lucide-react';
import { toPng } from 'html-to-image';
import axios from 'axios';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

function App() {
  const [environment, setEnvironment] = useState('test');
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Form configuration based on n8n form
  const formSteps = [
    {
      id: 'dbUser',
      title: 'Select DB User',
      type: 'card-select',
      options: [
        { value: '1/Kumararaja (DeservingOne)', label: 'Kumararaja', subtitle: 'The Deserving One' },
        { value: '2/Smith (CapableOne)', label: 'Smith', subtitle: 'The Capable One' },
        { value: '3/Ezhil (MagneticOne)', label: 'Ezhil', subtitle: 'The Magnetic One' },
        { value: '4/Aparna (GroundedOne)', label: 'Aparna', subtitle: 'The Grounded One' },
        { value: '5/Sneha (ExpressedOne)', label: 'Sneha', subtitle: 'The Expressed One' },
        { value: '6/Shifa (SoftOne)', label: 'Shifa', subtitle: 'The Soft One' },
        { value: '7/Mugizh (IntuitiveOne)', label: 'Mugizh', subtitle: 'The Intuitive One' },
        { value: '8/Oliver (LiberatedOne)', label: 'Oliver', subtitle: 'The Liberated One' },
        { value: '9/Shilpa (PowerfulOne)', label: 'Shilpa', subtitle: 'The Powerful One' },
        { value: '10/Ruthra (SurrenderedOne)', label: 'Ruthra', subtitle: 'The Surrendered One' },
      ]
    },
    {
      id: 'loop',
      title: 'What loop are you stuck in right now?',
      type: 'card-select',
      options: [
        { value: 'Too Much on My Plate', label: 'Too Much on My Plate' },
        { value: "That Conversation Didn't Go Well", label: "That Conversation Didn't Go Well" },
        { value: "Can't Stop Overthinking", label: "Can't Stop Overthinking" },
        { value: 'Being Hard on Myself', label: 'Being Hard on Myself' },
        { value: "Worried I'm Falling Behind", label: "Worried I'm Falling Behind" },
        { value: 'Worried What People Think', label: 'Worried What People Think' },
        { value: 'I Feel Stuck or Disconnected', label: 'I Feel Stuck or Disconnected' },
        { value: "It Didn't Go My Way", label: "It Didn't Go My Way" },
        { value: "I'm Over It", label: "I'm Over It" },
        { value: 'I Just Feel Off', label: 'I Just Feel Off' },
      ]
    },
    {
      id: 'feeling',
      title: 'What are you feeling right now?',
      type: 'card-select',
      options: [
        { value: 'Anxious — (too much / overthinking / people-judgment / just off)', label: 'Anxious' },
        { value: 'Overwhelmed', label: 'Overwhelmed' },
        { value: 'Ashamed', label: 'Ashamed' },
        { value: 'Exhausted', label: 'Exhausted' },
        { value: 'Insecure', label: 'Insecure' },
        { value: 'Pressured', label: 'Pressured' },
        { value: 'Regretful', label: 'Regretful' },
        { value: 'Guilty', label: 'Guilty' },
        { value: 'Embarrassed', label: 'Embarrassed' },
        { value: 'Misunderstood', label: 'Misunderstood' },
        { value: 'Unworthy', label: 'Unworthy' },
        { value: 'Fearful', label: 'Fearful' },
        { value: 'Restless', label: 'Restless' },
        { value: 'Defeated', label: 'Defeated' },
        { value: 'Rejected', label: 'Rejected' },
        { value: 'Hopeless', label: 'Hopeless' },
        { value: 'Lost', label: 'Lost' },
        { value: 'Weak', label: 'Weak' },
        { value: 'Unmotivated', label: 'Unmotivated' },
        { value: 'Empty', label: 'Empty' },
        { value: 'Invisible', label: 'Invisible' },
        { value: 'Resentful', label: 'Resentful' },
        { value: 'Unappreciated', label: 'Unappreciated' },
        { value: 'Burdened', label: 'Burdened' },
        { value: 'Disconnected', label: 'Disconnected' },
        { value: 'Unsafe', label: 'Unsafe' },
        { value: 'Other (describe)', label: 'Other' },
      ]
    },
    {
      id: 'wantedFeeling',
      title: 'This part showed up because it wanted you to feel…',
      type: 'card-select',
      options: [
        { value: 'Heard', label: 'Heard' },
        { value: 'Seen', label: 'Seen' },
        { value: 'Worthy', label: 'Worthy' },
        { value: 'Important', label: 'Important' },
        { value: 'Enough', label: 'Enough' },
        { value: 'Validated', label: 'Validated' },
        { value: 'Loved', label: 'Loved' },
        { value: 'Safe', label: 'Safe' },
      ]
    },
    {
      id: 'protector',
      title: 'Which protector is showing up?',
      type: 'card-select',
      options: [
        { value: 'The Inner Critic', label: 'The Inner Critic' },
        { value: 'The Overachiever', label: 'The Overachiever' },
        { value: 'The Perfectionist', label: 'The Perfectionist' },
        { value: 'The Planner', label: 'The Planner' },
        { value: 'The Controller', label: 'The Controller' },
        { value: 'The Ghost', label: 'The Ghost' },
        { value: 'The Shapeshifter', label: 'The Shapeshifter' },
        { value: 'The Fixer', label: 'The Fixer' },
        { value: 'The Avoider', label: 'The Avoider' },
        { value: 'The Hustler', label: 'The Hustler' },
        { value: 'The Defender', label: 'The Defender' },
        { value: 'The Performer', label: 'The Performer' },
        { value: 'The Optimizer', label: 'The Optimizer' },
        { value: 'The Overly Loyal One', label: 'The Overly Loyal One' },
      ]
    },
    {
      id: 'toolChoice',
      title: 'Create an affirmation or meditation?',
      type: 'card-select',
      options: [
        { value: 'Affirmation', label: 'Affirmation', subtitle: 'Empowering words' },
        { value: 'Meditation', label: 'Meditation', subtitle: 'Guided practice' },
        { value: 'Not now / Skip', label: 'Skip', subtitle: 'Maybe later' },
      ]
    },
  ];

  const handleCardSelect = (value) => {
    const currentStepConfig = formSteps[currentStep];
    setFormData({ ...formData, [currentStepConfig.id]: value });
    
    // Auto-advance to next step after selection
    setTimeout(() => {
      if (currentStep < formSteps.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    }, 300);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${BACKEND_URL}/api/tapin/submit`, {
        environment,
        formData
      });
      setResponse(res.data);
      setShowResults(true);
    } catch (error) {
      console.error('Error submitting form:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Unknown error occurred';
      
      if (error.response?.status === 404) {
        alert(`n8n Webhook Not Available:\n\n${errorMessage}\n\nNote: In test mode, you need to activate the webhook in n8n first by clicking "Execute workflow".`);
      } else {
        alert(`Error: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

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

  const resetForm = () => {
    setFormData({});
    setResponse(null);
    setShowResults(false);
    setCurrentStep(0);
  };

  if (showResults && response) {
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
                    data-testid="download-affirmation-btn"
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
                    data-testid="download-meditation-btn"
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

          {/* Actions */}
          <div className="flex justify-center gap-4">
            <button
              onClick={resetForm}
              className="btn-secondary"
              data-testid="create-another-btn"
            >
              Create Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-100 via-sage-50 to-cream-200 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-sage-900 rounded-full flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-cream-100" />
            </div>
            <h1 className="text-6xl font-serif font-bold text-sage-900">tap in</h1>
          </div>
          <p className="text-sage-600 text-lg">Admin Board - Create Affirmations & Meditations</p>
          
          {/* Environment Toggle */}
          <div className="mt-6 inline-flex items-center gap-2 bg-white rounded-full p-1 shadow-lg">
            <button
              onClick={() => setEnvironment('test')}
              className={`flex items-center gap-2 px-6 py-2 rounded-full transition-all ${
                environment === 'test' 
                  ? 'bg-sage-900 text-white' 
                  : 'text-sage-700 hover:bg-sage-50'
              }`}
              data-testid="test-env-btn"
            >
              <TestTube className="w-4 h-4" />
              Test
            </button>
            <button
              onClick={() => setEnvironment('production')}
              className={`flex items-center gap-2 px-6 py-2 rounded-full transition-all ${
                environment === 'production' 
                  ? 'bg-sage-900 text-white' 
                  : 'text-sage-700 hover:bg-sage-50'
              }`}
              data-testid="production-env-btn"
            >
              <Zap className="w-4 h-4" />
              Production
            </button>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-sage-600">Step {currentStep + 1} of {formSteps.length}</span>
            <span className="text-sm text-sage-600">{Math.round(((currentStep + 1) / formSteps.length) * 100)}%</span>
          </div>
          <div className="w-full h-2 bg-sage-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-sage-900 transition-all duration-500 ease-out"
              style={{ width: `${((currentStep + 1) / formSteps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Current Step */}
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 mb-6">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-sage-900 mb-8 text-center">
            {formSteps[currentStep].title}
          </h2>

          {/* Card Selection Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {formSteps[currentStep].options.map((option) => (
              <div
                key={option.value}
                onClick={() => handleCardSelect(option.value)}
                className={`card p-6 border-2 transition-all ${
                  formData[formSteps[currentStep].id] === option.value
                    ? 'card-selected border-sage-900'
                    : 'border-transparent hover:border-sage-300'
                }`}
                data-testid={`option-${option.value.replace(/\s+/g, '-').toLowerCase()}`}
              >
                <h3 className="text-lg font-semibold mb-1">{option.label}</h3>
                {option.subtitle && (
                  <p className={`text-sm ${
                    formData[formSteps[currentStep].id] === option.value
                      ? 'text-cream-200'
                      : 'text-sage-600'
                  }`}>
                    {option.subtitle}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-white shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="previous-btn"
          >
            <ChevronLeft className="w-5 h-5" />
            Previous
          </button>

          {currentStep === formSteps.length - 1 && formData[formSteps[currentStep].id] ? (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="btn-primary flex items-center gap-2"
              data-testid="tapin-submit-btn"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  Processing...
                </>
              ) : (
                <>
                  TapIn
                  <Sparkles className="w-5 h-5" />
                </>
              )}
            </button>
          ) : (
            <button
              onClick={() => setCurrentStep(Math.min(formSteps.length - 1, currentStep + 1))}
              disabled={!formData[formSteps[currentStep].id]}
              className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="next-btn"
            >
              Next
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

import React, { useState } from 'react';
import { Sparkles, ChevronRight, ChevronLeft, TestTube, Zap, SkipForward } from 'lucide-react';
import axios from 'axios';
import ResultsDisplay from './ResultsDisplay';
import './App.css';

// n8n webhook URLs - direct frontend calls (POC mode)
const N8N_WEBHOOKS = {
  test: process.env.REACT_APP_N8N_WEBHOOK_URL_TEST || 'https://dev-blc.app.n8n.cloud/webhook-test/tapintoaffirmations',
  production: process.env.REACT_APP_N8N_WEBHOOK_URL_PROD || 'https://dev-blc.app.n8n.cloud/webhook/tapintoaffirmations'
};

function App() {
  const [environment, setEnvironment] = useState('test');
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Complete form configuration matching n8n form node
  const getFormSteps = () => {
    const toolChoice = formData.toolChoice;
    
    const allSteps = [
      {
        id: 'dbUser',
        title: 'Select DB User',
        type: 'card-select',
        skippable: false,
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
        title: 'STEP 1: What loop are you stuck in right now?',
        type: 'card-select',
        skippable: true,
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
        title: 'STEP 2: What are you feeling right now?',
        type: 'card-select',
        skippable: true,
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
        title: 'STEP 3: This part showed up because it wanted you to feel…',
        type: 'card-select',
        skippable: false,
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
        title: 'STEP 3b: Which protector is showing up?',
        type: 'card-select',
        skippable: true,
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
        id: 'reframe',
        title: 'STEP 4: Tap In — Reframe example (edit or replace)',
        type: 'textarea',
        skippable: true,
        placeholder: 'Write your reframe here...'
      },
      {
        id: 'bodyShift',
        title: 'STEP 4: How does this shift feel in your body?',
        type: 'card-select',
        skippable: false,
        options: [
          { value: 'Lighter', label: 'Lighter' },
          { value: 'Still tense', label: 'Still tense' },
          { value: 'Softer', label: 'Softer' },
          { value: 'Teary', label: 'Teary' },
          { value: 'Relieved', label: 'Relieved' },
          { value: 'Other (describe)', label: 'Other' },
        ]
      },
      {
        id: 'bodyShiftOther',
        title: 'If \'Other\' — describe body shift',
        type: 'text',
        skippable: true,
        placeholder: 'Describe how it feels...',
        condition: () => formData.bodyShift === 'Other (describe)'
      },
      {
        id: 'toolChoice',
        title: 'STEP 5: Want to create an affirmation or meditation to anchor this shift?',
        type: 'card-select',
        skippable: false,
        options: [
          { value: 'Affirmation', label: 'Affirmation', subtitle: 'Empowering words' },
          { value: 'Meditation', label: 'Meditation', subtitle: 'Guided practice' },
          { value: 'Not now / Skip', label: 'Skip', subtitle: 'Maybe later' },
        ]
      },
      // Affirmation fields - only show if Affirmation is selected
      {
        id: 'affirmationEnergy',
        title: 'AFFIRMATION: What energy do you want your affirmation to embody?',
        type: 'card-select',
        skippable: true,
        condition: () => toolChoice === 'Affirmation',
        options: [
          { value: 'Empowering', label: 'Empowering' },
          { value: 'Calming', label: 'Calming' },
          { value: 'Grounding', label: 'Grounding' },
          { value: 'Uplifting', label: 'Uplifting' },
          { value: 'Healing', label: 'Healing' },
        ]
      },
      {
        id: 'affirmationImagery',
        title: 'AFFIRMATION: What imagery should your affirmation include?',
        type: 'card-select',
        skippable: true,
        condition: () => toolChoice === 'Affirmation',
        options: [
          { value: 'Inner Strength', label: 'Inner Strength' },
          { value: 'Nature', label: 'Nature' },
          { value: 'Light', label: 'Light' },
          { value: 'Water', label: 'Water' },
          { value: 'Growth', label: 'Growth' },
        ]
      },
      {
        id: 'affirmationStart',
        title: 'AFFIRMATION: How should your affirmation start?',
        type: 'card-select',
        skippable: true,
        condition: () => toolChoice === 'Affirmation',
        options: [
          { value: 'I am', label: 'I am' },
          { value: 'I embrace', label: 'I embrace' },
          { value: 'I trust', label: 'I trust' },
          { value: 'I choose', label: 'I choose' },
          { value: 'I create', label: 'I create' },
        ]
      },
      {
        id: 'affirmationDetails',
        title: 'AFFIRMATION: Additional details (optional)',
        type: 'textarea',
        skippable: true,
        condition: () => toolChoice === 'Affirmation',
        placeholder: 'Any specific themes or words you want included...'
      },
      // Meditation fields - only show if Meditation is selected
      {
        id: 'meditationFeeling',
        title: 'MEDITATION: What feeling would you like to cultivate?',
        type: 'card-select',
        skippable: true,
        condition: () => toolChoice === 'Meditation',
        options: [
          { value: 'Calm', label: 'Calm' },
          { value: 'Grounded', label: 'Grounded' },
          { value: 'Energized', label: 'Energized' },
          { value: 'Peaceful', label: 'Peaceful' },
          { value: 'Focused', label: 'Focused' },
        ]
      },
      {
        id: 'meditationElements',
        title: 'MEDITATION: Which elements would you like to include?',
        type: 'checkbox',
        skippable: true,
        condition: () => toolChoice === 'Meditation',
        options: [
          { value: 'Breathing', label: 'Breathing' },
          { value: 'Visualization', label: 'Visualization' },
          { value: 'Affirmation', label: 'Affirmation' },
          { value: 'Body Scan', label: 'Body Scan' },
          { value: 'Gratitude', label: 'Gratitude' },
          { value: 'Presence', label: 'Presence' },
        ]
      },
      {
        id: 'meditationLocation',
        title: 'MEDITATION: Preferred imagery/location',
        type: 'card-select',
        skippable: true,
        condition: () => toolChoice === 'Meditation',
        options: [
          { value: 'Forest Clearing', label: 'Forest Clearing' },
          { value: 'Beach Shore', label: 'Beach Shore' },
          { value: 'Mountain Top', label: 'Mountain Top' },
          { value: 'Flowing River', label: 'Flowing River' },
          { value: 'Garden Sanctuary', label: 'Garden Sanctuary' },
        ]
      },
      {
        id: 'meditationDetails',
        title: 'MEDITATION: Additional details (optional)',
        type: 'textarea',
        skippable: true,
        condition: () => toolChoice === 'Meditation',
        placeholder: 'Any specific guidance you want included...'
      },
      // Voice Selection
      {
        id: 'voiceSelection',
        title: 'Choose Voice for Audio',
        subtitle: 'Select the voice that resonates with you',
        type: 'card-select',
        skippable: true,
        options: [
          { value: 'alloy', label: 'Alloy', subtitle: 'Neutral and balanced' },
          { value: 'echo', label: 'Echo', subtitle: 'Warm and friendly' },
          { value: 'fable', label: 'Fable', subtitle: 'Expressive and clear' },
          { value: 'nova', label: 'Nova', subtitle: 'Bright and energetic' },
          { value: 'onyx', label: 'Onyx', subtitle: 'Deep and grounded' },
          { value: 'shimmer', label: 'Shimmer', subtitle: 'Soft and gentle' },
        ]
      },
      // Consent
      {
        id: 'consent',
        title: 'Consent',
        type: 'checkbox-single',
        skippable: false,
        options: [
          { value: 'I consent to this data being used to generate personalised affirmations/meditations for me (see privacy policy).', label: 'I consent to this data being used to generate personalised affirmations/meditations for me (see privacy policy).' }
        ]
      },
      {
        id: 'coachNotes',
        title: 'Optional notes for the coach / follow-up',
        type: 'textarea',
        skippable: true,
        placeholder: 'Any additional notes...'
      },
      // Plot Twist section - option to skip entire section
      {
        id: 'plotTwistOption',
        title: 'Plot Twist Section',
        subtitle: 'Would you like to add Plot Twist elements to deepen your experience?',
        type: 'card-select',
        skippable: false,
        options: [
          { value: 'yes', label: 'Yes, Add Plot Twist', subtitle: 'Personalize further' },
          { value: 'no', label: 'Skip Plot Twist', subtitle: 'Continue without' },
        ]
      },
      // Plot Twist questions - only show if user selected 'yes'
      {
        id: 'plotTwistArchetype',
        title: 'PLOT TWIST: Select main character archetype',
        type: 'card-select',
        skippable: true,
        condition: () => formData.plotTwistOption === 'yes',
        options: [
          { value: 'The Deserving One', label: 'The Deserving One' },
          { value: 'The Capable One', label: 'The Capable One' },
          { value: 'The Magnetic One', label: 'The Magnetic One' },
          { value: 'The Grounded One', label: 'The Grounded One' },
          { value: 'The Expressed One', label: 'The Expressed One' },
          { value: 'The Soft One', label: 'The Soft One' },
          { value: 'The Intuitive One', label: 'The Intuitive One' },
          { value: 'The Liberated One', label: 'The Liberated One' },
          { value: 'The Powerful One', label: 'The Powerful One' },
          { value: 'The Surrendered One', label: 'The Surrendered One' },
        ]
      },
      {
        id: 'plotTwistTier',
        title: 'PLOT TWIST: Select user tier',
        type: 'card-select',
        skippable: true,
        condition: () => formData.plotTwistOption === 'yes',
        options: [
          { value: 'User 1', label: 'User 1' },
          { value: 'User 2', label: 'User 2' },
          { value: 'User 3', label: 'User 3' },
        ]
      },
      {
        id: 'plotTwistPillar',
        title: 'PLOT TWIST: Select aligned pillar',
        type: 'card-select',
        skippable: true,
        condition: () => formData.plotTwistOption === 'yes',
        options: [
          { value: 'Awareness', label: 'Awareness' },
          { value: 'Light (Clarity)', label: 'Light (Clarity)' },
          { value: 'Intention', label: 'Intention' },
          { value: 'Gratitude', label: 'Gratitude' },
          { value: 'Nowness', label: 'Nowness' },
          { value: 'Expansion', label: 'Expansion' },
          { value: 'Dedication', label: 'Dedication' },
        ]
      },
      {
        id: 'plotTwistQuest',
        title: 'PLOT TWIST: Plot Twist Quest',
        type: 'card-select',
        skippable: true,
        condition: () => formData.plotTwistOption === 'yes',
        options: [
          { value: 'Pause & Notice: Spend 3 mins noticing breath before reacting', label: 'Pause & Notice' },
          { value: 'Tiny Boundary: Say no to one small request that drains you', label: 'Tiny Boundary' },
          { value: 'Micro-Task: Break one overwhelming task into one 10-minute action', label: 'Micro-Task' },
          { value: 'Gratitude Flip: Name 3 small things you did well today', label: 'Gratitude Flip' },
          { value: 'Visibility Step: Share one honest sentence about how you feel with a trusted person', label: 'Visibility Step' },
          { value: 'Heart Check: Ask your body where it holds tension, breathe into it for 2 mins', label: 'Heart Check' },
          { value: "Curiosity Question: Ask 'What if I don't have to fix this?' and journal responses", label: 'Curiosity Question' },
          { value: 'Write your own Plot Twist Quest (open text)', label: 'Write your own' },
        ]
      },
      {
        id: 'plotTwistQuestCustom',
        title: 'PLOT TWIST: If \'Write your own\' — describe your Plot Twist Quest',
        type: 'textarea',
        skippable: true,
        condition: () => formData.plotTwistQuest === 'Write your own Plot Twist Quest (open text)',
        placeholder: 'Describe your custom quest...'
      },
      {
        id: 'plotTwistTeachingMoment',
        title: 'PLOT TWIST: Teaching Moment — choose response option',
        type: 'card-select',
        skippable: true,
        options: [
          { value: 'Option 1 — Gentle Reality Check', label: 'Gentle Reality Check' },
          { value: 'Option 2 — Reframe + Action', label: 'Reframe + Action' },
          { value: 'Option 3 — Self-Compassion Prompt', label: 'Self-Compassion' },
          { value: 'Write your own Teaching Moment (open text)', label: 'Write your own' },
        ]
      },
      {
        id: 'plotTwistTeachingMomentText',
        title: 'PLOT TWIST: Teaching Moment — write your response or reflection',
        type: 'textarea',
        skippable: true,
        placeholder: 'Your teaching moment...'
      },
      {
        id: 'plotTwistLittleYou',
        title: 'PLOT TWIST: Little You prompt',
        subtitle: 'What would you want younger-you to hear right now?',
        type: 'textarea',
        skippable: true,
        placeholder: 'Message to your younger self...'
      },
      {
        id: 'plotTwistAccountability',
        title: 'PLOT TWIST: Select 3 small accountability moves',
        type: 'checkbox',
        skippable: true,
        options: [
          { value: 'Set a 10-minute timer and start one task', label: 'Set a timer & start' },
          { value: 'Send one message asking for support', label: 'Ask for support' },
          { value: 'Take a 5-minute walk outside', label: '5-min walk' },
          { value: 'Breathe for 60 seconds with eyes closed', label: '60-sec breathing' },
          { value: 'Write one sentence of progress in a note', label: 'Note progress' },
          { value: 'Do one tiny self-care ritual (water, stretch, rest)', label: 'Self-care ritual' },
        ]
      },
      {
        id: 'plotTwistRating',
        title: 'PLOT TWIST: Rate how useful this Plot Twist felt (1-5)',
        type: 'card-select',
        skippable: true,
        options: [
          { value: '1', label: '1' },
          { value: '2', label: '2' },
          { value: '3', label: '3' },
          { value: '4', label: '4' },
          { value: '5', label: '5' },
        ]
      },
      {
        id: 'affirmationPreview',
        title: 'AFFIRMATION (final preview) — edit if needed',
        type: 'textarea',
        skippable: true,
        placeholder: 'Edit your affirmation preview...'
      },
      {
        id: 'meditationPreview',
        title: 'MEDITATION (final preview) — edit if needed',
        type: 'textarea',
        skippable: true,
        placeholder: 'Edit your meditation preview...'
      },
      {
        id: 'metaSource',
        title: 'Meta: Source / Campaign (optional)',
        type: 'text',
        skippable: true,
        placeholder: 'Source or campaign name...'
      },
      // Final info step
      {
        id: 'finalInfo',
        title: 'Ready to TapIn',
        type: 'info',
        skippable: false,
        message: 'Your personalized affirmation and meditation will be created based on your responses. Click the TapIn button below to generate your tools.'
      }
    ];

    // Filter out steps that have conditions and don't match
    return allSteps.filter(step => {
      if (step.condition) {
        return step.condition();
      }
      return true;
    });
  };

  const formSteps = getFormSteps();

  const handleCardSelect = (value) => {
    const currentStepConfig = formSteps[currentStep];
    setFormData({ ...formData, [currentStepConfig.id]: value });
    
    // Auto-advance for card-select types (but not for the final info step)
    if (currentStepConfig.type === 'card-select' && currentStepConfig.id !== 'finalInfo') {
      setTimeout(() => {
        if (currentStep < formSteps.length - 1) {
          setCurrentStep(currentStep + 1);
        }
      }, 300);
    }
  };

  const handleCheckboxChange = (value) => {
    const currentStepConfig = formSteps[currentStep];
    const currentValues = formData[currentStepConfig.id] || [];
    
    if (currentValues.includes(value)) {
      setFormData({ 
        ...formData, 
        [currentStepConfig.id]: currentValues.filter(v => v !== value) 
      });
    } else {
      setFormData({ 
        ...formData, 
        [currentStepConfig.id]: [...currentValues, value] 
      });
    }
  };

  const handleTextChange = (value) => {
    const currentStepConfig = formSteps[currentStep];
    setFormData({ ...formData, [currentStepConfig.id]: value });
  };

  const handleSkip = () => {
    const currentStepConfig = formSteps[currentStep];
    if (currentStepConfig.skippable) {
      if (currentStep < formSteps.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Direct call to n8n webhook (POC mode - no backend proxy)
      const webhookUrl = N8N_WEBHOOKS[environment];
      
      const res = await axios.post(webhookUrl, formData);
      
      // Check if response contains audio file
      const responseData = res.data;
      if (responseData && responseData[0]?.id && responseData[0]?.fileType === 'audio') {
        try {
          // Fetch the audio file from n8n
          const audioFileUrl = `https://dev-blc.app.n8n.cloud/file/${responseData[0].id}`;
          const audioResponse = await axios.get(audioFileUrl, {
            responseType: 'blob'
          });
          
          // Convert to blob and create object URL
          const audioBlob = audioResponse.data;
          const audioObjectUrl = URL.createObjectURL(audioBlob);
          
          // Add the object URL to the response data
          responseData[0].audioObjectUrl = audioObjectUrl;
          
          console.log('Audio file fetched and prepared for playback');
        } catch (audioError) {
          console.error('Error fetching audio file:', audioError);
          // Continue anyway - audio will be unavailable but rest of data is fine
        }
      }
      
      setResponse(responseData);
      setShowResults(true);
    } catch (error) {
      console.error('Error submitting form:', error);
      
      // Handle n8n specific errors
      const errorData = error.response?.data;
      const errorMessage = errorData?.message || errorData?.hint || error.message || 'Unknown error occurred';
      
      if (error.response?.status === 404) {
        const hint = errorData?.hint || 'The webhook is not registered or not activated.';
        alert(`n8n Webhook Not Available:\n\n${errorMessage}\n\n${hint}\n\nNote: In test mode, you need to activate the webhook in n8n first by clicking "Execute workflow".`);
      } else if (error.response?.status === 403) {
        alert(`Access Denied:\n\n${errorMessage}\n\nThe webhook may require authentication or has restricted access.`);
      } else if (error.code === 'ERR_NETWORK') {
        alert(`Network Error:\n\nUnable to reach the n8n webhook. Please check:\n1. Your internet connection\n2. The webhook URL is correct\n3. n8n service is running`);
      } else {
        alert(`Error submitting to n8n:\n\n${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({});
    setResponse(null);
    setShowResults(false);
    setCurrentStep(0);
  };

  const canProceed = () => {
    const currentStepConfig = formSteps[currentStep];
    if (currentStepConfig.type === 'info') return true;
    if (currentStepConfig.skippable) return true;
    return formData[currentStepConfig.id] !== undefined && formData[currentStepConfig.id] !== '';
  };

  // Results view - use new interactive component
  if (showResults && response) {
    return <ResultsDisplay response={response} onReset={resetForm} />;
  }

  const currentStepConfig = formSteps[currentStep];

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
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-sage-900 mb-2 text-center">
            {currentStepConfig.title}
          </h2>
          {currentStepConfig.subtitle && (
            <p className="text-lg text-sage-600 mb-8 text-center">{currentStepConfig.subtitle}</p>
          )}

          {/* Info Step */}
          {currentStepConfig.type === 'info' && (
            <div className="text-center py-8">
              <div className="mb-6">
                <Sparkles className="w-16 h-16 text-sage-600 mx-auto mb-4" />
                <p className="text-xl text-sage-700 leading-relaxed max-w-2xl mx-auto">
                  {currentStepConfig.message}
                </p>
              </div>
            </div>
          )}

          {/* Card Selection Grid */}
          {currentStepConfig.type === 'card-select' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {currentStepConfig.options.map((option) => (
                <div
                  key={option.value}
                  onClick={() => handleCardSelect(option.value)}
                  className={`card p-6 border-2 transition-all ${
                    formData[currentStepConfig.id] === option.value
                      ? 'card-selected border-sage-900'
                      : 'border-transparent hover:border-sage-300'
                  }`}
                  data-testid={`option-${option.value.replace(/\s+/g, '-').toLowerCase()}`}
                >
                  <h3 className="text-lg font-semibold mb-1">{option.label}</h3>
                  {option.subtitle && (
                    <p className={`text-sm ${
                      formData[currentStepConfig.id] === option.value
                        ? 'text-cream-200'
                        : 'text-sage-600'
                    }`}>
                      {option.subtitle}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Checkbox Selection */}
          {currentStepConfig.type === 'checkbox' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {currentStepConfig.options.map((option) => {
                const isSelected = (formData[currentStepConfig.id] || []).includes(option.value);
                return (
                  <div
                    key={option.value}
                    onClick={() => handleCheckboxChange(option.value)}
                    className={`card p-6 border-2 transition-all ${
                      isSelected
                        ? 'card-selected border-sage-900'
                        : 'border-transparent hover:border-sage-300'
                    }`}
                  >
                    <h3 className="text-lg font-semibold">{option.label}</h3>
                  </div>
                );
              })}
            </div>
          )}

          {/* Single Checkbox */}
          {currentStepConfig.type === 'checkbox-single' && (
            <div className="max-w-2xl mx-auto mb-8">
              {currentStepConfig.options.map((option) => {
                const isChecked = formData[currentStepConfig.id] === option.value;
                return (
                  <div
                    key={option.value}
                    onClick={() => handleCardSelect(option.value)}
                    className={`card p-6 border-2 transition-all cursor-pointer ${
                      isChecked
                        ? 'card-selected border-sage-900'
                        : 'border-transparent hover:border-sage-300'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 mt-1 ${
                        isChecked ? 'bg-sage-900 border-sage-900' : 'border-sage-300'
                      }`}>
                        {isChecked && (
                          <svg className="w-4 h-4 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                            <path d="M5 13l4 4L19 7"></path>
                          </svg>
                        )}
                      </div>
                      <p className="text-base">{option.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Textarea */}
          {currentStepConfig.type === 'textarea' && (
            <div className="max-w-2xl mx-auto mb-8">
              <textarea
                value={formData[currentStepConfig.id] || ''}
                onChange={(e) => handleTextChange(e.target.value)}
                placeholder={currentStepConfig.placeholder}
                className="w-full p-4 border-2 border-sage-200 rounded-xl focus:border-sage-400 focus:outline-none min-h-[150px] resize-y"
                data-testid={`textarea-${currentStepConfig.id}`}
              />
            </div>
          )}

          {/* Text Input */}
          {currentStepConfig.type === 'text' && (
            <div className="max-w-2xl mx-auto mb-8">
              <input
                type="text"
                value={formData[currentStepConfig.id] || ''}
                onChange={(e) => handleTextChange(e.target.value)}
                placeholder={currentStepConfig.placeholder}
                className="w-full p-4 border-2 border-sage-200 rounded-xl focus:border-sage-400 focus:outline-none"
                data-testid={`text-${currentStepConfig.id}`}
              />
            </div>
          )}
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

          <div className="flex gap-3">
            {currentStepConfig.skippable && currentStepConfig.type !== 'info' && (
              <button
                onClick={handleSkip}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-sage-100 text-sage-700 hover:bg-sage-200 transition-all"
                data-testid="skip-btn"
              >
                <SkipForward className="w-5 h-5" />
                Skip
              </button>
            )}

            {currentStep === formSteps.length - 1 && currentStepConfig.type === 'info' ? (
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
                disabled={!canProceed()}
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
    </div>
  );
}

export default App;

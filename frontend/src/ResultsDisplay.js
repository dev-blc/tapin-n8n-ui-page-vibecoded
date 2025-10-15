import React, { useState, useRef, useEffect } from 'react';
import { Download, Play, Pause, Volume2 } from 'lucide-react';
import { toPng } from 'html-to-image';

function ResultsDisplay({ response, onReset }) {
  const [activeTab, setActiveTab] = useState('affirmation');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const audioRef = useRef(null);

  // Use audioObjectUrl if available (blob), otherwise fall back to direct URL
  const audioUrl = response[0]?.audioObjectUrl 
    || (response[0]?.id ? `https://dev-blc.app.n8n.cloud/file/${response[0].id}` : null);
  const affirmation = response[0]?.affirmation;
  const meditation = response[0]?.meditation;

  // Split meditation text into sentences for synced highlighting
  const getMeditationSentences = () => {
    if (!meditation?.tool_text) return [];
    return meditation.tool_text
      .split(/(?<=[.!?])\s+/)
      .filter(s => s.trim().length > 0);
  };

  const sentences = getMeditationSentences();

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      // Revoke object URL if it exists to free memory
      if (response[0]?.audioObjectUrl) {
        URL.revokeObjectURL(response[0].audioObjectUrl);
      }
    };
  }, [response]);

  // Calculate which sentence should be highlighted based on playback time
  useEffect(() => {
    if (isPlaying && sentences.length > 0 && duration > 0) {
      const sentenceDuration = duration / sentences.length;
      const index = Math.floor(currentTime / sentenceDuration);
      setHighlightedIndex(Math.min(index, sentences.length - 1));
    } else {
      setHighlightedIndex(-1);
    }
  }, [currentTime, isPlaying, sentences.length, duration]);

  // Audio event handlers
  const handlePlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    setHighlightedIndex(-1);
  };

  const handleSeek = (e) => {
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-100 via-sage-50 to-cream-200 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-sage-900 mb-2">
            Your TapIn Results
          </h1>
          <p className="text-sage-600">Generated with care for your journey</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setActiveTab('affirmation')}
            className={`px-8 py-3 rounded-full font-medium transition-all ${
              activeTab === 'affirmation'
                ? 'bg-sage-900 text-white shadow-lg'
                : 'bg-white text-sage-700 hover:bg-sage-50'
            }`}
            data-testid="affirmation-tab"
          >
            Affirmation
          </button>
          <button
            onClick={() => setActiveTab('meditation')}
            className={`px-8 py-3 rounded-full font-medium transition-all ${
              activeTab === 'meditation'
                ? 'bg-sage-900 text-white shadow-lg'
                : 'bg-white text-sage-700 hover:bg-sage-50'
            }`}
            data-testid="meditation-tab"
          >
            Meditation
          </button>
        </div>

        {/* Affirmation Content */}
        {activeTab === 'affirmation' && affirmation && (
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 mb-8 fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-serif font-bold text-sage-900">Affirmation</h2>
              <button
                onClick={() => downloadCard('affirmation-content', 'affirmation.png')}
                className="p-3 rounded-full bg-sage-100 text-sage-700 hover:bg-sage-200 transition-all"
                data-testid="download-affirmation-btn"
              >
                <Download className="w-5 h-5" />
              </button>
            </div>
            
            <div id="affirmation-content" className="bg-gradient-to-br from-sage-50 to-cream-100 rounded-2xl p-8">
              <p className="text-2xl md:text-3xl leading-relaxed text-sage-900 font-light text-center">
                {affirmation.tool_text}
              </p>
            </div>

            {affirmation.metadata?.tags && (
              <div className="flex flex-wrap gap-2 mt-6 justify-center">
                {affirmation.metadata.tags.map((tag, idx) => (
                  <span 
                    key={idx} 
                    className="bg-sage-200 text-sage-800 px-4 py-2 rounded-full text-sm font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Meditation Content with Audio Player */}
        {activeTab === 'meditation' && meditation && (
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 mb-8 fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-serif font-bold text-sage-900">Meditation</h2>
              <button
                onClick={() => downloadCard('meditation-content', 'meditation.png')}
                className="p-3 rounded-full bg-sage-100 text-sage-700 hover:bg-sage-200 transition-all"
                data-testid="download-meditation-btn"
              >
                <Download className="w-5 h-5" />
              </button>
            </div>

            {/* Audio Player */}
            {audioUrl && (
              <div className="bg-gradient-to-r from-sage-900 to-sage-700 rounded-2xl p-6 mb-6 text-white">
                <div className="flex items-center gap-4 mb-4">
                  <button
                    onClick={handlePlayPause}
                    className="w-14 h-14 rounded-full bg-white text-sage-900 flex items-center justify-center hover:bg-cream-100 transition-all shadow-lg"
                    data-testid="play-pause-btn"
                  >
                    {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                  </button>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span>{formatTime(currentTime)}</span>
                      <div className="flex items-center gap-2">
                        <Volume2 className="w-4 h-4" />
                        <span className="text-xs">
                          {meditation.metadata?.duration_sec 
                            ? `${Math.floor(meditation.metadata.duration_sec / 60)} min` 
                            : formatTime(duration)}
                        </span>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div 
                      className="w-full h-2 bg-white/20 rounded-full cursor-pointer overflow-hidden"
                      onClick={handleSeek}
                    >
                      <div 
                        className="h-full bg-white rounded-full transition-all duration-100"
                        style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Hidden Audio Element */}
                <audio
                  ref={audioRef}
                  src={audioUrl}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onEnded={handleEnded}
                  preload="metadata"
                />
              </div>
            )}

            {/* Meditation Text with Synced Highlighting */}
            <div 
              id="meditation-content" 
              className="bg-gradient-to-br from-sage-50 to-cream-100 rounded-2xl p-8 max-h-96 overflow-y-auto"
            >
              <div className="text-lg leading-relaxed text-sage-900">
                {sentences.map((sentence, idx) => (
                  <span
                    key={idx}
                    className={`transition-all duration-300 ${
                      highlightedIndex === idx
                        ? 'bg-sage-300 text-sage-900 px-1 rounded font-medium'
                        : 'text-sage-700'
                    }`}
                  >
                    {sentence}{' '}
                  </span>
                ))}
              </div>
            </div>

            {meditation.metadata?.tags && (
              <div className="flex flex-wrap gap-2 mt-6 justify-center">
                {meditation.metadata.tags.map((tag, idx) => (
                  <span 
                    key={idx} 
                    className="bg-sage-200 text-sage-800 px-4 py-2 rounded-full text-sm font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <button
            onClick={onReset}
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

export default ResultsDisplay;

import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import LoadingSpinner from '../components/LoadingSpinner';

const StoryMode: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [story, setStory] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateStory = async () => {
    if (!prompt.trim()) {
        setError("Please enter a prompt for the story.");
        return;
    }
    setIsLoading(true);
    setError(null);
    setStory('');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are a master storyteller who specializes in creating exciting and heartwarming Pokémon adventures for kids. The stories should be easy to understand, full of friendship, and capture the magic of the Pokémon world.',
        },
      });
      setStory(response.text);
    } catch (err) {
      console.error(err);
      setError('Failed to generate story. The API key might be missing or invalid. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-poke-blue">Pokémon Story Generator</h1>
        <p className="text-slate-400 mt-2">Create your own Pokémon adventure!</p>
      </div>

      <div className="max-w-2xl mx-auto space-y-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., A story about a shy Eevee who wants to make friends..."
          className="w-full h-24 p-4 rounded-lg bg-slate-800 border border-slate-600 focus:ring-2 focus:ring-poke-red focus:outline-none resize-none"
          disabled={isLoading}
          aria-label="Story prompt"
        />
        <button
          onClick={handleGenerateStory}
          disabled={isLoading || !prompt.trim()}
          className="w-full bg-poke-red hover:bg-red-600 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              <span>Generating...</span>
            </>
          ) : 'Generate Story'}
        </button>
      </div>

      {isLoading && !story && <LoadingSpinner />}

      {error && (
        <div role="alert" className="text-center text-red-400 bg-red-900/50 p-4 rounded-lg max-w-2xl mx-auto">
          {error}
        </div>
      )}

      {story && (
        <div className="bg-slate-800 rounded-lg p-6 max-w-4xl mx-auto animate-fade-in">
          <h2 className="text-2xl font-bold text-poke-yellow mb-4">Your Pokémon Story</h2>
          <div className="text-slate-300 leading-relaxed whitespace-pre-wrap">
            {story}
          </div>
        </div>
      )}
    </div>
  );
};

export default StoryMode;
import React, { useState, useRef } from 'react';
import { Button } from './Button';
import { IncidentType, SeverityLevel, NewIncidentPayload } from '../types';
import { INCIDENT_CATEGORIES } from '../constants';
import { analyzeIncidentDescription } from '../services/geminiService';
import { MapPin, Camera, Mic, ShieldCheck, Info, Loader2, X, Check, FileImage, FileAudio } from 'lucide-react';

interface IncidentFormProps {
  onSubmit: (data: NewIncidentPayload) => void;
  onCancel: () => void;
}

export const IncidentForm: React.FC<IncidentFormProps> = ({ onSubmit, onCancel }) => {
  const [description, setDescription] = useState('');
  const [type, setType] = useState<IncidentType>(IncidentType.Other);
  const [severity, setSeverity] = useState<SeverityLevel>(SeverityLevel.Low);
  const [isAnonymous, setIsAnonymous] = useState(false);
  
  // Location State
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [manualAddress, setManualAddress] = useState('');
  const [locationError, setLocationError] = useState('');
  const [isLocating, setIsLocating] = useState(false);

  // Media State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  // AI State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);

  const handleLocationClick = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser. Please enter address manually.');
      return;
    }
    
    setIsLocating(true);
    setLocationError('');

    const handleSuccess = (position: GeolocationPosition) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setLocation({ lat, lng });
        // Mock Reverse Geocoding since we don't have a real Maps API key for Geocoding here
        setManualAddress(`Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`);
        setLocationError('');
        setIsLocating(false);
    };

    const handleError = (error: GeolocationPositionError) => {
        setIsLocating(false);
        console.error(`GPS Error (${error.code}): ${error.message}`);
        
        let msg = 'Unable to retrieve location. Please enter address manually.';
        
        switch (error.code) {
            case 1: // PERMISSION_DENIED
                msg = 'Location permission denied. Please enable location access in your browser settings.';
                break;
            case 2: // POSITION_UNAVAILABLE
                msg = 'GPS signal weak. Try moving to an open area or enter address manually.';
                break;
            case 3: // TIMEOUT
                msg = 'Location request timed out. Please try again or enter address manually.';
                break;
            default:
                msg = error.message || msg;
        }
        
        setLocationError(msg);
    };

    // First attempt: High Accuracy
    navigator.geolocation.getCurrentPosition(
      handleSuccess,
      (error) => {
        // If High Accuracy fails (Unavailable or Timeout), try Low Accuracy
        if (error.code === 2 || error.code === 3) {
            console.warn("High accuracy failed, retrying with low accuracy...");
            navigator.geolocation.getCurrentPosition(
                handleSuccess,
                handleError, // Fail completely if this also fails
                { 
                    enableHighAccuracy: false, 
                    timeout: 10000, 
                    maximumAge: 0 
                }
            );
        } else {
            handleError(error);
        }
      },
      { 
        enableHighAccuracy: true, 
        timeout: 8000, // Short timeout for high accuracy to trigger fallback quickly
        maximumAge: 0 
      }
    );
  };

  const handleAIAnalyze = async () => {
    if (!description.trim()) return;
    setIsAnalyzing(true);
    const result = await analyzeIncidentDescription(description);
    if (result) {
      setType(result.suggestedType);
      setSeverity(result.severityLevel);
      setAiSummary(result.summary);
    }
    setIsAnalyzing(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'audio') => {
    if (e.target.files && e.target.files[0]) {
      if (type === 'image') setImageFile(e.target.files[0]);
      if (type === 'audio') setAudioFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Construct final location object
    const finalLocation = location ? {
        ...location,
        address: manualAddress || `Lat: ${location.lat.toFixed(4)}, Lng: ${location.lng.toFixed(4)}`
    } : {
        lat: 9.0820, // Default fallback (Nigeria center)
        lng: 8.6753,
        address: manualAddress || 'Location Not Provided'
    };

    onSubmit({
      description,
      type,
      severity,
      isAnonymous,
      location: finalLocation,
      media: {
        image: imageFile ? imageFile.name : null,
        audio: audioFile ? audioFile.name : null
      },
      timestamp: Date.now()
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-xl overflow-hidden max-w-2xl mx-auto border border-gray-100">
      <div className="bg-guard-green p-6 text-white">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <ShieldCheck className="h-6 w-6" />
          Report Incident
        </h2>
        <p className="text-green-100 opacity-90 mt-1">See It. Say It. Sort It.</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        
        {/* Description Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What is happening?
          </label>
          <div className="relative">
            <textarea
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-guard-green focus:border-transparent min-h-[120px]"
              placeholder="Describe the incident in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
            <div className="absolute bottom-3 right-3">
              <Button 
                type="button" 
                size="sm" 
                variant="secondary" 
                onClick={handleAIAnalyze}
                isLoading={isAnalyzing}
                disabled={!description || isAnalyzing}
                className="text-xs"
              >
                Auto-Analyze
              </Button>
            </div>
          </div>
          {aiSummary && (
            <div className="mt-2 p-3 bg-blue-50 text-blue-800 rounded-lg text-sm flex items-start gap-2 animate-in fade-in slide-in-from-top-2">
              <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-semibold">AI Analysis:</span> {aiSummary}
              </div>
            </div>
          )}
        </div>

        {/* Category & Severity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as IncidentType)}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-guard-green focus:border-guard-green bg-white"
            >
              {INCIDENT_CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
            <div className="flex gap-2">
              {[SeverityLevel.Low, SeverityLevel.Medium, SeverityLevel.High, SeverityLevel.Critical].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setSeverity(lvl)}
                  className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-all ${
                    severity === lvl
                      ? lvl === SeverityLevel.Critical ? 'bg-red-600 text-white border-red-600' : 'bg-guard-green text-white border-guard-green'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Location Section */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">Location</label>
          <div className="flex gap-2">
             <button
                type="button"
                onClick={handleLocationClick}
                disabled={isLocating}
                className={`flex-shrink-0 px-4 py-2 border rounded-lg flex items-center gap-2 transition-colors ${
                  location ? 'bg-green-100 border-green-200 text-green-800' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {isLocating ? <Loader2 className="h-5 w-5 animate-spin" /> : <MapPin className="h-5 w-5" />}
                {location ? 'GPS Set' : 'Get GPS'}
             </button>
             <input 
               type="text" 
               placeholder="Or enter address manually (e.g. Lekki Toll Gate)"
               className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-guard-green focus:border-guard-green"
               value={manualAddress}
               onChange={(e) => setManualAddress(e.target.value)}
             />
          </div>
          {locationError && (
             <p className="text-xs text-red-500 flex items-center gap-1">
               <Info className="h-3 w-3" />
               {locationError}
             </p>
          )}
        </div>

        {/* Evidence Section */}
        <div className="space-y-2">
           <label className="block text-sm font-medium text-gray-700">Evidence (Optional)</label>
           <div className="grid grid-cols-2 gap-4">
              {/* Camera Input */}
              <div className="relative">
                <input 
                  type="file" 
                  accept="image/*" 
                  capture="environment"
                  className="hidden" 
                  ref={imageInputRef}
                  onChange={(e) => handleFileChange(e, 'image')}
                />
                <button 
                  type="button" 
                  onClick={() => imageInputRef.current?.click()}
                  className={`w-full p-3 border rounded-lg flex items-center justify-center gap-2 transition-colors ${
                    imageFile ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {imageFile ? <FileImage className="h-5 w-5" /> : <Camera className="h-5 w-5" />}
                  <span className="text-sm">{imageFile ? 'Image Added' : 'Add Photo'}</span>
                  {imageFile && <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full"></div>}
                </button>
                {imageFile && (
                  <button 
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setImageFile(null); }}
                    className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1 shadow-sm hover:bg-red-200"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>

              {/* Audio Input */}
              <div className="relative">
                <input 
                  type="file" 
                  accept="audio/*" 
                  capture="environment"
                  className="hidden" 
                  ref={audioInputRef}
                  onChange={(e) => handleFileChange(e, 'audio')}
                />
                <button 
                  type="button" 
                  onClick={() => audioInputRef.current?.click()}
                  className={`w-full p-3 border rounded-lg flex items-center justify-center gap-2 transition-colors ${
                    audioFile ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {audioFile ? <FileAudio className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                  <span className="text-sm">{audioFile ? 'Audio Added' : 'Add Audio'}</span>
                   {audioFile && <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full"></div>}
                </button>
                {audioFile && (
                  <button 
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setAudioFile(null); }}
                    className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1 shadow-sm hover:bg-red-200"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
           </div>
        </div>

        {/* Anonymous Toggle */}
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
           <input
            type="checkbox"
            id="anonymous"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            className="h-5 w-5 text-guard-green border-gray-300 rounded focus:ring-guard-green"
           />
           <label htmlFor="anonymous" className="text-sm text-gray-700">
             <span className="font-medium block">Report Anonymously</span>
             <span className="text-xs text-gray-500">Your identity will be hidden from public records.</span>
           </label>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
          <Button type="submit" variant={severity === SeverityLevel.Critical ? 'danger' : 'primary'}>
            Submit Report
          </Button>
        </div>

      </form>
    </div>
  );
};
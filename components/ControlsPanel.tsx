'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ControlsPanelProps {
  isDark: boolean;
  detectionModel: string;
  setDetectionModel: (model: string) => void;
  priceSensitivity: number;
  setPriceSensitivity: (value: number) => void;
  volumeSensitivity: number;
  setVolumeSensitivity: (value: number) => void;
  settingsLoading?: boolean;
}

export function ControlsPanel({
  isDark,
  detectionModel,
  setDetectionModel,
  priceSensitivity,
  setPriceSensitivity,
  volumeSensitivity,
  setVolumeSensitivity,
  settingsLoading = false,
}: ControlsPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const models = ['Logarithmic', 'Exponential', 'Parabolic'];

  const SensitivitySlider = ({
    label,
    value,
    onChange,
    min,
    max,
    step,
    unit,
  }: {
    label: string;
    value: number;
    onChange: (value: number) => void;
    min: number;
    max: number;
    step: number;
    unit: string;
  }) => {
    const percentage = ((value - min) / (max - min)) * 100;

    return (
      <div className="space-y-1.5 flex-1">
        <div className="flex items-center justify-between">
          <h4 className={`text-sm font-medium ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            {label}
          </h4>
          <span className={`text-sm font-bold ${
            isDark ? 'text-emerald-400' : 'text-emerald-600'
          }`}>
            {value.toFixed(1)}{unit}
          </span>
        </div>
        
        <div className="relative">
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 sensitivity-slider"
          />

          <style jsx>{`
            .sensitivity-slider {
              background: linear-gradient(to right, #10b981 0%, #10b981 ${percentage}%, ${isDark ? '#1c2129' : '#d1d5db'} ${percentage}%, ${isDark ? '#1c2129' : '#d1d5db'} 100%);
            }

            .sensitivity-slider::-webkit-slider-thumb {
              appearance: none;
              height: 20px;
              width: 20px;
              border-radius: 50%;
              background: #10b981;
              cursor: pointer;
              box-shadow: 0 2px 6px rgba(16, 185, 129, 0.3);
              transition: all 0.15s ease-in-out;
            }

            .sensitivity-slider::-webkit-slider-thumb:hover {
              box-shadow: 0 3px 8px rgba(16, 185, 129, 0.4);
              transform: scale(1.05);
            }

            .sensitivity-slider::-webkit-slider-thumb:active {
              box-shadow: 0 4px 10px rgba(16, 185, 129, 0.5);
              transform: scale(1.1);
            }

            .sensitivity-slider::-moz-range-thumb {
              height: 20px;
              width: 20px;
              border-radius: 50%;
              background: #10b981;
              cursor: pointer;
              border: none;
              box-shadow: 0 2px 6px rgba(16, 185, 129, 0.3);
              transition: all 0.15s ease-in-out;
            }

            .sensitivity-slider::-moz-range-thumb:hover {
              box-shadow: 0 3px 8px rgba(16, 185, 129, 0.4);
              transform: scale(1.05);
            }

            .sensitivity-slider::-moz-range-thumb:active {
              box-shadow: 0 4px 10px rgba(16, 185, 129, 0.5);
              transform: scale(1.1);
            }

            .sensitivity-slider::-moz-range-track {
              height: 8px;
              background: transparent;
              border: none;
            }
          `}</style>
        </div>
      </div>
    );
  };

  return (
    <div className={`rounded-2xl mb-8 transition-all duration-300 ${
      isDark 
        ? 'bg-gray-800/72 backdrop-blur-sm border border-gray-700/50 neon-green-sm' 
        : 'bg-white/87 backdrop-blur-sm border border-gray-200 neon-green-sm'
    }`}>
      {/* Toggle Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full flex items-center justify-between p-4 transition-all duration-300 hover:${
          isDark ? 'bg-gray-700/30' : 'bg-gray-50/50'
        } rounded-2xl`}
      >
        <div className="flex items-center space-x-3">
          <h2 className={`text-lg font-semibold ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Settings
          </h2>
          {isExpanded && (
            <div className="flex items-center space-x-2 text-sm">
              <span className={`px-2 py-1 rounded-lg text-xs font-medium text-gray-300 neon-green-sm`}
                style={{ backgroundColor: isDark ? '#1c2129' : '#dadce3', color: isDark ? '#d1d5db' : '#374151' }}>
                {detectionModel}
              </span>
              <span className={`text-xs ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
                P:{priceSensitivity.toFixed(1)}% V:{volumeSensitivity.toFixed(1)}x
              </span>
              {settingsLoading && (
                <span className={`text-xs px-2 py-1 rounded-lg ${
                  isDark ? 'bg-dark text-blue-400' : 'bg-white text-blue-600'
                }`}>
                  🟢
                </span>
              )}
            </div>
          )}
        </div>
        
        <div className={`p-2 rounded-full transition-all duration-300 neon-green-sm`}
          style={{ backgroundColor: isDark ? '#1c2129' : '#dadce3' }}>
          {isExpanded ? (
            <ChevronUp className={`w-5 h-5 ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`} />
          ) : (
            <ChevronDown className={`w-5 h-5 ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`} />
          )}
        </div>
      </button>

      {/* Collapsible Content */}
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
        isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="px-6 pb-6">
          {/* Horizontal Layout for Detection Model, Price Sensitivity, and Volume Sensitivity */}
          <div className="flex gap-6">
            {/* Detection Model Section */}
            <div className="flex-1">
              <h3 className={`text-base font-semibold mb-3 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Detection Model
              </h3>
              
              <div className="flex flex-wrap gap-3 mb-3">
                {models.map((model) => (
                  <button
                    key={model}
                    onClick={() => setDetectionModel(model)}
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                      detectionModel === model
                        ? 'bg-emerald-500 text-white neon-green-lg'
                        : 'text-gray-300 hover:bg-gray-500 neon-green-sm hover:neon-green-md'
                    }`}
                    style={detectionModel !== model ? { 
                      backgroundColor: isDark ? '#1c2129' : '#dadce3',
                      color: isDark ? '#d1d5db' : '#374151'
                    } : {}}
                    onMouseEnter={(e) => {
                      if (detectionModel !== model) {
                        e.currentTarget.style.backgroundColor = isDark ? '#1c2129' : '#c4c7d0';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (detectionModel !== model) {
                        e.currentTarget.style.backgroundColor = isDark ? '#1c2129' : '#dadce3';
                      }
                    }}
                  >
                    {model}
                  </button>
                ))}
              </div>
              
              <p className={`text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {detectionModel === 'Logarithmic' && 'Highest sensitivity. Best for catching fast, sharp initial spikes.'}
                {detectionModel === 'Exponential' && 'Balanced (Default). Best for typical, steady-growth pumps.'}
                {detectionModel === 'Parabolic' && 'Lowest sensitivity. Tuned for pumps that start slow and accelerate late.'}
              </p>
            </div>

            {/* Price Sensitivity Controls Section */}
            <div className="flex-1">
              <h3 className={`text-base font-semibold mb-2 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Sensitivity Controls
              </h3>
              
              <SensitivitySlider
                label="Price Sensitivity"
                value={priceSensitivity}
                onChange={setPriceSensitivity}
                min={0.1}
                max={50}
                step={0.1}
                unit="%"
              />
            </div>
            
            {/* Volume Sensitivity Section */}
            <div className="flex-1">
              <h3 className={`text-base font-semibold mb-2 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Volume Sensitivity
              </h3>
              
              <SensitivitySlider
                label="Volume Sensitivity"
                value={volumeSensitivity}
                onChange={setVolumeSensitivity}
                min={1.5}
                max={10}
                step={0.1}
                unit="x"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
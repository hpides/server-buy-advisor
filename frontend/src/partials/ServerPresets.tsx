import { useState, useRef, useEffect } from 'react';
import CPU_DATA, { SERVER_PRESETS, ServerPresets } from '../assets/data';
import { ServerType } from '../utility/BenchmarkContext';
import { CUSTOM } from './Compare';

type ServerPresetsComponentProps = {
  updateComponent: (update: Partial<ServerType>, preset: string) => void;
  presetValue: keyof ServerPresets | typeof CUSTOM;
  setAdvancedOptions: (value: null | 'Mirror' | 'Scale') => void;
  setAdvancedSettings: (value: boolean) => void;
};

const ServerPresetsComponent = ({ presetValue, updateComponent, setAdvancedOptions, setAdvancedSettings }: ServerPresetsComponentProps) => {
  const [showPresetMenu, setShowPresetMenu] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  // Close popup if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setShowPresetMenu(false);
      }
    };

    if (showPresetMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    // Clean up
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPresetMenu]);

  const handleSelectPreset = (key: keyof ServerPresets) => {
    setAdvancedOptions(null);
    setAdvancedSettings(true);
    const preset = SERVER_PRESETS[key];

    const config: Partial<ServerType> = {
      cpu: preset.cpu as string,
      ram: preset.ram,
      ssd: preset.ssd,
      hdd: preset.hdd,
    };
    updateComponent(config, key as string);
    setShowPresetMenu(false);
  };

  return (
    <div className="relative">
      {/* Trigger */}
      <div
        onClick={() => setShowPresetMenu(!showPresetMenu)}
        draggable="false"
        className="cursor-pointer -mt-2"
      >
        Server Configuration: {presetValue} {showPresetMenu ? '▼' : '▶'}
      </div>

      {/* PresetMenu */}
      {showPresetMenu && (
        <div
          ref={popupRef}
          className="absolute left-0 mt-2 ml-3 w-80 bg-white border rounded shadow-lg z-50 p-3">
          {/* Close button */}
          <div className="flex justify-between items-center mb-2">
            <p className="font-semibold">Select a Preset</p>
            <button
              onClick={() => setShowPresetMenu(false)}
              className="text-gray-500 hover:text-red-400 text-sm cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="space-y-3">
            {Object.entries(SERVER_PRESETS).map(([key, preset]) => (
              <div
                key={key}
                onClick={() => handleSelectPreset(key)}
                className={`cursor-pointer p-2 hover:bg-gray-100 rounded ${key === presetValue ? 'bg-gray-200' : ''}`}
              >
                <p className="font-medium">
                  {preset.instance} | {preset.specific_name} | ${preset.price}/hr
                </p>
                <div className="text-sm text-gray-600 ml-2">
                  <p>{CPU_DATA[preset.cpu].LAUNCH_YEAR} {preset.cpu}</p>
                  <p>{preset.ram}GB RAM - {preset.ssd} GB SSD</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ServerPresetsComponent;

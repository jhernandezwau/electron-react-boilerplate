import React, { useState } from 'react';
import { SettingsView } from './SettingsView';
import { ContentSelectionView } from './ContentSelectionView';
import { ReviewView } from './ReviewView';
import cortexCloudLogo from '../../../assets/CortexCloud.png';

export function UpgradeToolInterface() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    prismaCloud: {
      apiUrl: '',
      computeConsoleUrl: '',
      accessKey: '',
      secretKey: '',
      tenantId: '',
    },
    cortexCloud: {
      tenantUrl: '',
      accessKey: '',
      keyId: '',
    }
  });

  const handleInputChange = (section: 'prismaCloud' | 'cortexCloud', field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      // Dispatch event to start migration
      window.dispatchEvent(new Event('start-migration'));
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCancel = () => {
    window.electron?.ipcRenderer.sendMessage('close-window');
  };

  return (
    <div className="upgrade-tool">
      <img src={cortexCloudLogo} alt="Cortex Cloud Logo" className="logo" />      
      <div className="stepper">
        <div className={`step ${currentStep === 1 ? 'active' : ''}`}>
          <div className="step-number">1</div>
          <div className="step-label">Settings</div>
        </div>
        <div className={`step ${currentStep === 2 ? 'active' : ''}`}>
          <div className="step-number">2</div>
          <div className="step-label">Content Selection</div>
        </div>
        <div className={`step ${currentStep === 3 ? 'active' : ''}`}>
          <div className="step-number">3</div>
          <div className="step-label">Review</div>
        </div>
      </div>

      {currentStep === 1 && <SettingsView formData={formData} handleInputChange={handleInputChange} />}
      {currentStep === 2 && (
        <ContentSelectionView 
          selectedItems={selectedItems} 
          setSelectedItems={setSelectedItems} 
        />
      )}
      {currentStep === 3 && <ReviewView formData={formData} selectedItems={selectedItems} />}

      <div className="button-container">
        <button className="button cancel" onClick={handleCancel}>Cancel</button>
        <button className="button back" disabled={currentStep === 1} onClick={handleBack}>Back</button>
        <button className="button next" onClick={handleNext}>
          {currentStep === 3 ? 'Start Upgrade' : 'Next'}
        </button>
      </div>
    </div>
  );
} 
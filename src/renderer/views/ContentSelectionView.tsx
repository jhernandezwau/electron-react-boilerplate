import React from 'react';

interface ContentSelectionViewProps {
  selectedItems: string[];
  setSelectedItems: React.Dispatch<React.SetStateAction<string[]>>;
}

export function ContentSelectionView({ selectedItems, setSelectedItems }: ContentSelectionViewProps) {
  const handleItemToggle = (item: string) => {
    setSelectedItems(prev => 
      prev.includes(item) 
        ? prev.filter(i => i !== item)
        : [...prev, item]
    );
  };

  const handleSelectAll = () => {
    const allItems = [
      'customYaml',
      'repository',
      'ootbPolicies',
      'validateSecrets',
      'enforcementRules',
      'secretsHistory'
    ];
    
    if (selectedItems.length === allItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(allItems);
    }
  };

  return (
    <div className="settings-container">
      <div className="content-section">
        <div className="content-section-header">
          <h2 className="content-section-title">Application Security</h2>
          <button className="select-all-button" onClick={handleSelectAll}>
            {selectedItems.length === 6 ? 'Deselect All' : 'Select All'}
          </button>
        </div>
        <div className="content-grid">
          <div className="content-item">
            <label>
              <input
                type="checkbox"
                checked={selectedItems.includes('customYaml')}
                onChange={() => handleItemToggle('customYaml')}
              />
              <span className="content-item-text">Custom YAML Policies</span>
            </label>
            <button className="info-icon-button" title="Information about Custom YAML Policies">ⓘ</button>
          </div>
          <div className="content-item">
            <label>
              <input
                type="checkbox"
                checked={selectedItems.includes('repository')}
                onChange={() => handleItemToggle('repository')}
              />
              <span className="content-item-text">Repository Selection</span>
            </label>
            <button className="info-icon-button" title="Information about Repository Selection">ⓘ</button>
          </div>
          <div className="content-item">
            <label>
              <input
                type="checkbox"
                checked={selectedItems.includes('ootbPolicies')}
                onChange={() => handleItemToggle('ootbPolicies')}
              />
              <span className="content-item-text">OOTB Build Policies Labels</span>
            </label>
            <button className="info-icon-button" title="Information about OOTB Build Policies">ⓘ</button>
          </div>
          <div className="content-item">
            <label>
              <input
                type="checkbox"
                checked={selectedItems.includes('validateSecrets')}
                onChange={() => handleItemToggle('validateSecrets')}
              />
              <span className="content-item-text">Validate Secrets</span>
            </label>
            <button className="info-icon-button" title="Information about Validate Secrets">ⓘ</button>
          </div>
          <div className="content-item">
            <label>
              <input
                type="checkbox"
                checked={selectedItems.includes('enforcementRules')}
                onChange={() => handleItemToggle('enforcementRules')}
              />
              <span className="content-item-text">Enforcement Rules</span>
            </label>
            <button className="info-icon-button" title="Information about Enforcement Rules">ⓘ</button>
          </div>
          <div className="content-item">
            <label>
              <input
                type="checkbox"
                checked={selectedItems.includes('secretsHistory')}
                onChange={() => handleItemToggle('secretsHistory')}
              />
              <span className="content-item-text">Secrets History</span>
            </label>
            <button className="info-icon-button" title="Information about Secrets History">ⓘ</button>
          </div>
          <div className="content-item disabled-item">
            <label>
              <input
                type="checkbox"
                disabled
              />
              <span className="content-item-text">Developer Suppression Settings</span>
            </label>
            <button className="info-icon-button" title="Information about Developer Suppression Settings">ⓘ</button>
          </div>
          <div className="content-item disabled-item">
            <label>
              <input
                type="checkbox"
                disabled
              />
              <span className="content-item-text">Configure Issues in Created Policies</span>
            </label>
            <button className="info-icon-button" title="Information about Configure Issues">ⓘ</button>
          </div>
        </div>
      </div>
    </div>
  );
} 
import React from 'react';

interface SettingsViewProps {
  formData: {
    prismaCloud: {
      apiUrl: string;
      computeConsoleUrl: string;
      accessKey: string;
      secretKey: string;
      tenantId: string;
    };
    cortexCloud: {
      tenantUrl: string;
      accessKey: string;
      keyId: string;
    };
  };
  handleInputChange: (section: 'prismaCloud' | 'cortexCloud', field: string, value: string) => void;
}

export function SettingsView({ formData, handleInputChange }: SettingsViewProps) {
  return (
    <div className="settings-container">
      <div className="settings-section">
        <h2>Prisma Cloud Settings</h2>
        <div className="form-grid">
          <div className="form-group">
            <label>
              API URL <span className="required">*</span>
              <span className="info-icon">ⓘ</span>
            </label>
            <input
              type="text"
              placeholder="Enter URL"
              value={formData.prismaCloud.apiUrl}
              onChange={(e) => handleInputChange('prismaCloud', 'apiUrl', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>
              Secret Key <span className="required">*</span>
              <span className="info-icon">ⓘ</span>
            </label>
            <input
              type="password"
              placeholder="Enter secret key"
              value={formData.prismaCloud.secretKey}
              onChange={(e) => handleInputChange('prismaCloud', 'secretKey', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>
              Compute Console URL <span className="required">*</span>
              <span className="info-icon">ⓘ</span>
            </label>
            <input
              type="text"
              placeholder="Enter URL"
              value={formData.prismaCloud.computeConsoleUrl}
              onChange={(e) => handleInputChange('prismaCloud', 'computeConsoleUrl', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>
              Tenant ID <span className="required">*</span>
              <span className="info-icon">ⓘ</span>
            </label>
            <input
              type="text"
              placeholder="Enter tenant ID"
              value={formData.prismaCloud.tenantId}
              onChange={(e) => handleInputChange('prismaCloud', 'tenantId', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>
              Access Key <span className="required">*</span>
              <span className="info-icon">ⓘ</span>
            </label>
            <input
              type="text"
              placeholder="Select issue severity"
              value={formData.prismaCloud.accessKey}
              onChange={(e) => handleInputChange('prismaCloud', 'accessKey', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h2>Cortex Cloud Settings</h2>
        <div className="form-grid">
          <div className="form-group">
            <label>
              Tenant URL <span className="required">*</span>
              <span className="info-icon">ⓘ</span>
            </label>
            <input
              type="text"
              placeholder="Enter URL"
              value={formData.cortexCloud.tenantUrl}
              onChange={(e) => handleInputChange('cortexCloud', 'tenantUrl', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>
              Key ID <span className="required">*</span>
              <span className="info-icon">ⓘ</span>
            </label>
            <input
              type="text"
              placeholder="Enter key ID"
              value={formData.cortexCloud.keyId}
              onChange={(e) => handleInputChange('cortexCloud', 'keyId', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>
              Access Key <span className="required">*</span>
              <span className="info-icon">ⓘ</span>
            </label>
            <input
              type="text"
              placeholder="Enter URL"
              value={formData.cortexCloud.accessKey}
              onChange={(e) => handleInputChange('cortexCloud', 'accessKey', e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 
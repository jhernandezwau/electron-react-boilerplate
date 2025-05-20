import React, { useState, useEffect } from 'react';
import PrismaAPIClient from '@configurations/prisma_client';
import CortexAPIClient from '@configurations/cortex_client';

type IngestorKey = 'ootbPolicies' | 'customYaml' | 'enforcementRules' | 'repository' | 'secretsHistory' | 'validateSecrets';

const ingestors: Record<IngestorKey, {
  endpoint: string;
  params: Record<string, any>;
}> = {
  ootbPolicies: {
    endpoint: '/v2/policy',
    params: {
      'policy.subtype': ['build', 'run_and_build'],
      'policy.policyMode': 'redlock_default'
    }
  },
  customYaml: {
    endpoint: '/v2/policy',
    params: {
      'policy.subtype': ['build', 'run_and_build'],
      'policy.policyMode': 'custom'
    }
  },
  enforcementRules: {
    endpoint: '/code/api/v1/enforcement-rules',
    params: {}
  },
  repository: {
    endpoint: '/bridgecrew/api/v1/integrations',
    params: {}
  },
  secretsHistory: {
    endpoint: '/bridgecrew/api/v1/customer/configurations/secretsHistory',
    params: {}
  },
  validateSecrets: {
    endpoint: '/bridgecrew/api/v1/customer/configurations/secretsValidate',
    params: {}
  }
};

interface ReviewViewProps {
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
  selectedItems: string[];
}

interface ItemStatus {
  id: string;
  name: string;
  status: 'pending' | 'in_progress' | 'completed';
  progress: number;
}

interface ValidationResult {
  prismaValid: boolean;
  cortexValid: boolean;
  prismaToken?: string;
  cortexToken?: string;
  error?: string;
}

// Acceder a la API de Electron expuesta en preload
declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        sendMessage: (channel: string, ...args: any[]) => void;
        on: (channel: string, func: (...args: any[]) => void) => void;
        once: (channel: string, func: (...args: any[]) => void) => void;
      };
      getProxyUrl: () => Promise<string>;
    };
  }
}

export function ReviewView({ formData, selectedItems }: ReviewViewProps) {
  const [progress, setProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [itemStatuses, setItemStatuses] = useState<ItemStatus[]>([]);

  const [prismaClient, setPrismaClient] = useState<PrismaAPIClient | null>(null);
  const [cortexClient, setCortexClient] = useState<CortexAPIClient | null>(null);

  const itemLabels: { [key: string]: string } = {
    customYaml: 'Custom YAML Policies',
    repository: 'Repository Selection',
    ootbPolicies: 'OOTB Build Policies Labels',
    validateSecrets: 'Validate Secrets',
    enforcementRules: 'Enforcement Rules',
    secretsHistory: 'Secrets History'
  };

  // Initialize item statuses
  useEffect(() => {
    const initialStatuses = selectedItems.map(item => ({
      id: item,
      name: itemLabels[item],
      status: 'pending' as const,
      progress: 0
    }));
    setItemStatuses(initialStatuses);
  }, [selectedItems]);

  // Calculate overall progress based on individual item progress
  useEffect(() => {
    if (itemStatuses.length > 0) {
      const totalProgress = itemStatuses.reduce((acc, item) => acc + item.progress, 0);
      const overallProgress = Math.floor(totalProgress / itemStatuses.length);
      setProgress(overallProgress);
    }
  }, [itemStatuses]);

  const validateCloudCredentials = async (): Promise<ValidationResult> => {
    try {
      // Validar Prisma Cloud
      const newPrismaClient = new PrismaAPIClient({
        accessKey: formData.prismaCloud.accessKey,
        secretKey: formData.prismaCloud.secretKey,
        baseURL: formData.prismaCloud.apiUrl
      });
      setPrismaClient(newPrismaClient);

      let prismaToken: string | undefined;
      let prismaValid = false;

      try {
        const prismaResponse = await newPrismaClient.makeLoginRequest();
        prismaToken = prismaResponse?.data.token;
        prismaValid = true;
        console.log('Prisma Cloud login successful');
      } catch (error) {
        console.error('Prisma Cloud login error:', error);
        prismaValid = false;
      }

      // Validar Cortex Cloud
      const newCortexClient = new CortexAPIClient({
        accessKey: formData.cortexCloud.accessKey,
        secretKey: formData.cortexCloud.keyId,
        baseURL: formData.cortexCloud.tenantUrl
      });
      setCortexClient(newCortexClient);

      let cortexToken: string | undefined;
      let cortexValid = false;

      try {
        const proxyUrl = await window.electron.getProxyUrl();
        console.log('Got proxy URL:', proxyUrl);
        newCortexClient.setProxyUrl(proxyUrl);
        const cortexResponse = await newCortexClient.makeLoginRequest();
        console.log('Cortex response:', cortexResponse);
        
        if (cortexResponse && (cortexResponse.data === true || (typeof cortexResponse.data === 'object' && cortexResponse.data.token))) {
          cortexValid = true;
          if (typeof cortexResponse.data === 'object' && cortexResponse.data.token) {
            cortexToken = cortexResponse.data.token;
          }
          console.log('Cortex Cloud login successful');
        } else {
          console.log('Cortex response was not in expected format:', cortexResponse);
          cortexValid = false;
        }
      } catch (error) {
        console.error('Cortex Cloud login error:', error);
        cortexValid = false;
      }

      return {
        prismaValid,
        cortexValid,
        prismaToken,
        cortexToken
      };
    } catch (error) {
      console.error('General validation error:', error);
      return {
        prismaValid: false,
        cortexValid: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  };

  // Handle parallel ingestion for a single item
  const handleItemIngestion = async (
    item: string, 
    prismaToken: string,
    updateProgress: (progress: number) => void
  ) => {
    try {
      const ingestor = ingestors[item as IngestorKey];
      
      // Update status to in_progress
      setItemStatuses(prev => prev.map(status =>
        status.id === item
          ? { ...status, status: 'in_progress' as const }
          : status
      ));

      const ingestorResponse = await prismaClient?.makeIngestorRequest(
        ingestor.endpoint, 
        ingestor.params, 
        prismaToken
      );

      // Update status to completed
      setItemStatuses(prev => prev.map(status =>
        status.id === item
          ? { ...status, status: 'completed' as const, progress: 100 }
          : status
      ));

      console.log(`Ingestor response for ${item}:`, ingestorResponse);
      return { item, success: true };
    } catch (error) {
      console.error(`Error in ingestor ${item}:`, error);
      // Update status to show error (you might want to add an error state)
      setItemStatuses(prev => prev.map(status =>
        status.id === item
          ? { ...status, status: 'completed' as const, progress: 100 }
          : status
      ));
      return { item, success: false, error };
    }
  };

  // Handle migration start
  useEffect(() => {
    const handleStartMigration = async () => {
      console.log('Starting migration...');
      
      const validationResult = await validateCloudCredentials();
      
      if (!validationResult.prismaValid || !validationResult.cortexValid) {
        const errorMessage = `Failed to validate credentials:\n${!validationResult.prismaValid ? '- Prisma Cloud authentication failed\n' : ''}${!validationResult.cortexValid ? '- Cortex Cloud authentication failed\n' : ''}${validationResult.error ? `Error: ${validationResult.error}` : ''}`;
        alert(errorMessage);
        return;
      }

      if (!validationResult.prismaToken) {
        console.error('No Prisma token available');
        return;
      }

      // Create an array of promises for parallel execution
      const ingestorPromises = selectedItems.map(item => 
        handleItemIngestion(
          item,
          validationResult.prismaToken!,
          (progress) => {
            setItemStatuses(prev => prev.map(status =>
              status.id === item
                ? { ...status, progress }
                : status
            ));
          }
        )
      );

      try {
        // Execute all ingestors in parallel
        const results = await Promise.all(ingestorPromises);
        
        // Log results
        results.forEach(result => {
          if (!result.success) {
            console.error(`Failed to process ${result.item}:`, result.error);
          }
        });

        console.log('All ingestions completed');
      } catch (error) {
        console.error('Error during parallel ingestion:', error);
      }
    };

    window.addEventListener('start-migration', handleStartMigration);
    return () => window.removeEventListener('start-migration', handleStartMigration);
  }, [itemStatuses]);

  const hasEnforcementRules = selectedItems.includes('enforcementRules');

  return (
    <div className="settings-container">
      <div className="upgrade-status">
        <div className="upgrade-status-header">
          <h2 className="upgrade-status-title">Upgrade Status</h2>
          <div className="upgrade-progress">
            <span className="upgrade-progress-text">
              {itemStatuses.filter(item => item.status === 'completed').length} out of {selectedItems.length} completed
            </span>
            <div className="upgrade-progress-dots">
              {itemStatuses.map((item) => (
                <div 
                  key={item.id} 
                  className={`progress-dot ${item.status === 'completed' ? 'completed' : ''}`} 
                />
              ))}
            </div>
          </div>
        </div>

        <div className="status-items">
          {itemStatuses.map((item) => (
            <div key={item.id} className="status-item">
              <div className={`status-indicator ${item.status}`} />
              <span className="status-item-name">{item.name}</span>
              <span className="status-text">
                {item.status === 'completed' ? 'Completed' : 
                 item.status === 'in_progress' ? `${item.progress}%` :
                 'Pending...'}
              </span>
              {item.status === 'in_progress' && (
                <div className="item-progress-bar">
                  <div 
                    className="item-progress-fill"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              )}
            </div>
          ))}
          {hasEnforcementRules && (
            <div className="status-message">
              All hard fail configurations will be copied over with alert-only behavior
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
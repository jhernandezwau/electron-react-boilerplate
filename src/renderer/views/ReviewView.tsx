import React, { useState, useEffect } from 'react';
import PrismaAPIClient from '@configurations/prisma_client';
import CortexAPIClient from '@configurations/cortex_client';

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

  // Handle migration start
  useEffect(() => {
    const handleStartMigration = async () => {
      
      
      console.log('Starting migration...');

      console.log('Trying to login to Prisma Cloud...');

      const client = new PrismaAPIClient({
        accessKey: formData.prismaCloud.accessKey,
        secretKey: formData.prismaCloud.secretKey,
        baseURL:   formData.prismaCloud.apiUrl
      });

      client.makeLoginRequest().then(response => {
        console.log('Prisma Cloud login response:', response);
        const token = response.data.token;
        console.log('Prisma Cloud token:', token);
      })
      .catch(error => {
        console.error('Prisma Cloud login error:', error);
      });

      console.log('Trying to login to Cortex Cloud...');

      // Crear el cliente Cortex
      const cortexClient = new CortexAPIClient({
        accessKey: formData.cortexCloud.accessKey,
        secretKey: formData.cortexCloud.keyId,
        baseURL:   formData.cortexCloud.tenantUrl
      });

      try {
        // Obtener la URL del proxy desde el proceso principal
        const proxyUrl = await window.electron.getProxyUrl();
        console.log('Using proxy URL:', proxyUrl);
        
        // Configurar el cliente para usar el proxy
        cortexClient.setProxyUrl(proxyUrl);
        
        // Hacer la solicitud de login
        const response = await cortexClient.makeLoginRequest();
        console.log('Cortex Cloud login response:', response);
        
        // Verificar si la autenticación fue exitosa
        if (response.data === true || (typeof response.data === 'object' && response.data.token)) {
          console.log('Cortex Cloud authentication successful');
          // Aquí puedes actualizar el estado para mostrar éxito
        } else {
          console.error('Cortex Cloud authentication failed: Invalid credentials');
          // Aquí puedes mostrar un mensaje de error al usuario
          alert('Error de autenticación en Cortex Cloud: Credenciales inválidas');
        }
      } catch (error) {
        console.error('Cortex Cloud login error:', error);
        alert('Error de conexión con Cortex Cloud');
      }
      

      // setIsAnimating(true);
      
      // // Start a "thread" for each selected item
      // itemStatuses.forEach((item) => {
      //   const processingTime = Math.floor(Math.random() * 9000) + 1000; // Random time between 1-10 seconds
        
      //   // Update status to in_progress
      //   setItemStatuses(prev => prev.map(status => 
      //     status.id === item.id 
      //       ? { ...status, status: 'in_progress' as const }
      //       : status
      //   ));

      //   // Simulate progress updates
      //   let currentProgress = 0;
      //   const intervalTime = processingTime / 100; // Split total time into 100 updates

      //   const progressInterval = setInterval(() => {
      //     currentProgress += 1;
          
      //     setItemStatuses(prev => prev.map(status => 
      //       status.id === item.id 
      //         ? { 
      //             ...status, 
      //             progress: Math.min(currentProgress, 100),
      //             status: currentProgress >= 100 ? 'completed' as const : status.status
      //           }
      //         : status
      //     ));

      //     if (currentProgress >= 100) {
      //       clearInterval(progressInterval);
      //     }
      //   }, intervalTime);
      // });
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
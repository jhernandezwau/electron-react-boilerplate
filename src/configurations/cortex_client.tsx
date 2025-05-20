import axios from 'axios';

interface ClientConfig {
  accessKey: string;
  secretKey: string;
  baseURL: string;
}

interface LoginResponse {
  data: boolean | { token: string };
  status: number;
}

class CortexAPIClient {
  private accessKey: string;
  private secretKey: string;
  private baseURL: string;
  private proxyUrl: string | null = null;

  constructor(config: ClientConfig) {
    this.accessKey = config.accessKey;
    this.secretKey = config.secretKey;
    this.baseURL = config.baseURL;
  }

  // Método para establecer la URL del proxy
  setProxyUrl(url: string) {
    this.proxyUrl = url;
  }

  async makeLoginRequest(): Promise<LoginResponse> {
    // Usar el proxy si está disponible
    const url = this.proxyUrl 
      ? `${this.proxyUrl}/api_keys/validate/` 
      : `${this.baseURL}/api_keys/validate/`;
    
    // Configurar los headers con las credenciales
    const headers = {
      'Authorization': this.accessKey,
      'x-xdr-auth-id': this.secretKey,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    // Hacer la solicitud a través del proxy
    const response = await axios.post<boolean | { token: string }>(url, {}, {
      headers: headers
    });

    return {
      data: response.data,
      status: response.status
    };
  }
}

export default CortexAPIClient;
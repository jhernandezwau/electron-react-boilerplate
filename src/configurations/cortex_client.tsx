import axios from 'axios';

interface ClientConfig {
  accessKey: string;
  secretKey: string;
  baseURL: string;
}

interface LoginResponse {
  data: {
    token: string;
  };
  status: number;
}

class CortexAPIClient {
  private accessKey: string;
  private secretKey: string;
  private baseURL: string;

  constructor(config: ClientConfig) {
    this.accessKey = config.accessKey;
    this.secretKey = config.secretKey;
    this.baseURL = config.baseURL;
  }

  async makeLoginRequest(): Promise<LoginResponse> {
    const url = `${this.baseURL}/api_keys/validate/`;
    
    // We need to create the headers with the access key and secret key
    const headers = {
      'Authorization': this.accessKey,
      'x-xdr-auth-id': this.secretKey
    };

    const response = await axios.post<{ token: string }>(url, {}, {
      headers: headers
    });

    return {
      data: response.data,
      status: response.status
    };
  }
}

export default CortexAPIClient;
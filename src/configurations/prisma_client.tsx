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

interface IngestorResponse {
  data: {
    ingestor_data: string;
  };
  status: number;
}

class PrismaAPIClient {
  private accessKey: string;
  private secretKey: string;
  private baseURL: string;

  constructor(config: ClientConfig) {
    this.accessKey = config.accessKey;
    this.secretKey = config.secretKey;
    this.baseURL = config.baseURL;
  }

  async makeLoginRequest(): Promise<LoginResponse> {
    const url = `${this.baseURL}/login`;
    const payload = {
      username: this.accessKey,
      password: this.secretKey,
    };

    const response = await axios.post<{ token: string }>(url, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return {
      data: response.data,
      status: response.status
    };
  }

  async makeIngestorRequest(endpoint: string, params: any, accessToken: string): Promise<IngestorResponse> {
    const url = `${this.baseURL}${endpoint}`;
    console.log('Trying to call:', url);
    const headers = {
      "Content-Type": "application/json",
      "x-redlock-auth": accessToken
    }
    const response = await axios.get(url, { params, headers });
    return {
      data: response.data as { ingestor_data: string },
      status: response.status
    };
  }
}

export default PrismaAPIClient;
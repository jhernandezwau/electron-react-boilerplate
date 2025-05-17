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
}

export default PrismaAPIClient;
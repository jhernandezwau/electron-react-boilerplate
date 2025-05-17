interface CloudCredential {
  name: string;
  apiUrl: string;
  consoleUrl: string;
  accessKey: string;
  secretKey: string;
  tenantId: string;
}

const cloudCredentials: CloudCredential[] = [
  {
    name: 'PRISMA_CLOUD',
    apiUrl: 'https://api2.prismacloud.io',
    consoleUrl: 'https://us-east1.cloud.twistlock.com/us-2-158320372',
    accessKey: 'b56c3ab2-12b8-4191-a2de-02077bf2c74d',
    secretKey: 'I29D88tbWRvuWiMn1xBW19EKL+A=',
    tenantId: '54181618798048'
  },
  {
    name: 'CORTEX_CLOUD',
    apiUrl: 'https://api-pcscortexcloud.xdr.us.paloaltonetworks.com',
    consoleUrl: '',
    accessKey: 'RgiLWlxpKIeh1pQXlwQJcULrhmdK4VEQo25Gi8Xa7MPUjgtw6WdpQrWZ164bEmGHJlkWHLUr2wDDrniCu823JI0XgoknhhbimNRbrdTT2r53LwwSEiPtqyT2DTcB9Iv7',
    secretKey: '61',
    tenantId: ''
  }
];

export default cloudCredentials; 
const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = process.env.SITE_URL || 'http://localhost:3000';
const CRON_SECRET = process.env.CRON_SECRET;

async function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https://');
    const client = isHttps ? https : http;
    
    const requestOptions = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      timeout: 30000
    };

    // Add authorization header if CRON_SECRET is set
    if (CRON_SECRET && options.method === 'POST') {
      requestOptions.headers['Authorization'] = `Bearer ${CRON_SECRET}`;
    }

    const req = client.request(url, requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

async function testCronEndpoints() {
  console.log('🧪 Testing cron endpoints...\n');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Cron Secret: ${CRON_SECRET ? 'Set' : 'Not set'}\n`);

  const endpoints = [
    {
      name: 'Content Pipeline (GET)',
      url: `${BASE_URL}/api/cron/content-pipeline`,
      method: 'GET'
    },
    {
      name: 'Content Pipeline (POST)',
      url: `${BASE_URL}/api/cron/content-pipeline`,
      method: 'POST'
    },
    {
      name: 'Quality Check (GET)',
      url: `${BASE_URL}/api/cron/quality-check`,
      method: 'GET'
    },
    {
      name: 'Quality Check (POST)',
      url: `${BASE_URL}/api/cron/quality-check`,
      method: 'POST'
    }
  ];

  for (const endpoint of endpoints) {
    console.log(`Testing: ${endpoint.name}`);
    console.log(`URL: ${endpoint.url}`);
    
    try {
      const response = await makeRequest(endpoint.url, {
        method: endpoint.method
      });
      
      console.log(`Status: ${response.status}`);
      
      if (response.status === 200) {
        console.log('✅ Success');
        if (response.data && typeof response.data === 'object') {
          console.log(`Response: ${JSON.stringify(response.data, null, 2)}`);
        }
      } else if (response.status === 401) {
        console.log('🔒 Unauthorized (check CRON_SECRET)');
      } else if (response.status === 404) {
        console.log('❌ Not Found (check deployment)');
      } else {
        console.log(`⚠️  Unexpected status: ${response.status}`);
        if (response.data) {
          console.log(`Error: ${JSON.stringify(response.data, null, 2)}`);
        }
      }
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
    
    console.log('---\n');
  }

  // Test with manual trigger
  console.log('🚀 Testing manual content pipeline trigger...');
  try {
    const response = await makeRequest(`${BASE_URL}/api/cron/content-pipeline`, {
      method: 'POST',
      body: { manual: true }
    });
    
    console.log(`Status: ${response.status}`);
    if (response.data) {
      console.log(`Response: ${JSON.stringify(response.data, null, 2)}`);
    }
  } catch (error) {
    console.log(`❌ Manual trigger failed: ${error.message}`);
  }
}

// Run the test
testCronEndpoints().catch(console.error);

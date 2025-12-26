import { createServer } from 'http';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { createDefaultDayState } from '@day-timeline/shared';

const PORT = 3001;
const BUCKET = process.env.S3_BUCKET || 'day-timeline-storage';
const DEV_USER_ID = 'dev-user-001';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  endpoint: process.env.AWS_ENDPOINT || 'http://localhost:4566',
  forcePathStyle: true,
  credentials: {
    accessKeyId: 'test',
    secretAccessKey: 'test',
  },
});

async function getObject(key) {
  try {
    const response = await s3Client.send(
      new GetObjectCommand({ Bucket: BUCKET, Key: key })
    );
    const body = await response.Body?.transformToString();
    return body ? JSON.parse(body) : null;
  } catch (error) {
    if (error.name === 'NoSuchKey' || error.name === 'NotFound') {
      return null;
    }
    throw error;
  }
}

async function putObject(key, data) {
  await s3Client.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: JSON.stringify(data, null, 2),
      ContentType: 'application/json',
    })
  );
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,X-Dev-User-Id',
    'Access-Control-Allow-Methods': 'GET,PUT,OPTIONS',
  });
  res.end(JSON.stringify(data));
}

async function handleGetState(req, res, date) {
  const stateKey = `users/${DEV_USER_ID}/state/${date}.json`;

  try {
    let state = await getObject(stateKey);

    if (!state) {
      state = createDefaultDayState(DEV_USER_ID, date);
      await putObject(stateKey, state);
    }

    sendJson(res, 200, { success: true, data: state });
  } catch (error) {
    console.error('Error getting state:', error);
    sendJson(res, 500, {
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message },
    });
  }
}

async function handlePutState(req, res, date) {
  const stateKey = `users/${DEV_USER_ID}/state/${date}.json`;

  try {
    let body = '';
    for await (const chunk of req) {
      body += chunk;
    }
    const data = JSON.parse(body);

    const existing = await getObject(stateKey);

    const state = {
      ...data,
      userId: DEV_USER_ID,
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await putObject(stateKey, state);
    sendJson(res, 200, { success: true, data: state });
  } catch (error) {
    console.error('Error saving state:', error);
    sendJson(res, 500, {
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message },
    });
  }
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    sendJson(res, 200, {});
    return;
  }

  // Parse route
  if (url.pathname === '/state') {
    const date = url.searchParams.get('date');

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      sendJson(res, 400, {
        success: false,
        error: { code: 'INVALID_DATE', message: 'Date required in YYYY-MM-DD format' },
      });
      return;
    }

    if (req.method === 'GET') {
      await handleGetState(req, res, date);
    } else if (req.method === 'PUT') {
      await handlePutState(req, res, date);
    } else {
      sendJson(res, 405, {
        success: false,
        error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed' },
      });
    }
    return;
  }

  sendJson(res, 404, {
    success: false,
    error: { code: 'NOT_FOUND', message: 'Not found' },
  });
});

server.listen(PORT, () => {
  console.log(`Local API server running at http://localhost:${PORT}`);
  console.log(`Using S3 bucket: ${BUCKET}`);
  console.log(`S3 endpoint: ${process.env.AWS_ENDPOINT || 'http://localhost:4566'}`);
});

import type { APIGatewayProxyResultV2 } from 'aws-lambda';
import type { ApiResponse } from '@day-timeline/shared';

const corsHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Dev-User-Id',
  'Access-Control-Allow-Methods': 'GET,PUT,OPTIONS',
};

export function success<T>(data: T): APIGatewayProxyResultV2 {
  const response: ApiResponse<T> = { success: true, data };
  return {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify(response),
  };
}

export function error(
  statusCode: number,
  code: string,
  message: string
): APIGatewayProxyResultV2 {
  const response: ApiResponse<never> = {
    success: false,
    error: { code, message },
  };
  return {
    statusCode,
    headers: corsHeaders,
    body: JSON.stringify(response),
  };
}

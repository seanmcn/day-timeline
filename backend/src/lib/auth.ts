import type { APIGatewayProxyEventV2 } from 'aws-lambda';

export interface AuthContext {
  userId: string;
  email: string;
}

export function extractAuthContext(
  event: APIGatewayProxyEventV2
): AuthContext | null {
  // In production, API Gateway JWT Authorizer adds claims to the request context
  const claims = (
    event.requestContext as {
      authorizer?: { jwt?: { claims?: Record<string, unknown> } };
    }
  )?.authorizer?.jwt?.claims;

  if (claims) {
    return {
      userId: claims.sub as string,
      email: claims.email as string,
    };
  }

  // For local development, check for custom header
  const devUserId = event.headers?.['x-dev-user-id'];
  if (process.env.IS_LOCAL === 'true' && devUserId) {
    return {
      userId: devUserId,
      email: 'test@example.com',
    };
  }

  return null;
}

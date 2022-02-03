export function isProduction(): boolean {
  return process.env.NODE_ENV === 'staging';
}

export function getGatewayCredentials(): { user: string, pass: string } {
  const { GATEWAY_USER, GATEWAY_PASS } = process.env;

  if (!GATEWAY_USER || !GATEWAY_PASS) {
    throw new Error('Gateway credentials are not set');
  }

  return { user: GATEWAY_USER, pass: GATEWAY_PASS };
}

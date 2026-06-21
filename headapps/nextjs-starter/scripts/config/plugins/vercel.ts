import { JssConfig } from 'lib/config';
import { ConfigPlugin } from '..';

const isPlaceholderPublicUrl = (value?: string): boolean => {
  if (!value) {
    return true;
  }

  return value === 'http://localhost:3000' || value.includes('.localhost');
};

const getVercelPublicUrl = (): string | undefined => {
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return undefined;
};

/**
 * Uses Vercel-provided hostnames when PUBLIC_URL is not configured.
 * Required so assetPrefix and static assets resolve on Vercel deployments.
 */
class VercelPlugin implements ConfigPlugin {
  order = 90;

  async exec(config: JssConfig) {
    if (!isPlaceholderPublicUrl(config.publicUrl)) {
      return config;
    }

    const vercelPublicUrl = getVercelPublicUrl();

    if (!vercelPublicUrl) {
      return config;
    }

    return Object.assign({}, config, {
      publicUrl: vercelPublicUrl,
    });
  }
}

export const vercelPlugin = new VercelPlugin();

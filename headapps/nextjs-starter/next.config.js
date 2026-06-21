const jssConfig = require('./src/temp/config');
const plugins = require('./src/temp/next-config-plugins') || {};

const isPlaceholderPublicUrl = (value) => {
  if (!value) {
    return true;
  }

  return value === 'http://localhost:3000' || value.includes('.localhost');
};

const resolvePublicUrl = () => {
  const configuredUrl = jssConfig.publicUrl?.replace(/\/$/, '');

  if (!isPlaceholderPublicUrl(configuredUrl)) {
    return configuredUrl;
  }

  if (process.env.PUBLIC_URL) {
    return process.env.PUBLIC_URL.replace(/\/$/, '');
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return configuredUrl || '';
};

const publicUrl = resolvePublicUrl();

const getHostname = (value) => {
  if (!value) {
    return null;
  }

  try {
    return new URL(value).hostname;
  } catch {
    return null;
  }
};

const getSitecoreImageRemotePatterns = () => {
  const hostnames = new Set(
    [
      getHostname(jssConfig.sitecoreApiHost),
      getHostname(jssConfig.graphQLEndpoint),
      getHostname(jssConfig.sitecoreEdgeUrl),
      getHostname(process.env.NEXT_PUBLIC_SITECORE_MEDIA_HOST),
      'xmcloudcm.localhost',
    ].filter(Boolean)
  );

  return [...hostnames].flatMap((hostname) => [
    {
      protocol: 'https',
      hostname,
      port: '',
    },
    {
      protocol: 'http',
      hostname,
      port: '',
    },
  ]);
};

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  // Set assetPrefix to our public URL
  assetPrefix: publicUrl,

  // Allow specifying a distinct distDir when concurrently running app in a container
  distDir: process.env.NEXTJS_DIST_DIR || '.next',

  // Make the same PUBLIC_URL available as an environment variable on the client bundle
  env: {
    PUBLIC_URL: publicUrl,
  },

  i18n: {
    // These are all the locales you want to support in your application.
    // These should generally match (or at least be a subset of) those in Sitecore.
    locales: ['en'],
    // This is the locale that will be used when visiting a non-locale
    // prefixed path e.g. `/styleguide`.
    defaultLocale: jssConfig.defaultLanguage,
  },

  // Enable React Strict Mode
  reactStrictMode: true,

  // Disable the X-Powered-By header. Follows security best practices.
  poweredByHeader: false,

  // use this configuration to ensure that only images from the whitelisted domains
  // can be served from the Next.js Image Optimization API
  // see https://nextjs.org/docs/app/api-reference/components/image#remotepatterns
  images: {
    remotePatterns: [
      ...getSitecoreImageRemotePatterns(),
      {
        protocol: 'https',
        hostname: 'edge*.**',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'xmc-*.**',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'feaas*.blob.core.windows.net',
        port: '',
      },
    ],
  },

  async rewrites() {
    // When in connected mode we want to proxy Sitecore paths off to Sitecore
    return [
      // API endpoints
      {
        source: '/sitecore/api/:path*',
        destination: `${jssConfig.sitecoreApiHost}/sitecore/api/:path*`,
      },
      // media items
      {
        source: '/-/:path*',
        destination: `${jssConfig.sitecoreApiHost}/-/:path*`,
      },
      // healthz check
      {
        source: '/healthz',
        destination: '/api/healthz',
      },
      // rewrite for Sitecore service pages
      {
        source: '/sitecore/service/:path*',
        destination: `${jssConfig.sitecoreApiHost}/sitecore/service/:path*`,
      },
    ];
  },
};

module.exports = () => {
  // Run the base config through any configured plugins
  return Object.values(plugins).reduce((acc, plugin) => plugin(acc), nextConfig);
};

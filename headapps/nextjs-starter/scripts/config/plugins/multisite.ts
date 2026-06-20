import chalk from 'chalk';
import { GraphQLSiteInfoService, SiteInfo } from '@sitecore-jss/sitecore-jss-nextjs';
import { createGraphQLClientFactory } from 'lib/graphql-client-factory/create';
import { JssConfig } from 'lib/config';
import { ConfigPlugin } from '..';

/**
 * This plugin will set the "sites" config prop.
 * By default this will attempt to fetch site information directly from Sitecore (using the GraphQLSiteInfoService).
 * You could easily modify this to fetch from another source such as a static JSON file instead.
 */
class MultisitePlugin implements ConfigPlugin {
  order = 11;

  async exec(config: JssConfig) {
    let sites: SiteInfo[] = [];
    console.log('Fetching site information');
    try {
      const siteInfoService = new GraphQLSiteInfoService({
        clientFactory: createGraphQLClientFactory(config),
      });
      sites = await siteInfoService.fetchSiteInfo();
    } catch (error) {
      console.error(chalk.red('Error fetching site information'));
      console.error(error);
    }

    if (!sites.length) {
      const envSites = process.env.SITES;
      if (envSites) {
        try {
          sites = JSON.parse(envSites) as SiteInfo[];
        } catch {
          console.error(chalk.red('SITES environment variable is not valid JSON.'));
        }
      }
    }

    if (!sites.length && config.sitecoreSiteName) {
      sites = [
        {
          name: config.sitecoreSiteName,
          hostName: '*',
          language: config.defaultLanguage || 'en',
        },
      ];
      console.log(
        chalk.yellow(
          `Using fallback site configuration for "${config.sitecoreSiteName}" (GraphQL site query unavailable).`
        )
      );
    }

    return Object.assign({}, config, {
      sites: JSON.stringify(sites),
    });
  }
}

export const multisitePlugin = new MultisitePlugin();

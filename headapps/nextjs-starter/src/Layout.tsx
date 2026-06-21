/**
 * This Layout is needed for Starter Kit.
 */
import { JSX } from 'react';
import Head from 'next/head';
import {
  LayoutServiceData,
  Field,
  HTMLLink,
  Placeholder,
  DesignLibrary,
  RenderingType,
} from '@sitecore-jss/sitecore-jss-nextjs';
import config from 'temp/config';
import Scripts from 'src/Scripts';
import { getPageItemId, getPageTitle } from 'lib/search/page-meta';

// Prefix public assets with a public URL to enable compatibility with Sitecore Experience Editor.
// If you're not supporting the Experience Editor, you can remove this.
const publicUrl = config.publicUrl;

interface LayoutProps {
  layoutData: LayoutServiceData;
  headLinks: HTMLLink[];
}

interface RouteFields {
  [key: string]: unknown;
  Title?: Field;
}

const Layout = ({ layoutData, headLinks }: LayoutProps): JSX.Element => {
  const { route } = layoutData.sitecore;
  const fields = route?.fields as RouteFields;
  const isPageEditing = layoutData.sitecore.context.pageEditing;
  const mainClassPageEditing = isPageEditing ? 'editing-mode' : 'prod-mode';
  const pageTitle = getPageTitle(layoutData);
  const pageItemId = getPageItemId(layoutData);

  const renderContent = () => (
    <>
      <header>
        <div id="header">{route && <Placeholder name="headless-header" rendering={route} />}</div>
      </header>
      <main>
        <div id="content">{route && <Placeholder name="headless-main" rendering={route} />}</div>
      </main>
      <footer>
        <div id="footer">{route && <Placeholder name="headless-footer" rendering={route} />}</div>
      </footer>
    </>
  );

  return (
    <>
      <Scripts />
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={fields?.Title?.value?.toString() || pageTitle} />
        <meta key="og:type" property="og:type" content="website_content" />
        <meta key="og:title" property="og:title" content={pageTitle} />
        {pageItemId ? <meta key="og:id" property="og:id" content={pageItemId} /> : null}
        <link rel="icon" href={`${publicUrl}/favicon.ico`} />
        {headLinks.map((headLink) => (
          <link rel={headLink.rel} key={headLink.href} href={headLink.href} />
        ))}
      </Head>

      {/* root placeholder for the app, which we add components to using route data */}
      <div className={mainClassPageEditing}>
        {layoutData.sitecore.context.renderingType === RenderingType.Component ? (
          <DesignLibrary {...layoutData} />
        ) : (
          renderContent()
        )}
      </div>
    </>
  );
};

export default Layout;

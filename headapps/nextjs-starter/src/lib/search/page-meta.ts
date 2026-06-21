import { LayoutServiceData } from '@sitecore-jss/sitecore-jss-nextjs';

type RouteFields = {
  Title?: { value?: string };
};

export const getPageTitle = (layoutData: LayoutServiceData): string => {
  const route = layoutData.sitecore.route;
  const fields = route?.fields as RouteFields | undefined;

  return fields?.Title?.value?.toString() || route?.displayName || route?.name || 'Page';
};

export const getPageItemId = (layoutData: LayoutServiceData): string | undefined =>
  layoutData.sitecore.route?.itemId;

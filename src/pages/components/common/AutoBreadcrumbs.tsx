import { BreadcrumbItem, Breadcrumbs, Divider, cn } from '@nextui-org/react';
import { useRouter } from 'next/router';

const ROUTE_DICT: Dict<string> = {
  '/Profile': 'User Center',
  '/Profile/MyBadges': 'My Badges',
  '/Profile/MyAssets': 'My Asset',
  '/LoyaltyProgram/earn': 'Earn Moon Beams',
  '/LoyaltyProgram/event': 'Event Details',
  '/NFT/Merge/history': 'Merge History',
};

interface Props {
  hrefs?: string[];
  hideDivider?: boolean;
  className?: string;
}

interface PathItem {
  path: string;
  label?: string;
}

export default function AutoBreadcrumbs(props: Props) {
  const { hrefs, hideDivider, className } = props;
  const router = useRouter();
  let paths: PathItem[] = [];

  if (hrefs) {
    paths = [...hrefs, router.route].map((href) => {
      let label = ROUTE_DICT[href];

      if (!label) {
        const last = href.match(/(?=\/)[^\/]+$/)![0];
        label = last[0] + last.substring(1);
      }

      return {
        path: href,
        label,
      };
    });
  } else {
    paths = router.route
      .replace(/^\/+|\/+$/g, '')
      .split('/')
      .map((path) => ({
        path,
        label: ROUTE_DICT[path] || path[0] + path.substring(1),
      }));
  }

  return (
    <>
      <Breadcrumbs className={cn(['text-base', className])}>
        {paths.map((item, index) => (
          <BreadcrumbItem key={index} href={item.path}>
            {item.label}
          </BreadcrumbItem>
        ))}
      </Breadcrumbs>

      {hideDivider || <Divider className="mt-[1.1875rem] bg-[rgba(255,255,255,0.1)]" />}
    </>
  );
}

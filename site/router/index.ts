import { lazy, type RouteConfig } from 'app:routes';

const router: RouteConfig[] = [
  {
    path: '/',
    element: lazy(() => import('@/layout')),
  },
];

export default router;

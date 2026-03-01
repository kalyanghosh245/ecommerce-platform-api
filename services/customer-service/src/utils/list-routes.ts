import { INestApplication } from '@nestjs/common';

export function listRoutes(app: INestApplication, logger: any) {
  try {
    const server = app.getHttpServer();
    const router = server?._events?.request?._router;
    
    if (!router || !router.stack) {
      logger.warn('⚠️  Could not extract routes');
      return;
    }

    const routes = router.stack
      .filter((layer: any) => layer?.route)
      .map((layer: any) => {
        const path = layer.route?.path;
        const methods = layer.route?.methods || {};
        const method = Object.keys(methods).find(m => methods[m])?.toUpperCase() || 'GET';
        return { method, path };
      })
      .filter((route: any) => route.path);

    if (routes.length > 0) {
      logger.log(`🔍 Registered Routes (${routes.length}):`);
      routes.forEach((route: any) => {
        logger.log(`   ${route.method.padEnd(6)} ${route.path}`);
      });
    }
  } catch (e) {
    logger.warn('⚠️  Route listing failed:', e.message);
  }
}
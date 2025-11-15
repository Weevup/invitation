export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config')
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config')
  }
}

export const onRequestError = async (err: unknown, request: {
  path: string
}, context: {
  routerKind: string
  routePath: string
}) => {
  // Automatically forward all errors to Sentry
  // This will be picked up by Sentry.init in sentry.server.config.ts
  await import('@sentry/nextjs').then((Sentry) => {
    Sentry.captureException(err, {
      extra: {
        request: {
          path: request.path,
        },
        context: {
          routerKind: context.routerKind,
          routePath: context.routePath,
        },
      },
    })
  })
}

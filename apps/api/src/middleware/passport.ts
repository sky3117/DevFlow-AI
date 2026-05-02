import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { prisma } from '@devflow/db';

export function configurePassport(): void {
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID!,
        clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        callbackURL: `${process.env.BACKEND_URL || 'http://localhost:5006'}/auth/github/callback`,
        scope: ['user:email'],
      },
      async (_accessToken: string, _refreshToken: string, profile: { id: string; emails?: { value: string }[]; username?: string }, done: (err: Error | null, user?: unknown) => void) => {
        try {
          const email = profile.emails?.[0]?.value ?? null;
          const user = await prisma.user.upsert({
            where: { githubId: profile.id },
            update: { email },
            create: {
              githubId: profile.id,
              email,
              role: 'member',
            },
          });
          done(null, user);
        } catch (err) {
          done(err as Error);
        }
      }
    )
  );

  passport.serializeUser((user: unknown, done) => done(null, user));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  passport.deserializeUser((user: any, done) => done(null, user as Express.User));
}

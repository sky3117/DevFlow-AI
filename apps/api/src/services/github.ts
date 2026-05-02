const GITHUB_API = 'https://api.github.com';

async function getInstallationToken(installationId: number): Promise<string> {
  // For simplicity we use the GITHUB_WEBHOOK_SECRET as a PAT when no app token exists.
  // In production you'd generate a JWT from the GitHub App private key.
  return process.env.GITHUB_TOKEN || '';
}

async function githubFetch(url: string, token: string, options: RequestInit = {}): Promise<Response> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `token ${token}`;
  return fetch(url, { ...options, headers });
}

export async function fetchPRDiff(
  owner: string,
  repo: string,
  prNumber: number,
  installationId?: number
): Promise<string> {
  const token = installationId
    ? await getInstallationToken(installationId)
    : (process.env.GITHUB_TOKEN || '');

  const res = await githubFetch(
    `${GITHUB_API}/repos/${owner}/${repo}/pulls/${prNumber}`,
    token,
    { headers: { Accept: 'application/vnd.github.v3.diff' } }
  );

  if (!res.ok) {
    throw new Error(`GitHub API error: ${res.status} ${await res.text()}`);
  }

  return res.text();
}

export async function postGitHubComment(
  owner: string,
  repo: string,
  prNumber: number,
  body: string,
  installationId?: number
): Promise<void> {
  const token = installationId
    ? await getInstallationToken(installationId)
    : (process.env.GITHUB_TOKEN || '');

  const res = await githubFetch(
    `${GITHUB_API}/repos/${owner}/${repo}/issues/${prNumber}/comments`,
    token,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body }),
    }
  );

  if (!res.ok) {
    throw new Error(`Failed to post GitHub comment: ${res.status} ${await res.text()}`);
  }
}

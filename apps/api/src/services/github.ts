const GITHUB_API = 'https://api.github.com';

/** Validates that owner and repo are safe alphanumeric GitHub identifiers to prevent SSRF */
function validateGitHubIdentifier(value: string, name: string): void {
  // GitHub usernames/org names and repo names: alphanumeric, hyphens, underscores, dots
  if (!/^[a-zA-Z0-9._-]{1,100}$/.test(value)) {
    throw new Error(`Invalid GitHub ${name}: "${value}"`);
  }
}

async function getInstallationToken(_installationId: number): Promise<string> {
  // For simplicity we use the GITHUB_TOKEN env var when no app token exists.
  // In production you'd generate a JWT from the GitHub App private key.
  return process.env.GITHUB_TOKEN || '';
}

/**
 * Make a request to the GitHub REST API.
 * The `path` must start with '/' and is appended to the fixed GITHUB_API base URL
 * so the full URL is always rooted at api.github.com.
 */
async function githubFetch(path: string, token: string, options: RequestInit = {}): Promise<Response> {
  const url = `${GITHUB_API}${path}`;
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
  validateGitHubIdentifier(owner, 'owner');
  validateGitHubIdentifier(repo, 'repo');

  const token = installationId
    ? await getInstallationToken(installationId)
    : (process.env.GITHUB_TOKEN || '');

  const res = await githubFetch(
    `/repos/${owner}/${repo}/pulls/${prNumber}`,
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
  validateGitHubIdentifier(owner, 'owner');
  validateGitHubIdentifier(repo, 'repo');

  const token = installationId
    ? await getInstallationToken(installationId)
    : (process.env.GITHUB_TOKEN || '');

  const res = await githubFetch(
    `/repos/${owner}/${repo}/issues/${prNumber}/comments`,
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


/**
 * Minimal GraphQL client for the CareerNext API.
 *
 * Auth: SSO via CareerNext's httpOnly `refreshToken` cookie (same-site in
 * dev, shared parent domain in prod). On load we call the `refreshToken`
 * mutation with credentials included — the API mints a short-lived access
 * token held in memory only. Nothing auth-related ever touches the URL or
 * localStorage, mirroring CareerNext's own web client.
 */

const GRAPHQL_URL =
  import.meta.env.VITE_CAREERNEXT_GRAPHQL_URL ?? "http://localhost:4000/graphql";

export const CAREERNEXT_WEB_URL =
  import.meta.env.VITE_CAREERNEXT_WEB_URL ?? "http://localhost:3000";

interface GraphQLError {
  message: string;
  extensions?: { code?: string };
}

let accessToken: string | null = null;

export interface CareerNextUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

async function rawRequest<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<{ data?: T; errors?: GraphQLError[] }> {
  const response = await fetch(GRAPHQL_URL, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify({ query, variables }),
  });
  return response.json();
}

const REFRESH_MUTATION = `
  mutation RefreshToken {
    refreshToken {
      accessToken
      user { id email firstName lastName }
    }
  }
`;

/**
 * Silent SSO bootstrap: exchange the shared refresh cookie for an access
 * token. Returns the signed-in user, or null when there is no valid session
 * (caller shows the sign-in screen).
 */
export async function bootstrapAuth(): Promise<CareerNextUser | null> {
  try {
    const result = await rawRequest<{
      refreshToken: { accessToken: string; user: CareerNextUser };
    }>(REFRESH_MUTATION);
    if (!result.data?.refreshToken) return null;
    accessToken = result.data.refreshToken.accessToken;
    return result.data.refreshToken.user;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return accessToken !== null;
}

/**
 * Authenticated request. The access token lives 15 minutes — on an auth
 * error, silently re-refresh once and retry, so long editing sessions
 * don't fail on save.
 */
export async function gqlRequest<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  let result = await rawRequest<T>(query, variables);
  const isAuthError = result.errors?.some(
    (e) => e.extensions?.code === "UNAUTHENTICATED" || /unauthorized/i.test(e.message),
  );
  if (isAuthError) {
    const user = await bootstrapAuth();
    if (!user) throw new Error("Your session has expired. Please sign in to CareerNext again.");
    result = await rawRequest<T>(query, variables);
  }
  if (result.errors?.length) {
    throw new Error(result.errors[0]?.message ?? "Request failed.");
  }
  if (!result.data) {
    throw new Error("Empty response from CareerNext.");
  }
  return result.data;
}

// --- Profile (prefill source for a new resume) ---

export interface CareerNextProfile {
  headline: string | null;
  bio: string | null;
  skills: { name: string }[];
  experiences: {
    company: string;
    title: string;
    startDate: string;
    endDate: string | null;
    isCurrent: boolean;
    description: string | null;
  }[];
  educations: {
    institution: string;
    degree: string;
    fieldOfStudy: string | null;
    startDate: string;
    endDate: string | null;
  }[];
}

export async function fetchMyProfile(): Promise<CareerNextProfile> {
  const data = await gqlRequest<{ myProfile: CareerNextProfile }>(`
    query MyProfile {
      myProfile {
        headline
        bio
        skills { name }
        experiences { company title startDate endDate isCurrent description }
        educations { institution degree fieldOfStudy startDate endDate }
      }
    }
  `);
  return data.myProfile;
}

// --- Resume drafts (CareerNext owns the structured content) ---

export interface ResumeDraftDto {
  id: string;
  title: string;
  template: string;
  content: string;
}

const DRAFT_FIELDS = "id title template content";

export async function fetchResumeDraft(id: string): Promise<ResumeDraftDto> {
  const data = await gqlRequest<{ resumeDraft: ResumeDraftDto }>(
    `query ResumeDraft($id: ID!) { resumeDraft(id: $id) { ${DRAFT_FIELDS} } }`,
    { id },
  );
  return data.resumeDraft;
}

export async function createResumeDraft(input: {
  title: string;
  template: string;
  content: string;
}): Promise<ResumeDraftDto> {
  const data = await gqlRequest<{ createResumeDraft: ResumeDraftDto }>(
    `mutation CreateResumeDraft($input: CreateResumeDraftInput!) {
      createResumeDraft(input: $input) { ${DRAFT_FIELDS} }
    }`,
    { input },
  );
  return data.createResumeDraft;
}

export async function updateResumeDraft(
  id: string,
  input: { title?: string; template?: string; content?: string },
): Promise<ResumeDraftDto> {
  const data = await gqlRequest<{ updateResumeDraft: ResumeDraftDto }>(
    `mutation UpdateResumeDraft($id: ID!, $input: UpdateResumeDraftInput!) {
      updateResumeDraft(id: $id, input: $input) { ${DRAFT_FIELDS} }
    }`,
    { id, input },
  );
  return data.updateResumeDraft;
}

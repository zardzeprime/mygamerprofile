export type NexusToolBridgeId = "github" | "supabase" | "lovable";

export type NexusToolBridgeDefinition = {
  id: NexusToolBridgeId;
  name: string;
  purpose: string;
  transport: "github-app" | "management-api" | "mcp-oauth";
  status: "planned" | "ready-for-auth" | "connected-by-host";
  destructiveActionsRequireApproval: boolean;
  notes: readonly string[];
};

/**
 * Tool bridges are deliberately separate from model providers.
 *
 * OpenAI/Gemini/Anthropic provide inference. GitHub/Supabase/Lovable provide
 * project actions and context. Keeping them separate prevents NEXUS from
 * treating a build tool as if it were a generic language model.
 */
export const NEXUS_TOOL_BRIDGES: Record<NexusToolBridgeId, NexusToolBridgeDefinition> = {
  github: {
    id: "github",
    name: "GitHub",
    purpose: "Inspect code, create branches/commits/PRs and review repository state.",
    transport: "github-app",
    status: "ready-for-auth",
    destructiveActionsRequireApproval: true,
    notes: [
      "Prefer a repository-scoped GitHub App over a personal access token.",
      "Default write flow should be branch -> review -> merge, not direct destructive edits.",
    ],
  },
  supabase: {
    id: "supabase",
    name: "Supabase",
    purpose: "Inspect schema, apply reviewed migrations and manage supported backend resources.",
    transport: "management-api",
    status: "ready-for-auth",
    destructiveActionsRequireApproval: true,
    notes: [
      "Use a project-limited management token or OAuth grant.",
      "Never expose service-role or management credentials to the browser.",
    ],
  },
  lovable: {
    id: "lovable",
    name: "Lovable",
    purpose: "Send project tasks to the Lovable Agent and inspect project/build state.",
    transport: "mcp-oauth",
    status: "ready-for-auth",
    destructiveActionsRequireApproval: true,
    notes: [
      "Lovable is a tool/agent bridge, not a generic inference provider for arbitrary chat.",
      "Use the official Lovable MCP endpoint with OAuth when the NEXUS runtime gains an MCP client.",
    ],
  },
};

export const NEXUS_LOVABLE_MCP_URL = "https://mcp.lovable.dev" as const;

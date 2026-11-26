import { describe, expect, it } from "vitest";
import { parseSkillFrontmatter } from "@/lib/skill-parser";

describe("parseSkillFrontmatter", () => {
  it("extracts valid name, description, word count and checks kebab-case", () => {
    const md = `---
name: my-custom-skill
description: Use this skill when building Next.js storefronts on Vercel.
---

# My Custom Skill

Step 1: Verify layout and colors.`;

    const parsed = parseSkillFrontmatter(md);
    expect(parsed.valid).toBe(true);
    expect(parsed.name).toBe("my-custom-skill");
    expect(parsed.description).toContain("Next.js storefronts");
    expect(parsed.issues).toHaveLength(0);
    expect(parsed.wordCount).toBeGreaterThan(5);
  });

  it("reports missing frontmatter or invalid kebab-case name", () => {
    const parsed = parseSkillFrontmatter("---\nname: Bad Name\n---\n\nBody only");
    expect(parsed.valid).toBe(false);
    expect(parsed.issues.length).toBeGreaterThanOrEqual(2);
  });
});

export interface ParsedSkillResult {
  valid: boolean;
  name: string | null;
  description: string | null;
  body: string;
  wordCount: number;
  issues: string[];
  installSnippet: string;
}

export function parseSkillFrontmatter(markdown: string): ParsedSkillResult {
  const normalized = markdown.replace(/\r\n/g, "\n").trim();
  const issues: string[] = [];
  let name: string | null = null;
  let description: string | null = null;
  let body = normalized;

  const fmMatch = normalized.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!fmMatch) {
    issues.push("Thiếu khối YAML frontmatter (--- ... ---) ở đầu file SKILL.md.");
  } else {
    const frontmatter = fmMatch[1];
    body = fmMatch[2].trim();

    const nameMatch = frontmatter.match(/^name:\s*(.+)$/m);
    if (nameMatch) {
      name = nameMatch[1].trim().replace(/^["']|["']$/g, "");
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name)) {
        issues.push("Trường name phải dùng chữ thường dạng kebab-case (ví dụ: my-skill).");
      }
    } else {
      issues.push("Thiếu trường bắt buộc: name.");
    }

    const descBlockMatch = frontmatter.match(
      /^description:\s*(?:>-\s*\n([\s\S]*?)(?=^\w+:|\s*$)|(.+))$/m
    );
    if (descBlockMatch) {
      const rawDesc = (descBlockMatch[1] || descBlockMatch[2] || "")
        .replace(/\n\s*/g, " ")
        .trim()
        .replace(/^["']|["']$/g, "");
      if (rawDesc.length > 0) {
        description = rawDesc;
      }
    }

    if (!description || description.length < 10) {
      issues.push("Thiếu hoặc mô tả description quá ngắn (nên nêu rõ khi nào agent kích hoạt skill).");
    }
  }

  if (body.length < 20) {
    issues.push("Phần hướng dẫn Markdown bên dưới frontmatter còn quá ngắn.");
  }

  const wordCount = body ? body.split(/\s+/).filter(Boolean).length : 0;
  const targetName = name && /^[a-z0-9-]+$/.test(name) ? name : "my-skill";
  const installSnippet = `mkdir -p ~/.gemini/config/skills/${targetName} && cp SKILL.md ~/.gemini/config/skills/${targetName}/SKILL.md`;

  return {
    valid: issues.length === 0,
    name,
    description,
    body,
    wordCount,
    issues,
    installSnippet,
  };
}

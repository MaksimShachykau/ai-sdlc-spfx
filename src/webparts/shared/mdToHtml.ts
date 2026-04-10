// Shared inline Markdown → HTML renderer
// Handles patterns used in ai-sdlc card markdown files:
//   # h1  ## h2  ### h3  **bold**  *italic*  `code`  [text](url)
//   | table |  1. ordered list  - unordered list  > blockquote  --- hr

function inlineFormat(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" ' +
      'style="color:#2563eb;text-decoration:none;font-weight:500;">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em style="color:#64748b;">$1</em>')
    .replace(/`([^`]+)`/g,
      '<code style="background:#f1f5f9;padding:2px 6px;border-radius:4px;' +
      'font-size:11px;font-family:monospace;color:#334155;font-weight:600;">$1</code>');
}

function isTableSeparator(line: string): boolean {
  return /^\|[\s\-|:]+\|$/.test(line.trim());
}

function parseTableRow(line: string): string[] {
  return line.split('|').slice(1, -1).map(c => c.trim());
}

function renderTable(tableLines: string[]): string {
  const rows = tableLines.filter(l => !isTableSeparator(l));
  if (rows.length === 0) return '';

  const header = rows[0];
  const body   = rows.slice(1);
  const hCells = parseTableRow(header);

  let html = '<div style="overflow-x:auto;margin:0 0 4px;">' +
    '<table style="width:100%;border-collapse:collapse;font-size:13px;">' +
    '<thead><tr>';

  hCells.forEach(cell => {
    html += `<th style="padding:8px 12px;text-align:left;background:#f8fafc;` +
      `border:1px solid #e2e8f0;font-weight:600;color:#475569;white-space:nowrap;">` +
      `${inlineFormat(cell)}</th>`;
  });
  html += '</tr></thead><tbody>';

  body.forEach(row => {
    const cells = parseTableRow(row);
    html += '<tr>';
    cells.forEach((cell, idx) => {
      const empty = idx === 0 && !cell;
      html += `<td style="padding:8px 12px;border:1px solid #e2e8f0;` +
        `color:${empty ? '#94a3b8' : '#334155'};` +
        `font-style:${empty ? 'italic' : 'normal'};">` +
        `${inlineFormat(cell)}</td>`;
    });
    html += '</tr>';
  });

  html += '</tbody></table></div>';
  return html;
}

export function mdToHtml(md: string): string {
  const lines  = md.split('\n');
  const result: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith('# ')) {
      result.push(
        `<h1 style="font-size:20px;font-weight:700;color:#0f172a;margin:0 0 6px;line-height:1.3;">` +
        `${inlineFormat(line.slice(2))}</h1>`
      );
      i++; continue;
    }

    if (line.startsWith('## ')) {
      result.push(
        `<h2 style="font-size:15px;font-weight:700;color:#1e293b;` +
        `margin:28px 0 12px;padding-bottom:6px;border-bottom:1px solid #e2e8f0;">` +
        `${inlineFormat(line.slice(3))}</h2>`
      );
      i++; continue;
    }

    if (line.startsWith('### ')) {
      result.push(
        `<h3 style="font-size:13px;font-weight:600;color:#334155;margin:16px 0 8px;">` +
        `${inlineFormat(line.slice(4))}</h3>`
      );
      i++; continue;
    }

    if (line.trim() === '---') {
      result.push('<hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0;">');
      i++; continue;
    }

    if (line.startsWith('> ')) {
      result.push(
        `<div style="margin:6px 0;padding:10px 14px;background:#fef2f2;` +
        `border-left:3px solid #f87171;border-radius:0 8px 8px 0;font-size:13px;color:#991b1b;">` +
        `${inlineFormat(line.slice(2))}</div>`
      );
      i++; continue;
    }

    if (line.startsWith('|')) {
      const block: string[] = [];
      while (i < lines.length && lines[i].startsWith('|')) {
        block.push(lines[i]);
        i++;
      }
      result.push(renderTable(block));
      continue;
    }

    if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        const text = lines[i].replace(/^\d+\.\s/, '');
        items.push(
          `<li style="display:flex;gap:10px;margin-bottom:8px;">` +
          `<span style="flex-shrink:0;width:20px;height:20px;border-radius:50%;` +
          `background:#f1f5f9;color:#64748b;font-size:11px;font-weight:700;` +
          `display:flex;align-items:center;justify-content:center;margin-top:1px;">${items.length + 1}</span>` +
          `<span style="font-size:13px;color:#334155;line-height:1.6;">${inlineFormat(text)}</span></li>`
        );
        i++;
      }
      result.push(`<ol style="list-style:none;padding:0;margin:8px 0;">${items.join('')}</ol>`);
      continue;
    }

    if (/^[*-]\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[*-]\s/.test(lines[i])) {
        items.push(
          `<li style="font-size:13px;color:#334155;margin-bottom:4px;">` +
          `${inlineFormat(lines[i].slice(2))}</li>`
        );
        i++;
      }
      result.push(`<ul style="padding-left:18px;margin:8px 0;">${items.join('')}</ul>`);
      continue;
    }

    if (!line.trim()) {
      i++; continue;
    }

    result.push(
      `<p style="font-size:13px;color:#475569;line-height:1.6;margin:4px 0;">` +
      `${inlineFormat(line)}</p>`
    );
    i++;
  }

  return result.join('\n');
}

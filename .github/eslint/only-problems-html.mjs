export default function(results, _context) {
  const esc = (s) => String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const rel = (p) => p.replace(process.cwd().replace(/\\/g,'/'), '').replace(/^[/\\]/, '').replace(/\\/g,'/');

  const bad = results.filter(r => r.errorCount || r.warningCount);
  const totalErrors = bad.reduce((a, r) => a + r.errorCount, 0);
  const totalWarnings = bad.reduce((a, r) => a + r.warningCount, 0);

  const sections = bad.map(r => {
    const file = rel(r.filePath);
    const items = r.messages.map(m => {
      const sev = m.severity === 2 ? 'error' : 'warning';
      const pos = `${m.line ?? 0}:${m.column ?? 0}`;
      return `<li class="${sev}"><span class="sev">${sev}</span> <code>${esc(m.ruleId ?? 'parser')}</code> — ${esc(m.message)} <span class="pos">(${esc(file)}:${pos})</span></li>`;
    }).join('');
    return `<section><h3>${esc(file)} — ${r.errorCount} error(s), ${r.warningCount} warning(s)</h3><ul>${items}</ul></section>`;
  }).join('');

  const html = `<!doctype html><meta charset="utf-8"><title>ESLint report</title>
<style>
body{font:14px/1.45 system-ui,Segoe UI,Arial,sans-serif;margin:24px;max-width:1200px}
h1{margin:0 0 12px}h3{margin:16px 0 8px}
code{background:#f6f6f6;padding:0 4px;border-radius:4px}
section{padding:12px 14px;border:1px solid #eee;border-radius:10px;margin:12px 0;border-radius:10px}
ul{margin:0 0 0 18px} li{margin:4px 0} .sev{display:inline-block;min-width:60px}
.error .sev{color:#b00020;font-weight:600} .warning .sev{color:#aa7a00;font-weight:600} .pos{opacity:.7}
</style>
<h1>ESLint report</h1>
<p>Files with issues: <b>${bad.length}</b> | Errors: <b>${totalErrors}</b> | Warnings: <b>${totalWarnings}</b></p>
${bad.length ? sections : '<p>No problems found.</p>'}`;
  return html;
}
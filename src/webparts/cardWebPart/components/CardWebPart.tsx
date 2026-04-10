import * as React from 'react';
import type { ICardWebPartProps } from './ICardWebPartProps';
import { mdToHtml } from '../../shared/mdToHtml';
import '@pnp/sp/webs';
import '@pnp/sp/files';

// ─── State ────────────────────────────────────────────────────────────────────

type State =
  | { status: 'unconfigured' }
  | { status: 'loading' }
  | { status: 'not-found'; path: string }
  | { status: 'error'; message: string }
  | { status: 'ready'; html: string };

// ─── Page path parser ─────────────────────────────────────────────────────────
// Matches: .../SitePages/ai-sdlc-matrix-{role}/{phase}/{level}.aspx

function parsePagePath(pagePath: string): { role: string; phase: string; level: string } | undefined {
  const match = /\/ai-sdlc-matrix\/([^/]+)\/([^/]+)\/([^/]+)\.aspx$/i.exec(pagePath);
  if (!match) return undefined;
  return { role: match[1], phase: match[2], level: match[3] };
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function CardWebPart({
  sp, siteServerRelativeUrl,
  role: propRole, phase: propPhase, level: propLevel,
}: ICardWebPartProps): React.ReactElement {
  const [state, setState] = React.useState<State>({ status: 'loading' });

  // Read the actual browser URL — always correct regardless of SPFx context shape
  const parsed = parsePagePath(window.location.pathname);
  console.log('AAA pathname:', window.location.pathname, '| parsed:', parsed, '| props:', { role: propRole, phase: propPhase, level: propLevel });
  const role  = parsed?.role  ?? propRole;
  const phase = parsed?.phase ?? propPhase;
  const level = parsed?.level ?? propLevel;

  React.useEffect(() => {
    if (!role || !phase || !level) {
      setState({ status: 'unconfigured' });
      return;
    }

    setState({ status: 'loading' });

    const filePath = `${siteServerRelativeUrl}/Shared Documents/ai-sdlc-matrix-data/${role}/${phase}/${level}.md`;

    sp.web.getFileByServerRelativePath(filePath).getText()
      .then((text: string) => {
        setState({ status: 'ready', html: mdToHtml(text) });
      })
      .catch((err: Error) => {
        const msg = err?.message ?? '';
        if (msg.includes('404') || /does not exist|file not found|item does not exist/i.test(msg)) {
          setState({ status: 'not-found', path: filePath });
        } else {
          setState({ status: 'error', message: msg || 'An unexpected error occurred.' });
        }
      });
  }, [sp, role, phase, level, siteServerRelativeUrl]);

  // ── Loading ──
  if (state.status === 'loading') {
    return (
      <div style={{ padding: 32, fontFamily: 'Segoe UI, sans-serif', color: '#64748b', display: 'flex', alignItems: 'center', gap: 10 }}>
        <svg width={18} height={18} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="#e2e8f0" strokeWidth="3" />
          <path d="M4 12a8 8 0 018-8" stroke="#6366f1" strokeWidth="3" strokeLinecap="round">
            <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite" />
          </path>
        </svg>
        Loading card…
      </div>
    );
  }

  // ── Not configured ──
  if (state.status === 'unconfigured') {
    return (
      <div style={{ padding: 32, fontFamily: 'Segoe UI, sans-serif', border: '2px dashed #e2e8f0', borderRadius: 12, textAlign: 'center', color: '#94a3b8' }}>
        <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 600, color: '#64748b' }}>Web part not configured</p>
        <p style={{ margin: 0, fontSize: 12 }}>Open the property pane and set a Role and Phase.</p>
      </div>
    );
  }

  // ── Not found ──
  if (state.status === 'not-found') {
    return (
      <div style={{ padding: 24, fontFamily: 'Segoe UI, sans-serif', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: 12 }}>
        <p style={{ margin: '0 0 6px', fontSize: 14, fontWeight: 700, color: '#991b1b' }}>Card file not found</p>
        <p style={{ margin: '0 0 8px', fontSize: 13, color: '#b91c1c' }}>
          No markdown file exists for <strong>{role}</strong> / <strong>{phase}</strong> / <strong>{level}</strong>.
        </p>
        <code style={{ fontSize: 11, color: '#7f1d1d', background: '#fee2e2', padding: '4px 8px', borderRadius: 6, display: 'block', wordBreak: 'break-all' }}>
          {state.path}
        </code>
        <p style={{ margin: '8px 0 0', fontSize: 11, color: '#b91c1c' }}>
          Upload a <code style={{ fontSize: 11 }}>.md</code> file at the path above, or check the property pane values.
        </p>
      </div>
    );
  }

  // ── Error ──
  if (state.status === 'error') {
    return (
      <div style={{ padding: 24, fontFamily: 'Segoe UI, sans-serif', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: 12 }}>
        <p style={{ margin: '0 0 6px', fontSize: 14, fontWeight: 700, color: '#991b1b' }}>Failed to load card</p>
        <p style={{ margin: 0, fontSize: 13, color: '#b91c1c' }}>{state.message}</p>
      </div>
    );
  }

  // ── Ready ──
  return (
    <div style={{
      fontFamily: 'Segoe UI, sans-serif',
      background: '#fff',
      borderRadius: 16,
      border: '1px solid #e2e8f0',
      boxShadow: '0 4px 16px rgba(0,0,0,0.07)',
      padding: '24px 28px',
      maxWidth: 900,
      lineHeight: 1.6,
    }}>
      {/* eslint-disable-next-line react/no-danger */}
      <div dangerouslySetInnerHTML={{ __html: state.html }} />
    </div>
  );
}

import * as React from 'react';
import type { IMdCardWebPartProps } from './IMdCardWebPartProps';
import { mdToHtml } from '../../shared/mdToHtml';
import '@pnp/sp/webs';
import '@pnp/sp/files';

type State =
  | { status: 'unconfigured' }
  | { status: 'loading' }
  | { status: 'not-found'; path: string }
  | { status: 'error'; message: string }
  | { status: 'ready'; html: string };

/**
 * Sharing links look like: https://tenant.sharepoint.com/:t:/s/SiteName/FileId?e=token
 * They have a pathname starting with /: and cannot be used with PnPjs getFileByServerRelativePath.
 */
function isSharingLink(input: string): boolean {
  try {
    return /^\/:/.test(new URL(input).pathname);
  } catch {
    return false;
  }
}

/** Convert a direct full URL or server-relative path to a server-relative path for PnPjs. */
function toServerRelativePath(input: string): string {
  try {
    return decodeURIComponent(new URL(input).pathname);
  } catch {
    return decodeURIComponent(input);
  }
}

/** Fetch file content from a SharePoint sharing link using the ?download=1 trick. */
function fetchSharingLink(url: string): Promise<string> {
  const downloadUrl = url.includes('?') ? `${url}&download=1` : `${url}?download=1`;
  return fetch(downloadUrl, { credentials: 'include' })
    .then(r => {
      if (r.status === 404) throw new Error('404');
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.text();
    });
}

export default function MdCardWebPart({ sp, fileUrl }: IMdCardWebPartProps): React.ReactElement {
  const [state, setState] = React.useState<State>({ status: 'loading' });

  React.useEffect(() => {
    const trimmed = fileUrl?.trim();
    if (!trimmed) {
      setState({ status: 'unconfigured' });
      return;
    }

    setState({ status: 'loading' });

    const promise: Promise<string> = isSharingLink(trimmed)
      ? fetchSharingLink(trimmed)
      : sp.web.getFileByServerRelativePath(toServerRelativePath(trimmed)).getText();

    promise
      .then((text: string) => {
        setState({ status: 'ready', html: mdToHtml(text) });
      })
      .catch((err: Error) => {
        const msg = err?.message ?? '';
        if (msg.includes('404') || /does not exist|file not found|item does not exist/i.test(msg)) {
          setState({ status: 'not-found', path: trimmed });
        } else {
          setState({ status: 'error', message: msg || 'An unexpected error occurred.' });
        }
      });
  }, [sp, fileUrl]);

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
        Loading…
      </div>
    );
  }

  // ── Not configured ──
  if (state.status === 'unconfigured') {
    return (
      <div style={{ padding: 32, fontFamily: 'Segoe UI, sans-serif', border: '2px dashed #e2e8f0', borderRadius: 12, textAlign: 'center', color: '#94a3b8' }}>
        <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 600, color: '#64748b' }}>No file configured</p>
        <p style={{ margin: 0, fontSize: 12 }}>Open the property pane and paste a SharePoint URL to a <code style={{ fontSize: 12 }}>.md</code> file.</p>
      </div>
    );
  }

  // ── Not found ──
  if (state.status === 'not-found') {
    return (
      <div style={{ padding: 24, fontFamily: 'Segoe UI, sans-serif', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: 12 }}>
        <p style={{ margin: '0 0 6px', fontSize: 14, fontWeight: 700, color: '#991b1b' }}>Markdown file not found</p>
        <p style={{ margin: '0 0 8px', fontSize: 13, color: '#b91c1c' }}>
          No file exists at the configured path. Check that the file has been uploaded to SharePoint.
        </p>
        <code style={{ fontSize: 11, color: '#7f1d1d', background: '#fee2e2', padding: '4px 8px', borderRadius: 6, display: 'block', wordBreak: 'break-all' }}>
          {state.path}
        </code>
      </div>
    );
  }

  // ── Error ──
  if (state.status === 'error') {
    return (
      <div style={{ padding: 24, fontFamily: 'Segoe UI, sans-serif', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: 12 }}>
        <p style={{ margin: '0 0 6px', fontSize: 14, fontWeight: 700, color: '#991b1b' }}>Failed to load file</p>
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

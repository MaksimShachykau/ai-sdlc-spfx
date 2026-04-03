import * as React from 'react';
import type { IMatrixWebPartProps } from './IMatrixWebPartProps';
import '@pnp/sp/webs';
import '@pnp/sp/folders';
import '@pnp/sp/files';
import '@pnp/sp/lists';
import '@pnp/sp/items';

const SITE_URL  = 'https://maksimshachykau.sharepoint.com/sites/AI-SDLCRoleMatrix';
const FOLDER_ROOT = '/sites/AI-SDLCRoleMatrix/SitePages/ai-sdlc-matrix';

const PHASES = [
  { display: 'Planning',              folder: 'Planning' },
  { display: 'Requirements',          folder: 'Requirements' },
  { display: 'Design / Architecture', folder: 'Design-Architecture' },
  { display: 'Development',           folder: 'Development' },
  { display: 'Testing',               folder: 'Testing' },
  { display: 'Deployment / Release',  folder: 'Deployment-Release' },
  { display: 'Maintenance',           folder: 'Maintenance' },
] as const;

const LEVELS = [
  { id: 'ai-enabled', label: 'AI Enabled', color: '#1D9E75', shadow: 'rgba(16,122,72,0.4)' },
  { id: 'ai-first',   label: 'AI-First',   color: '#378ADD', shadow: 'rgba(30,86,161,0.4)' },
  { id: 'ai-native',  label: 'AI Native',  color: '#7F77DD', shadow: 'rgba(99,89,190,0.4)' },
] as const;

type Level       = typeof LEVELS[number]['id'];
type Involvement = 'lead' | 'active' | 'review' | 'on-demand' | 'none';

interface RoleFolder { Name: string }
interface PageItem   { FileRef: string; Involvement?: string }

function normalizeInvolvement(raw?: string): Involvement {
  if (!raw) return 'none';
  const map: Record<string, Involvement> = {
    'lead':      'lead',
    'active':    'active',
    'review':    'review',
    'on-demand': 'on-demand',
    'on demand': 'on-demand',
  };
  return map[raw.toLowerCase()] ?? 'none';
}

function parseCellKey(fileRef: string): { key: string; levelId: string } | undefined {
  const lower = fileRef.toLowerCase();
  const root  = FOLDER_ROOT.toLowerCase();
  if (!lower.startsWith(root)) return undefined;
  const parts = lower.slice(root.length).split('/').filter(Boolean);
  if (parts.length < 3) return undefined;
  return { key: `${parts[0]}|${parts[1]}`, levelId: parts[2].replace('.aspx', '') };
}

// ─── Involvement dot (matches original MatrixCell exactly) ───────────────────

function InvolvementDot({ type }: { type: Involvement }): React.ReactElement {
  if (type === 'lead') return (
    <span style={{ width: 20, height: 20, borderRadius: '50%', background: '#6366f1', display: 'block', flexShrink: 0, boxShadow: '0 0 0 3px #e0e7ff, 0 1px 3px rgba(99,102,241,0.4)' }} />
  );
  if (type === 'active') return (
    <span style={{ width: 16, height: 16, borderRadius: '50%', background: '#14b8a6', display: 'block', flexShrink: 0, boxShadow: '0 1px 3px rgba(20,184,166,0.3)' }} />
  );
  if (type === 'review') return (
    <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#f59e0b', display: 'block', flexShrink: 0, boxShadow: '0 1px 3px rgba(245,158,11,0.3)' }} />
  );
  if (type === 'on-demand') return (
    <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#cbd5e1', display: 'block', flexShrink: 0 }} />
  );
  // none
  return <span style={{ color: '#e2e8f0', fontSize: 18, fontWeight: 200, userSelect: 'none', lineHeight: 1 }}>·</span>;
}

// ─── Legend ──────────────────────────────────────────────────────────────────

function Legend(): React.ReactElement {
  const items: { type: Involvement; label: string; desc: string }[] = [
    { type: 'lead',      label: 'Lead',      desc: 'Owns and drives this phase' },
    { type: 'active',    label: 'Active',     desc: 'Core contributor' },
    { type: 'review',    label: 'Review',     desc: 'Reviews and approves outputs' },
    { type: 'on-demand', label: 'On-demand',  desc: 'Consulted when needed' },
  ];
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center', padding: '16px', background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', marginTop: 16 }}>
      <span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Involvement</span>
      {items.map(item => (
        <div key={item.type} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <InvolvementDot type={item.type} />
          <span style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>{item.label}</span>
          <span style={{ fontSize: 12, color: '#94a3b8' }}>— {item.desc}</span>
        </div>
      ))}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 10, height: 10, borderRadius: 2, background: '#f1f5f9', border: '1px solid #e2e8f0', display: 'block', flexShrink: 0 }} />
        <span style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>Not involved</span>
      </div>
    </div>
  );
}

// ─── Level selector icons ────────────────────────────────────────────────────

function IconEnabled(): React.ReactElement {
  return (
    <svg width={14} height={14} fill="currentColor" viewBox="0 0 24 24">
      <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
    </svg>
  );
}
function IconFirst(): React.ReactElement {
  return (
    <svg width={14} height={14} fill="currentColor" viewBox="0 0 24 24">
      <path fillRule="evenodd" d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.268a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.895-.143z" clipRule="evenodd" />
    </svg>
  );
}
function IconNative(): React.ReactElement {
  return (
    <svg width={14} height={14} fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25zm.75-12h9v9h-9v-9z" />
    </svg>
  );
}

const LEVEL_ICONS: Record<Level, () => React.ReactElement> = {
  'ai-enabled': IconEnabled,
  'ai-first':   IconFirst,
  'ai-native':  IconNative,
};

// ─── Main component ───────────────────────────────────────────────────────────

export default function MatrixWebPart({ sp }: IMatrixWebPartProps): React.ReactElement {
  const [roles, setRoles]               = React.useState<string[]>([]);
  const [cellMap, setCellMap]           = React.useState<Map<string, { files: Set<string>; inv: Involvement }>>(new Map());
  const [level, setLevel]               = React.useState<Level>('ai-enabled');
  const [hoveredCell, setHoveredCell]   = React.useState<string | null>(null);
  const [selectedCell, setSelectedCell] = React.useState<string | null>(null);
  const [loading, setLoading]           = React.useState(true);
  const [error, setError]               = React.useState<string | null>(null);

  React.useEffect(() => {
    Promise.all([
      sp.web.getFolderByServerRelativePath(FOLDER_ROOT).folders<RoleFolder[]>(),
      sp.web.lists.getByTitle('Site Pages').items
        .select('FileRef', 'Involvement')
        .filter(`startswith(FileRef, '${FOLDER_ROOT}')`)
        <PageItem[]>(),
    ])
    .then(([folders, pages]) => {
      setRoles(folders.map(f => f.Name).sort());

      const map = new Map<string, { files: Set<string>; inv: Involvement }>();
      for (const page of pages) {
        const parsed = parseCellKey(page.FileRef);
        if (!parsed) continue;
        const { key, levelId } = parsed;
        if (!map.has(key)) map.set(key, { files: new Set(), inv: 'none' });
        const entry = map.get(key)!;
        entry.files.add(levelId);
        const inv = normalizeInvolvement(page.Involvement);
        if (inv !== 'none') entry.inv = inv;
      }
      setCellMap(map);
      setLoading(false);
    })
    .catch((err: Error) => {
      setError(err.message);
      setLoading(false);
    });
  }, [sp]);

  const openCell = (role: string, phaseFolder: string): void => {
    window.open(`${SITE_URL}/SitePages/ai-sdlc-matrix/${role}/${phaseFolder}/${level}.aspx`, '_blank');
  };

  if (loading) return <div style={{ padding: 24, fontFamily: 'Segoe UI, sans-serif' }}>Loading…</div>;
  if (error)   return <div style={{ padding: 24, fontFamily: 'Segoe UI, sans-serif', color: '#dc2626' }}>Error: {error}</div>;
  if (roles.length === 0) return <div style={{ padding: 24, fontFamily: 'Segoe UI, sans-serif' }}>No role folders found in ai-sdlc-matrix.</div>;

  const activeLevelMeta = LEVELS.find(l => l.id === level)!;

  return (
    <div style={{ background: '#f1f5f9', minHeight: '100%', fontFamily: 'Segoe UI, sans-serif' }}>

      {/* Header */}
      <div style={{ background: '#0f172a', borderBottom: '1px solid #1e293b', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        {/* Logo + title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#34d399,#60a5fa,#a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width={20} height={20} fill="none" stroke="#fff" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', letterSpacing: '-0.01em' }}>AI-SDLC Role Matrix</div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Interactive cheatsheet for AI-era delivery roles</div>
          </div>
        </div>

        {/* Level selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Level</span>
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: 4, gap: 4, border: '1px solid rgba(255,255,255,0.08)' }}>
            {LEVELS.map(l => {
              const Icon = LEVEL_ICONS[l.id];
              const isActive = l.id === level;
              return (
                <button
                  key={l.id}
                  onClick={() => setLevel(l.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                    fontSize: 13, fontWeight: 600, transition: 'all 0.15s',
                    background: isActive ? l.color : 'transparent',
                    color: isActive ? '#fff' : '#94a3b8',
                    boxShadow: isActive ? `0 4px 12px ${l.shadow}` : 'none',
                    fontFamily: 'Segoe UI, sans-serif',
                  }}
                >
                  <Icon />
                  {l.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Matrix */}
      <div style={{ padding: '20px 24px' }}>
        <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 12 }}>
          Click any cell to open the role page. Showing <strong style={{ color: '#64748b' }}>{roles.length}</strong> roles.
        </div>

        <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid #e2e8f0', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <table style={{ borderCollapse: 'collapse', minWidth: 700, width: '100%' }}>
            <thead>
              <tr style={{ background: '#fff' }}>
                <th style={{ position: 'sticky', left: 0, zIndex: 3, background: '#fff', borderBottom: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0', width: 144, minWidth: 144, padding: '10px 12px' }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Phase / Role</span>
                </th>
                {roles.map(role => (
                  <th key={role} style={{ borderBottom: '1px solid #e2e8f0', borderRight: '1px solid #f1f5f9', padding: '10px 4px', textAlign: 'center' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', whiteSpace: 'nowrap' }}>{role}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PHASES.map((phase, phaseIdx) => (
                <tr key={phase.folder} style={{ background: phaseIdx % 2 === 1 ? '#f8fafc' : '#fff' }}>
                  <td style={{
                    position: 'sticky', left: 0, zIndex: 2,
                    background: phaseIdx % 2 === 1 ? '#f8fafc' : '#fff',
                    borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #f1f5f9',
                    padding: '4px 12px', minWidth: 144, width: 144,
                  }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', whiteSpace: 'nowrap' }}>{phase.display}</span>
                  </td>

                  {roles.map(role => {
                    const cellKey  = `${role.toLowerCase()}|${phase.folder.toLowerCase()}`;
                    const entry    = cellMap.get(cellKey);
                    const hasFile  = entry?.files.has(level) ?? false;
                    const inv      = entry?.inv ?? 'none';
                    const isNone   = !hasFile || inv === 'none';
                    const hKey     = `${role}|${phase.folder}`;
                    const isHov    = hoveredCell === hKey;
                    const isSel    = selectedCell === hKey;

                    return (
                      <td
                        key={role}
                        style={{ borderRight: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', padding: 4, textAlign: 'center' }}
                      >
                        <div
                          onClick={!isNone ? () => { setSelectedCell(hKey); openCell(role, phase.folder); } : undefined}
                          onMouseEnter={!isNone ? () => setHoveredCell(hKey) : undefined}
                          onMouseLeave={!isNone ? () => setHoveredCell(null) : undefined}
                          title={!isNone ? `${role} · ${phase.display} · ${inv} — open ${level}` : undefined}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            width: '100%', height: 56, borderRadius: 8,
                            cursor: !isNone ? 'pointer' : 'default',
                            transition: 'all 0.15s',
                            background: isSel ? '#f1f5f9' : isHov && !isNone ? '#f8fafc' : 'transparent',
                            boxShadow: isSel ? '0 0 0 2px #334155 inset' : 'none',
                          }}
                        >
                          <InvolvementDot type={hasFile ? inv : 'none'} />
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <Legend />

        {/* Active level hint */}
        <div style={{ marginTop: 12, fontSize: 11, color: '#94a3b8', textAlign: 'right' }}>
          Showing pages for{' '}
          <span style={{ fontWeight: 700, color: activeLevelMeta.color }}>{activeLevelMeta.label}</span>
        </div>
      </div>
    </div>
  );
}

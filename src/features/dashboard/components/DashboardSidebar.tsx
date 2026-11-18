import { Link } from 'react-router-dom';
import type { ApiUser } from '@/shared/api/use-api-session';

type IconName =
  | 'dashboard'
  | 'atendimento'
  | 'requests'
  | 'routes'
  | 'vehicle'
  | 'person'
  | 'maintenance'
  | 'users';

type NavigationItem = { label: string; icon: IconName; href?: string; page?: string };

const atendimento: NavigationItem = {
  label: 'Atendimento SVO',
  icon: 'atendimento',
  href: '/atendimento-svo',
  page: 'atendimento',
};

const dashboard: NavigationItem = {
  label: 'Dashboard',
  icon: 'dashboard',
  href: '/dashboard',
  page: 'dashboard',
};
const requests: NavigationItem = {
  label: 'Solicitações',
  icon: 'requests',
  href: '/solicitacoes',
  page: 'requests',
};
const routes: NavigationItem = { label: 'Rotas', icon: 'routes' };
const orders: NavigationItem = { label: 'Ordens', icon: 'vehicle' };
const fleetNavigation: NavigationItem[] = [
  { label: 'Veículos', icon: 'vehicle' },
  { label: 'Condutores', icon: 'person' },
  { label: 'Manutenções', icon: 'maintenance' },
  { label: 'Usuários', icon: 'users', href: '/usuarios', page: 'users' },
];

const dashboardNavigation = [dashboard, requests, routes, orders, ...fleetNavigation, atendimento];
const sharedNavigation = [dashboard, atendimento, requests, orders, routes, ...fleetNavigation];

function NavIcon({ name }: { name: IconName }) {
  const shapes: Record<IconName, React.ReactNode> = {
    dashboard: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </>
    ),
    requests: (
      <>
        <path d="M3 7h12l3 4v7H3z" />
        <path d="M15 7v5h6M7 18a1.5 1.5 0 1 0 0 .01M16 18a1.5 1.5 0 1 0 0 .01" />
      </>
    ),
    atendimento: (
      <>
        <rect x="5" y="4" width="14" height="17" rx="2" />
        <path d="M9 4.5h6v3H9zM8 12h8M8 16h6" />
      </>
    ),
    routes: (
      <>
        <circle cx="6" cy="6" r="2.5" />
        <circle cx="18" cy="18" r="2.5" />
        <path d="M8.5 6H15a3 3 0 0 1 0 6H9a3 3 0 0 0 0 6h6.5" />
      </>
    ),
    vehicle: (
      <>
        <path d="M3 14v-3l2-5h12l3 5v6h-2M3 14h14M6 17h.01M15 17h.01" />
        <circle cx="6" cy="17" r="2" />
        <circle cx="15" cy="17" r="2" />
      </>
    ),
    person: (
      <>
        <circle cx="12" cy="7" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </>
    ),
    maintenance: (
      <>
        <rect x="4" y="8" width="16" height="12" rx="2" />
        <path d="M8 8V5a4 4 0 0 1 8 0v3M8 13h8M8 16h5" />
      </>
    ),
    users: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3 20a6 6 0 0 1 12 0M16 5a3 3 0 0 1 0 6M17 14a5 5 0 0 1 4 5" />
      </>
    ),
  };
  return (
    <svg
      aria-hidden="true"
      className="dashboard-nav-icon"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      {shapes[name]}
    </svg>
  );
}

export function DashboardSidebar({
  active = 'dashboard',
  session,
}: {
  active?: string;
  session?: ApiUser | null;
}) {
  return (
    <aside className="dashboard-sidebar">
      <Link aria-label="SVO, início" className="dashboard-brand" to="/">
        SVO
      </Link>
      <nav aria-label="Navegação principal" className="dashboard-navigation">
        {(active === 'dashboard' ? dashboardNavigation : sharedNavigation).map((item) =>
          item.href ? (
            <Link
              aria-current={item.page === active ? 'page' : undefined}
              className={`dashboard-nav-item${item.page === active ? ' active' : ''}`}
              key={item.label}
              to={item.href}
            >
              <NavIcon name={item.icon} />
              <span>{item.label}</span>
            </Link>
          ) : (
            <span
              aria-disabled="true"
              className="dashboard-nav-item unavailable"
              key={item.label}
              title="Indisponível neste protótipo"
            >
              <NavIcon name={item.icon} />
              <span>{item.label}</span>
            </span>
          ),
        )}
      </nav>
      {session ? (
        <section aria-label="Perfil" className="dashboard-profile">
          <span className="dashboard-avatar">{session.initials}</span>
          <strong>{session.name}</strong>
          {session.role && <span>{session.role}</span>}
          <button onClick={session.logout} type="button">
            Sair
          </button>
        </section>
      ) : (
        session === undefined && (
          <section aria-label="Perfil demonstrativo" className="dashboard-profile">
            <span className="dashboard-avatar">AC</span>
            <strong>Ana Coordenadora</strong>
            <span>
              Gestora
              <br />
              Administrativo + SVO
            </span>
            <button disabled title="Autenticação não implementada" type="button">
              Sair
            </button>
          </section>
        )
      )}
    </aside>
  );
}

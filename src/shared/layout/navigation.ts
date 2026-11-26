import AltRouteOutlined from '@mui/icons-material/AltRouteOutlined';
import AssignmentOutlined from '@mui/icons-material/AssignmentOutlined';
import BadgeOutlined from '@mui/icons-material/BadgeOutlined';
import BuildOutlined from '@mui/icons-material/BuildOutlined';
import DashboardOutlined from '@mui/icons-material/DashboardOutlined';
import DirectionsCarOutlined from '@mui/icons-material/DirectionsCarOutlined';
import GroupOutlined from '@mui/icons-material/GroupOutlined';
import ReceiptLongOutlined from '@mui/icons-material/ReceiptLongOutlined';
import type { SvgIconComponent } from '@mui/icons-material';

export type NavKey =
  | 'dashboard'
  | 'solicitacoes'
  | 'rotas'
  | 'ordens'
  | 'veiculos'
  | 'condutores'
  | 'manutencoes'
  | 'usuarios';

export interface NavItem {
  key: NavKey;
  label: string;
  icon: SvgIconComponent;
  /** Rota implementada. Sem `to`, o módulo ainda não existe e abre um aviso. */
  to?: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const navigation: NavGroup[] = [
  {
    label: 'Visão geral',
    items: [
      { key: 'dashboard', label: 'Dashboard', icon: DashboardOutlined, to: '/dashboard/demo' },
    ],
  },
  {
    label: 'Operação',
    items: [
      { key: 'solicitacoes', label: 'Solicitações', icon: AssignmentOutlined },
      { key: 'rotas', label: 'Rotas', icon: AltRouteOutlined },
      { key: 'ordens', label: 'Ordens', icon: ReceiptLongOutlined },
    ],
  },
  {
    label: 'Frota',
    items: [
      { key: 'veiculos', label: 'Veículos', icon: DirectionsCarOutlined },
      { key: 'condutores', label: 'Condutores', icon: BadgeOutlined },
      { key: 'manutencoes', label: 'Manutenções', icon: BuildOutlined },
    ],
  },
  {
    label: 'Administração',
    items: [{ key: 'usuarios', label: 'Usuários', icon: GroupOutlined, to: '/usuarios' }],
  },
];

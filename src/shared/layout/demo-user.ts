export interface LayoutUser {
  name: string;
  role: string;
  scope: string;
}

/** Perfil fictício exibido enquanto a autenticação não estiver integrada. */
export const demoUser: LayoutUser = {
  name: 'Ana Coordenadora',
  role: 'Gestora',
  scope: 'Administrativo + SVO',
};

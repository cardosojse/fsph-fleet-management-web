import { Button } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { roles, roleLabels, type Dto, type UserRole } from '@/shared/api/types';
import type { Field, FormValues } from '@/shared/components/FormDialog';
import { RegistryScreen, ActiveChip } from './RegistryScreen';
import { driversApi, sectorsApi, usersApi, vehiclesApi } from './api';

const roleOptions = roles.map((value) => ({ value, label: roleLabels[value] }));
const sectorField = (sectors: Dto['SectorResponse'][] | undefined, required = true): Field => ({
  name: 'sectorId',
  label: 'Setor',
  required,
  ...(sectors
    ? {
        options: [
          ...(!required ? [{ value: '', label: 'Sem setor' }] : []),
          ...sectors.map((sector) => ({ value: sector.id, label: sector.name })),
        ],
      }
    : { helper: 'Informe o identificador do setor.' }),
});
const passwordField: Field = {
  name: 'password',
  label: 'Senha',
  type: 'password',
  required: true,
  minLength: 8,
  maxLength: 72,
};
const sectorFields: Field[] = [
  { name: 'name', label: 'Nome do setor', required: true, maxLength: 100 },
];

export function SectorsPage() {
  return (
    <RegistryScreen
      name="sectors"
      title="Setores"
      createLabel="Novo setor"
      list={sectorsApi.list}
      columns={[{ label: 'Nome', render: (row) => row.name }]}
      filter={(row, text) => row.name.toLocaleLowerCase('pt-BR').includes(text)}
      create={{
        title: 'Novo setor',
        fields: sectorFields,
        submit: (values) => sectorsApi.create({ name: values.name! }),
      }}
      edit={(row) => ({
        title: 'Editar setor',
        fields: sectorFields,
        defaults: { name: row.name },
        submit: (values) => sectorsApi.update(row.id, { name: values.name! }),
      })}
      actions={(row, open) => (
        <Button
          color="error"
          size="small"
          onClick={() =>
            open({
              title: `Excluir o setor ${row.name}?`,
              fields: [],
              submit: () => sectorsApi.remove(row.id),
            })
          }
        >
          Excluir
        </Button>
      )}
    />
  );
}

export function UsersPage() {
  const sectors = useQuery({
    queryKey: ['registry', 'sectors'],
    queryFn: ({ signal }) => sectorsApi.list(signal),
  });
  const fields: Field[] = [
    sectorField(sectors.data),
    { name: 'name', label: 'Nome', required: true, maxLength: 150 },
    { name: 'email', label: 'E-mail', type: 'email', required: true, maxLength: 255 },
    { name: 'role', label: 'Perfil', required: true, options: roleOptions },
  ];
  const userBody = (values: FormValues) => ({
    sectorId: values.sectorId!,
    name: values.name!,
    email: values.email!,
    role: values.role as UserRole,
  });
  return (
    <RegistryScreen
      name="users"
      title="Usuários"
      createLabel="Novo usuário"
      list={usersApi.list}
      columns={[
        { label: 'Nome', render: (row) => row.name },
        { label: 'E-mail', render: (row) => row.email },
        { label: 'Setor', render: (row) => row.sectorName },
        { label: 'Perfil', render: (row) => roleLabels[row.role] },
        { label: 'Situação', render: (row) => <ActiveChip active={row.active} /> },
      ]}
      filter={(row, text) =>
        `${row.name} ${row.email} ${row.sectorName}`.toLocaleLowerCase('pt-BR').includes(text)
      }
      create={{
        title: 'Novo usuário',
        fields: [...fields, passwordField],
        submit: (values) => usersApi.create({ ...userBody(values), password: values.password! }),
      }}
      edit={(row) => ({
        title: 'Editar usuário',
        fields,
        defaults: { sectorId: row.sectorId!, name: row.name, email: row.email, role: row.role },
        submit: (values) => usersApi.update(row.id, { ...userBody(values), active: row.active }),
      })}
      actions={(row, open) => (
        <>
          <Button
            size="small"
            onClick={() =>
              open({
                title: `Alterar senha de ${row.name}`,
                fields: [passwordField],
                submit: (values) => usersApi.password(row.id, { password: values.password! }),
              })
            }
          >
            Senha
          </Button>
          <Button
            size="small"
            color={row.active ? 'error' : 'primary'}
            onClick={() =>
              open({
                title: `${row.active ? 'Desativar' : 'Reativar'} ${row.name}?`,
                fields: [],
                submit: () =>
                  row.active ? usersApi.deactivate(row.id) : usersApi.reactivate(row.id),
              })
            }
          >
            {row.active ? 'Desativar' : 'Reativar'}
          </Button>
        </>
      )}
    />
  );
}

export function VehiclesPage() {
  const sectors = useQuery({
    queryKey: ['registry', 'sectors'],
    queryFn: ({ signal }) => sectorsApi.list(signal),
  });
  const fields: Field[] = [
    sectorField(sectors.data, false),
    { name: 'plate', label: 'Placa', required: true, maxLength: 11 },
    { name: 'model', label: 'Modelo', required: true, maxLength: 150 },
    { name: 'capacity', label: 'Capacidade', type: 'number', required: true, min: 1 },
    { name: 'usageType', label: 'Tipo de uso', required: true, maxLength: 50 },
    {
      name: 'currentOdometerKm',
      label: 'Quilometragem atual (km)',
      type: 'number',
      required: true,
      min: 0,
    },
  ];
  const body = (values: FormValues): Dto['CreateVehicleRequest'] => ({
    sectorId: values.sectorId || null,
    plate: values.plate!,
    model: values.model!,
    capacity: Number(values.capacity),
    usageType: values.usageType!,
    currentOdometerKm: Number(values.currentOdometerKm),
  });
  return (
    <RegistryScreen
      name="vehicles"
      title="Veículos"
      createLabel="Novo veículo"
      list={vehiclesApi.list}
      columns={[
        { label: 'Placa', render: (row) => row.plate },
        { label: 'Modelo', render: (row) => row.model },
        { label: 'Capacidade', render: (row) => row.capacity },
        { label: 'Uso', render: (row) => row.usageType },
        {
          label: 'Quilometragem',
          render: (row) => `${row.currentOdometerKm.toLocaleString('pt-BR')} km`,
        },
        { label: 'Situação', render: (row) => <ActiveChip active={row.active} /> },
      ]}
      filter={(row, text) =>
        `${row.plate} ${row.model} ${row.usageType}`.toLocaleLowerCase('pt-BR').includes(text)
      }
      create={{
        title: 'Novo veículo',
        fields,
        defaults: { currentOdometerKm: '0', sectorId: '' },
        submit: (values) => vehiclesApi.create(body(values)),
      }}
      edit={(row) => ({
        title: 'Editar veículo',
        fields,
        defaults: {
          sectorId: row.sectorId ?? '',
          plate: row.plate,
          model: row.model,
          capacity: String(row.capacity),
          usageType: row.usageType,
          currentOdometerKm: String(row.currentOdometerKm),
        },
        submit: (values) => vehiclesApi.update(row.id, body(values)),
      })}
      actions={(row, open) => (
        <>
          <Button size="small" component={Link} to={`/veiculos/${row.id}/documentos`}>
            Documentos
          </Button>
          {row.active && (
            <Button
              color="error"
              size="small"
              onClick={() =>
                open({
                  title: `Desativar o veículo ${row.plate}?`,
                  fields: [],
                  submit: () => vehiclesApi.deactivate(row.id),
                })
              }
            >
              Desativar
            </Button>
          )}
        </>
      )}
    />
  );
}

export function DriversPage() {
  const users = useQuery({
    queryKey: ['registry', 'users'],
    queryFn: ({ signal }) => usersApi.list(signal),
  });
  const userField: Field = {
    name: 'userId',
    label: 'Usuário motorista',
    required: true,
    ...(users.data
      ? {
          options: users.data
            .filter((user) => user.active && user.role === 'MOTORISTA')
            .map((user) => ({ value: user.id, label: `${user.name} · ${user.email}` })),
        }
      : { helper: 'Informe o ID de um usuário ativo com perfil Motorista.' }),
  };
  return (
    <RegistryScreen
      name="drivers"
      title="Motoristas"
      createLabel="Novo motorista"
      list={driversApi.list}
      columns={[
        { label: 'Nome', render: (row) => row.name },
        { label: 'E-mail', render: (row) => row.email },
        { label: 'Motorista', render: (row) => <ActiveChip active={row.active} /> },
        { label: 'Usuário', render: (row) => <ActiveChip active={row.userActive} /> },
      ]}
      filter={(row, text) =>
        `${row.name} ${row.email} ${row.sectorId} ${row.active ? 'ativo' : 'inativo'}`
          .toLocaleLowerCase('pt-BR')
          .includes(text)
      }
      create={{
        title: 'Novo motorista',
        fields: [userField],
        submit: (values) => driversApi.create({ userId: values.userId! }),
      }}
      actions={(row, open) => (
        <>
          <Button component={Link} to={`/motoristas/${row.id}/cnhs`} size="small">
            CNHs
          </Button>
          {row.active && (
            <Button
              size="small"
              color="error"
              onClick={() =>
                open({
                  title: `Desativar o motorista ${row.name}?`,
                  fields: [],
                  submit: () => driversApi.deactivate(row.id),
                })
              }
            >
              Desativar
            </Button>
          )}
        </>
      )}
    />
  );
}

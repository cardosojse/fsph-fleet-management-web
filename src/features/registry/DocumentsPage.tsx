import { Alert, Button, Chip, Stack } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { ApiFeedback } from '@/shared/components/ApiFeedback';
import { localDate, statusLabels } from '@/shared/format';
import type { Dto } from '@/shared/api/types';
import type { Field } from '@/shared/components/FormDialog';
import { driversApi, vehiclesApi } from './api';
import { RegistryScreen } from './RegistryScreen';

const documentTypes: Record<Dto['VehicleDocumentType'], string> = {
  LICENSING: 'Licenciamento',
  INSURANCE: 'Seguro',
  IPVA: 'IPVA',
  INSPECTION: 'Inspeção',
};
type Document = Dto['VehicleDocumentResponse'] | Dto['DriverLicenseResponse'];
function Validity({ row }: { row: Document }) {
  return (
    <Stack direction="row" spacing={1}>
      <Chip size="small" label={statusLabels[row.status]} />
      {row.expired ? (
        <Chip size="small" color="error" label="Vencido" />
      ) : row.expiringWithin30Days ? (
        <Chip size="small" color="warning" label="Vence em até 30 dias" />
      ) : null}
    </Stack>
  );
}

export function VehicleDocumentsPage() {
  const { id = '' } = useParams();
  const vehicle = useQuery({
    queryKey: ['registry', 'vehicle', id],
    queryFn: () => vehiclesApi.find(id),
  });
  const fields: Field[] = [
    {
      name: 'type',
      label: 'Tipo',
      required: true,
      options: Object.entries(documentTypes).map(([value, label]) => ({ value, label })),
    },
    { name: 'documentNumber', label: 'Número do documento', maxLength: 100 },
    { name: 'issuedOn', label: 'Data de emissão', type: 'date' },
    { name: 'expiresOn', label: 'Validade', type: 'date', required: true },
  ];
  return (
    <Stack spacing={2}>
      <Button component={Link} to="/veiculos" sx={{ alignSelf: 'flex-start' }}>
        Voltar aos veículos
      </Button>
      <ApiFeedback error={vehicle.error} />
      <Alert severity="info">
        Um novo documento substitui o registro vigente do mesmo tipo. O histórico é preservado.
      </Alert>
      <RegistryScreen
        key={id}
        name={`documents-${id}`}
        title={`Documentos${vehicle.data ? ` · ${vehicle.data.plate}` : ''}`}
        createLabel="Registrar documento"
        list={(signal) => vehiclesApi.documents(id, signal)}
        columns={[
          { label: 'Tipo', render: (row) => documentTypes[row.type] },
          { label: 'Número', render: (row) => row.documentNumber ?? '—' },
          { label: 'Emissão', render: (row) => localDate(row.issuedOn) },
          { label: 'Validade', render: (row) => localDate(row.expiresOn) },
          { label: 'Situação', render: (row) => <Validity row={row} /> },
        ]}
        create={{
          title: 'Registrar documento',
          fields,
          submit: (values) =>
            vehiclesApi.registerDocument(id, {
              type: values.type as Dto['VehicleDocumentType'],
              documentNumber: values.documentNumber || null,
              issuedOn: values.issuedOn || null,
              expiresOn: values.expiresOn!,
            }),
        }}
      />
    </Stack>
  );
}

export function DriverLicensesPage() {
  const { id = '' } = useParams();
  const driver = useQuery({
    queryKey: ['registry', 'driver', id],
    queryFn: () => driversApi.find(id),
  });
  return (
    <Stack spacing={2}>
      <Button component={Link} to="/motoristas" sx={{ alignSelf: 'flex-start' }}>
        Voltar aos motoristas
      </Button>
      <ApiFeedback error={driver.error} />
      <Alert severity="info">Uma nova CNH substitui a vigente. O histórico é preservado.</Alert>
      <RegistryScreen
        key={id}
        name={`licenses-${id}`}
        title={`CNHs${driver.data ? ` · ${driver.data.name}` : ''}`}
        createLabel="Registrar CNH"
        list={(signal) => driversApi.licenses(id, signal)}
        columns={[
          { label: 'Número', render: (row) => row.licenseNumber },
          { label: 'Categoria', render: (row) => row.category },
          { label: 'Emissão', render: (row) => localDate(row.issuedOn) },
          { label: 'Validade', render: (row) => localDate(row.expiresOn) },
          { label: 'Situação', render: (row) => <Validity row={row} /> },
        ]}
        create={{
          title: 'Registrar CNH',
          fields: [
            { name: 'licenseNumber', label: 'Número da CNH', required: true, maxLength: 30 },
            { name: 'category', label: 'Categoria', required: true, maxLength: 10 },
            { name: 'issuedOn', label: 'Data de emissão', type: 'date', required: true },
            { name: 'expiresOn', label: 'Validade', type: 'date', required: true },
          ],
          submit: (values) =>
            driversApi.registerLicense(id, {
              licenseNumber: values.licenseNumber!,
              category: values.category!,
              issuedOn: values.issuedOn!,
              expiresOn: values.expiresOn!,
            }),
        }}
      />
    </Stack>
  );
}

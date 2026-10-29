import { useMemo, useState, type FormEvent } from 'react';
import {
  Box,
  Button,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  MenuItem,
  Paper,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';

type Vehicle = {
  id: number;
  plate: string;
  model: string;
  category: string;
  driver: string;
  status: 'Ativo' | 'Manutenção' | 'Inativo';
};

type Driver = {
  id: number;
  name: string;
  license: string;
  sector: string;
  status: 'Disponível' | 'Em rota';
};

const initialVehicles: Vehicle[] = [
  {
    id: 1,
    plate: 'ABC-1D23',
    model: 'Fiat Argo',
    category: 'Passeio',
    driver: 'João Silva',
    status: 'Ativo',
  },
  {
    id: 2,
    plate: 'DEF-4G56',
    model: 'Chevrolet Onix',
    category: 'Passeio',
    driver: 'Maria Santos',
    status: 'Ativo',
  },
  {
    id: 3,
    plate: 'GHI-7J89',
    model: 'Fiat Fiorino',
    category: 'Utilitário',
    driver: 'Carlos Lima',
    status: 'Manutenção',
  },
  {
    id: 4,
    plate: 'JKL-2M34',
    model: 'Renault Master',
    category: 'Van',
    driver: 'Não atribuído',
    status: 'Inativo',
  },
];

const initialDrivers: Driver[] = [
  { id: 1, name: 'João Silva', license: '12345678901', sector: 'Operações', status: 'Disponível' },
  { id: 2, name: 'Maria Santos', license: '23456789012', sector: 'Logística', status: 'Em rota' },
  { id: 3, name: 'Carlos Lima', license: '34567890123', sector: 'Operações', status: 'Disponível' },
];

export function HomePage() {
  const [tab, setTab] = useState<'vehicles' | 'drivers'>('vehicles');
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [drivers, setDrivers] = useState(initialDrivers);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('Todos');
  const [open, setOpen] = useState(false);

  const [plate, setPlate] = useState('');
  const [model, setModel] = useState('');
  const [category, setCategory] = useState('Passeio');
  const [name, setName] = useState('');
  const [license, setLicense] = useState('');
  const [sector, setSector] = useState('');

  const visibleVehicles = useMemo(
    () =>
      vehicles.filter((vehicle) => {
        const text = `${vehicle.plate} ${vehicle.model} ${vehicle.driver} ${vehicle.category}`;
        return (
          text.toLowerCase().includes(search.toLowerCase()) &&
          (filter === 'Todos' || vehicle.status === filter)
        );
      }),
    [vehicles, search, filter],
  );

  const visibleDrivers = useMemo(
    () =>
      drivers.filter((driver) => {
        const text = `${driver.name} ${driver.license} ${driver.sector}`;
        return (
          text.toLowerCase().includes(search.toLowerCase()) &&
          (filter === 'Todos' || driver.status === filter)
        );
      }),
    [drivers, search, filter],
  );

  function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (tab === 'vehicles') {
      const normalizedPlate = plate.trim().toUpperCase();

      if (vehicles.some((vehicle) => vehicle.plate === normalizedPlate)) {
        window.alert('Já existe um veículo com essa placa.');
        return;
      }

      setVehicles((current) => [
        ...current,
        {
          id: Date.now(),
          plate: normalizedPlate,
          model: model.trim(),
          category,
          driver: 'Não atribuído',
          status: 'Ativo',
        },
      ]);
    } else {
      if (drivers.some((driver) => driver.license === license.trim())) {
        window.alert('Já existe um motorista com essa habilitação.');
        return;
      }

      setDrivers((current) => [
        ...current,
        {
          id: Date.now(),
          name: name.trim(),
          license: license.trim(),
          sector: sector.trim(),
          status: 'Disponível',
        },
      ]);
    }

    setOpen(false);
    setSearch('');
    setFilter('Todos');
  }

  function openForm() {
    setPlate('');
    setModel('');
    setCategory('Passeio');
    setName('');
    setLicense('');
    setSector('');
    setOpen(true);
  }

  const activeVehicles = vehicles.filter((vehicle) => vehicle.status === 'Ativo').length;
  const maintenance = vehicles.filter((vehicle) => vehicle.status === 'Manutenção').length;

  return (
    <Box component="main" sx={{ minHeight: '100vh', py: { xs: 3, md: 5 } }}>
      <Container maxWidth="xl">
        <Stack spacing={3}>
          <Box>
            <Typography variant="overline" color="primary" sx={{ fontWeight: 700 }}>
              FSPH · GESTÃO DE FROTAS
            </Typography>
            <Typography variant="h1" sx={{ fontSize: { xs: '2rem', md: '2.6rem' }, mt: 1 }}>
              Motoristas e Veículos
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Gerencie os cadastros e acompanhe as informações da frota.
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
              gap: 2,
            }}
          >
            {[
              { label: 'Total de veículos', value: vehicles.length },
              { label: 'Veículos ativos', value: activeVehicles },
              { label: 'Em manutenção', value: maintenance },
              { label: 'Motoristas', value: drivers.length },
            ].map((item) => (
              <Paper key={item.label} variant="outlined" sx={{ p: 3 }}>
                <Typography color="text.secondary" variant="body2">
                  {item.label}
                </Typography>
                <Typography variant="h4" sx={{ mt: 1, fontWeight: 700 }}>
                  {item.value}
                </Typography>
              </Paper>
            ))}
          </Box>

          <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
            <Box sx={{ px: 3, pt: 1 }}>
              <Tabs
                value={tab}
                onChange={(_, value: 'vehicles' | 'drivers') => {
                  setTab(value);
                  setSearch('');
                  setFilter('Todos');
                }}
              >
                <Tab label="Veículos" value="vehicles" />
                <Tab label="Motoristas" value="drivers" />
              </Tabs>
            </Box>

            <Divider />

            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={2}
              sx={{
                p: 3,
                justifyContent: 'space-between',
                alignItems: { md: 'center' },
              }}
            >
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {tab === 'vehicles' ? 'Veículos cadastrados' : 'Motoristas cadastrados'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pesquise e filtre os registros abaixo.
                </Typography>
              </Box>

              <Button variant="contained" onClick={openForm}>
                + Cadastrar {tab === 'vehicles' ? 'veículo' : 'motorista'}
              </Button>
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ px: 3, pb: 3 }}>
              <TextField
                fullWidth
                size="small"
                label="Pesquisar"
                placeholder={tab === 'vehicles' ? 'Placa ou modelo' : 'Nome ou habilitação'}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />

              <TextField
                select
                size="small"
                label="Status"
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
                sx={{ minWidth: 180 }}
              >
                <MenuItem value="Todos">Todos</MenuItem>
                {(tab === 'vehicles'
                  ? ['Ativo', 'Manutenção', 'Inativo']
                  : ['Disponível', 'Em rota']
                ).map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>

            <TableContainer>
              <Table>
                <TableHead>
                  {tab === 'vehicles' ? (
                    <TableRow>
                      <TableCell>Placa</TableCell>
                      <TableCell>Modelo</TableCell>
                      <TableCell>Categoria</TableCell>
                      <TableCell>Motorista</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  ) : (
                    <TableRow>
                      <TableCell>Nome</TableCell>
                      <TableCell>Habilitação</TableCell>
                      <TableCell>Setor</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  )}
                </TableHead>

                <TableBody>
                  {tab === 'vehicles'
                    ? visibleVehicles.map((vehicle) => (
                        <TableRow key={vehicle.id} hover>
                          <TableCell sx={{ fontWeight: 700 }}>{vehicle.plate}</TableCell>
                          <TableCell>{vehicle.model}</TableCell>
                          <TableCell>{vehicle.category}</TableCell>
                          <TableCell>{vehicle.driver}</TableCell>
                          <TableCell>
                            <Chip
                              label={vehicle.status}
                              color={
                                vehicle.status === 'Ativo'
                                  ? 'success'
                                  : vehicle.status === 'Manutenção'
                                    ? 'warning'
                                    : 'default'
                              }
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    : visibleDrivers.map((driver) => (
                        <TableRow key={driver.id} hover>
                          <TableCell sx={{ fontWeight: 700 }}>{driver.name}</TableCell>
                          <TableCell>{driver.license}</TableCell>
                          <TableCell>{driver.sector}</TableCell>
                          <TableCell>
                            <Chip
                              label={driver.status}
                              color={driver.status === 'Disponível' ? 'success' : 'info'}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}

                  {(tab === 'vehicles' ? visibleVehicles.length : visibleDrivers.length) === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                        Nenhum registro encontrado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <Divider />

            <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
              Exibindo {tab === 'vehicles' ? visibleVehicles.length : visibleDrivers.length}{' '}
              registro(s). Dados demonstrativos.
            </Typography>
          </Paper>
        </Stack>
      </Container>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <Box component="form" onSubmit={handleSave}>
          <DialogTitle>Cadastrar {tab === 'vehicles' ? 'veículo' : 'motorista'}</DialogTitle>

          <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
              {tab === 'vehicles' ? (
                <>
                  <TextField
                    label="Placa"
                    value={plate}
                    onChange={(event) => setPlate(event.target.value)}
                    required
                  />
                  <TextField
                    label="Modelo"
                    value={model}
                    onChange={(event) => setModel(event.target.value)}
                    required
                  />
                  <TextField
                    select
                    label="Categoria"
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                  >
                    {['Passeio', 'Utilitário', 'Van', 'Caminhão', 'Motocicleta'].map((item) => (
                      <MenuItem key={item} value={item}>
                        {item}
                      </MenuItem>
                    ))}
                  </TextField>
                </>
              ) : (
                <>
                  <TextField
                    label="Nome completo"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                  />
                  <TextField
                    label="Número da habilitação"
                    value={license}
                    onChange={(event) => setLicense(event.target.value)}
                    required
                  />
                  <TextField
                    label="Setor"
                    value={sector}
                    onChange={(event) => setSector(event.target.value)}
                    required
                  />
                </>
              )}
            </Stack>
          </DialogContent>

          <DialogActions sx={{ p: 3 }}>
            <Button color="inherit" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="contained">
              Salvar
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}

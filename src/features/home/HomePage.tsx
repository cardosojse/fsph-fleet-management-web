import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Alert,
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useFleetData } from './fleet-data';
import type { Driver, Vehicle } from './types';
import { formatMoney } from '@/features/vehicles/vehicle-validation';
import { DemoStates } from './DemoStates';

export function HomePage({ tab }: { tab: 'vehicles' | 'drivers' }) {
  const { vehicles, drivers } = useFleetData();
  const navigate = useNavigate();
  const location = useLocation();
  const createdName: unknown = location.state?.driverCreated;
  const createdPlate: unknown = location.state?.vehicleCreated;
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('Todos');

  const [sectorFilter, setSectorFilter] = useState('Todos');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

  function clearFilters() {
    setSearch('');
    setFilter('Todos');
    setSectorFilter('Todos');
  }

  const visibleVehicles = useMemo(
    () =>
      vehicles.filter((vehicle) => {
        const text = `${vehicle.plate} ${vehicle.model} ${vehicle.driver} ${vehicle.category}`;
        return (
          text.toLowerCase().includes(search.trim().toLowerCase()) &&
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
          text.toLowerCase().includes(search.trim().toLowerCase()) &&
          (filter === 'Todos' || driver.status === filter) &&
          (sectorFilter === 'Todos' || driver.sector === sectorFilter)
        );
      }),
    [drivers, search, filter, sectorFilter],
  );

  const activeVehicles = vehicles.filter((vehicle) => vehicle.status === 'Ativo').length;
  const maintenance = vehicles.filter((vehicle) => vehicle.status === 'Manutenção').length;

  return (
    <Box component="main" id="main-content" sx={{ minHeight: '100vh', py: { xs: 3, md: 5 } }}>
      <Container maxWidth="xl">
        <Stack spacing={3}>
          {tab === 'drivers' && typeof createdName === 'string' && (
            <Alert severity="success" role="status">
              Motorista {createdName} cadastrado com sucesso nesta sessão.
            </Alert>
          )}
          {tab === 'vehicles' && typeof createdPlate === 'string' && (
            <Alert severity="success" role="status">
              Veículo {createdPlate} cadastrado com sucesso nesta sessão.
            </Alert>
          )}
          <Box
            component="header"
            sx={{ bgcolor: 'background.paper', borderBottom: '1px solid #d0d5dd', p: 3 }}
          >
            <Typography variant="overline" color="primary" sx={{ fontWeight: 700 }}>
              FSPH · GESTÃO DE FROTAS
            </Typography>
            <Typography variant="h1" sx={{ fontSize: { xs: '1.75rem', md: '2rem' }, mt: 1 }}>
              {tab === 'drivers' ? 'Motoristas' : 'Veículos'}
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Gerencie os cadastros e acompanhe as informações da frota.
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
              gap: 2,
            }}
          >
            {(tab === 'vehicles'
              ? [
                  { label: 'Total de veículos', value: vehicles.length },
                  { label: 'Veículos ativos', value: activeVehicles },
                  { label: 'Em manutenção', value: maintenance },
                ]
              : [
                  { label: 'Total de motoristas', value: drivers.length },
                  {
                    label: 'Disponíveis',
                    value: drivers.filter((driver) => driver.status === 'Disponível').length,
                  },
                  {
                    label: 'Em rota',
                    value: drivers.filter((driver) => driver.status === 'Em rota').length,
                  },
                ]
            ).map((item) => (
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

              <Button
                variant="contained"
                onClick={() => navigate(tab === 'drivers' ? '/motoristas/novo' : '/veiculos/novo')}
              >
                {tab === 'vehicles' ? '+ Cadastrar veículo' : 'Cadastrar novo motorista'}
              </Button>
            </Stack>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ px: 3, pb: 3 }}>
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
                  : ['Disponível', 'Em rota', 'Indisponível']
                ).map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </TextField>
              {tab === 'drivers' && (
                <TextField
                  select
                  size="small"
                  label="Setor"
                  value={sectorFilter}
                  onChange={(event) => setSectorFilter(event.target.value)}
                  sx={{ minWidth: 180 }}
                >
                  <MenuItem value="Todos">Todos</MenuItem>
                  {[...new Set(drivers.map((driver) => driver.sector))].map((sector) => (
                    <MenuItem key={sector} value={sector}>
                      {sector}
                    </MenuItem>
                  ))}
                </TextField>
              )}
              <Button onClick={clearFilters} sx={{ flexShrink: 0 }}>
                Limpar filtros
              </Button>
            </Stack>
            <TableContainer
              tabIndex={0}
              role="region"
              aria-label="Lista de cadastros"
              sx={{ '&:focus-visible': { outline: '2px solid #2563eb', outlineOffset: -2 } }}
            >
              <Table
                aria-label={tab === 'drivers' ? 'Motoristas cadastrados' : 'Veículos cadastrados'}
              >
                <TableHead>
                  {tab === 'vehicles' ? (
                    <TableRow>
                      <TableCell>Placa</TableCell>
                      <TableCell>Modelo</TableCell>
                      <TableCell>Categoria</TableCell>
                      <TableCell>Motorista</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Ações</TableCell>
                    </TableRow>
                  ) : (
                    <TableRow>
                      <TableCell>Nome</TableCell>
                      <TableCell>Habilitação</TableCell>
                      <TableCell>Setor</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Ações</TableCell>
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
                          <TableCell>
                            <Button
                              aria-label={`Detalhes do veículo ${vehicle.plate}`}
                              onClick={() => setSelectedVehicle(vehicle)}
                            >
                              Detalhes
                            </Button>
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
                          <TableCell>
                            <Button
                              aria-label={`Detalhes do motorista ${driver.name}`}
                              onClick={() => setSelectedDriver(driver)}
                            >
                              Detalhes
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}

                  {(tab === 'vehicles' ? visibleVehicles.length : visibleDrivers.length) === 0 && (
                    <TableRow>
                      <TableCell colSpan={tab === 'vehicles' ? 6 : 5} align="center" sx={{ py: 4 }}>
                        {(tab === 'vehicles' ? vehicles.length : drivers.length) === 0
                          ? 'Nenhum cadastro nesta lista.'
                          : 'Nenhum resultado para os filtros selecionados.'}
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
          <DemoStates />
        </Stack>
      </Container>

      <Dialog
        open={selectedDriver !== null}
        onClose={() => setSelectedDriver(null)}
        fullWidth
        maxWidth="sm"
        aria-labelledby="driver-details-title"
      >
        <DialogTitle id="driver-details-title">Detalhes do motorista</DialogTitle>
        <DialogContent>
          {selectedDriver && (
            <Stack spacing={1}>
              <Typography>Nome: {selectedDriver.name}</Typography>
              <Typography>Habilitação: {selectedDriver.license}</Typography>
              <Typography>Setor: {selectedDriver.sector}</Typography>
              <Typography>Status: {selectedDriver.status}</Typography>
              {selectedDriver.cpf && <Typography>CPF: {selectedDriver.cpf}</Typography>}
              {selectedDriver.phone && <Typography>Telefone: {selectedDriver.phone}</Typography>}
              {selectedDriver.email && <Typography>E-mail: {selectedDriver.email}</Typography>}
              {selectedDriver.licenseCategory && (
                <Typography>Categoria da CNH: {selectedDriver.licenseCategory}</Typography>
              )}
              {selectedDriver.licenseExpiry && (
                <Typography>Validade da CNH: {selectedDriver.licenseExpiry}</Typography>
              )}
              {selectedDriver.document && (
                <Typography>Documento: {selectedDriver.document}</Typography>
              )}
              {selectedDriver.linkedAccount && (
                <Typography>Conta vinculada (simulação): {selectedDriver.linkedAccount}</Typography>
              )}
              {selectedDriver.profile && <Typography>Perfil: {selectedDriver.profile}</Typography>}
              {selectedDriver.availability && (
                <Typography>Disponibilidade: {selectedDriver.availability}</Typography>
              )}
              {selectedDriver.shift && (
                <>
                  <Typography>Equipe (simulação): {selectedDriver.shift.team}</Typography>
                  <Typography>
                    Plantão: {selectedDriver.shift.date} · {selectedDriver.shift.start} às{' '}
                    {selectedDriver.shift.end}
                  </Typography>
                  <Typography>
                    Veículo:{' '}
                    {vehicles.find(({ id }) => id === selectedDriver.shift?.vehicleId)?.plate ??
                      'Não informado'}
                  </Typography>
                </>
              )}
              <Alert severity="info">Dados demonstrativos.</Alert>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedDriver(null)}>Fechar</Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={selectedVehicle !== null}
        onClose={() => setSelectedVehicle(null)}
        fullWidth
        maxWidth="sm"
        aria-labelledby="vehicle-details-title"
      >
        <DialogTitle id="vehicle-details-title">Detalhes do veículo</DialogTitle>
        <DialogContent>
          {selectedVehicle && (
            <Stack spacing={1}>
              <Typography>Placa: {selectedVehicle.plate}</Typography>
              <Typography>Modelo: {selectedVehicle.model}</Typography>
              <Typography>Categoria: {selectedVehicle.category}</Typography>
              <Typography>Motorista: {selectedVehicle.driver}</Typography>
              <Typography>Status: {selectedVehicle.status}</Typography>
              {selectedVehicle.year !== undefined && (
                <Typography>Ano: {selectedVehicle.year}</Typography>
              )}
              {selectedVehicle.sector && <Typography>Setor: {selectedVehicle.sector}</Typography>}
              {selectedVehicle.fuel && <Typography>Combustível: {selectedVehicle.fuel}</Typography>}
              {selectedVehicle.crlvExpiry && (
                <Typography>CRLV vigente até: {selectedVehicle.crlvExpiry}</Typography>
              )}
              {selectedVehicle.insuranceExpiry && (
                <Typography>Seguro vigente até: {selectedVehicle.insuranceExpiry}</Typography>
              )}
              {selectedVehicle.documentReferences && (
                <Typography>
                  Documentos anexos (referências): {selectedVehicle.documentReferences}
                </Typography>
              )}
              {selectedVehicle.notes && (
                <Typography>Observações: {selectedVehicle.notes}</Typography>
              )}
              {selectedVehicle.capacity !== undefined && (
                <Typography>Capacidade máxima: {selectedVehicle.capacity}</Typography>
              )}
              {selectedVehicle.mileage !== undefined && (
                <Typography>Quilometragem atual: {selectedVehicle.mileage}</Typography>
              )}
              {selectedVehicle.occupancy !== undefined && (
                <Typography>Ocupação atual: {selectedVehicle.occupancy}</Typography>
              )}
              {selectedVehicle.lastRefueling && (
                <Typography>
                  Abastecimento (último): {selectedVehicle.lastRefueling.description}
                  {selectedVehicle.lastRefueling.fuel
                    ? ` · ${selectedVehicle.lastRefueling.fuel}`
                    : ''}
                </Typography>
              )}
              {selectedVehicle.card && (
                <>
                  <Typography>
                    Limite da carta: {formatMoney(selectedVehicle.card.limitCents)}
                  </Typography>
                  <Typography>
                    Valor usado: {formatMoney(selectedVehicle.card.usedCents)}
                  </Typography>
                  <Typography>
                    Saldo disponível:{' '}
                    {formatMoney(selectedVehicle.card.limitCents - selectedVehicle.card.usedCents)}
                  </Typography>
                  <Typography>Validade da carta: {selectedVehicle.card.expiry}</Typography>
                  {selectedVehicle.card.notes && (
                    <Typography>Observações da carta: {selectedVehicle.card.notes}</Typography>
                  )}
                </>
              )}
              <Alert severity="info">Dados demonstrativos. Integração com a API pendente.</Alert>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedVehicle(null)}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

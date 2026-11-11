import type { ReactNode } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

export type Column<T> = { label: string; render: (row: T) => ReactNode };
export function DataTable<T extends { id: string }>({
  rows,
  columns,
  actions,
}: {
  rows: T[];
  columns: Column<T>[];
  actions?: (row: T) => ReactNode;
}) {
  return (
    <TableContainer component={Paper} variant="outlined">
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell key={column.label}>{column.label}</TableCell>
            ))}
            {actions && <TableCell align="right">Ações</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id} hover>
              {columns.map((column) => (
                <TableCell key={column.label}>{column.render(row)}</TableCell>
              ))}
              {actions && (
                <TableCell align="right" sx={{ minWidth: 170 }}>
                  {actions(row)}
                </TableCell>
              )}
            </TableRow>
          ))}
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={columns.length + (actions ? 1 : 0)}>
                <Typography color="text.secondary" sx={{ py: 3 }}>
                  Nenhum registro encontrado.
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

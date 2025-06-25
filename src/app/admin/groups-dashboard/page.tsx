'use client';
import { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, IconButton, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';

interface Group {
  id: number;
  name: string;
  description: string;
  createdAt: string;
}

export default function GroupsDashboard() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [open, setOpen] = useState(false);
  const [editGroup, setEditGroup] = useState<Group | null>(null);

  useEffect(() => {
    // TODO: fetch groups from API
    setGroups([
      { id: 1, name: 'Nhóm Âm nhạc', description: 'Chia sẻ về âm nhạc', createdAt: '2024-01-01' },
      { id: 2, name: 'Nhóm Hội họa', description: 'Chia sẻ về hội họa', createdAt: '2024-02-01' },
    ]);
  }, []);

  return (
    <Box>
      <Typography variant="h4" mb={2}>Quản lý nhóm</Typography>
      <Button variant="contained" startIcon={<AddIcon />} sx={{ mb: 2 }} onClick={() => { setEditGroup({ id: 0, name: '', description: '', createdAt: '' }); setOpen(true); }}>Thêm nhóm</Button>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tên nhóm</TableCell>
              <TableCell>Mô tả</TableCell>
              <TableCell>Ngày tạo</TableCell>
              <TableCell align="right">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {groups.map(group => (
              <TableRow key={group.id}>
                <TableCell>{group.name}</TableCell>
                <TableCell>{group.description}</TableCell>
                <TableCell>{group.createdAt}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => { setEditGroup(group); setOpen(true); }}><EditIcon /></IconButton>
                  <IconButton color="error"><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{editGroup?.id ? 'Chỉnh sửa nhóm' : 'Thêm nhóm'}</DialogTitle>
        <DialogContent>
          <TextField label="Tên nhóm" fullWidth sx={{ mb: 2 }} value={editGroup?.name || ''} onChange={e => setEditGroup({ ...editGroup!, name: e.target.value })} />
          <TextField label="Mô tả" fullWidth sx={{ mb: 2 }} value={editGroup?.description || ''} onChange={e => setEditGroup({ ...editGroup!, description: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Hủy</Button>
          <Button variant="contained" onClick={() => setOpen(false)}>{editGroup?.id ? 'Lưu' : 'Thêm'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 
'use client';
import { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, Chip, Avatar } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon } from '@mui/icons-material';

interface User {
  id: number;
  email: string;
  fullName: string;
  role: string;
  status: 'active' | 'blocked';
  createdAt: string;
  lastLogin: string;
  imageUrl?: string;
}

export default function UsersDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [editUser, setEditUser] = useState<User | null>(null);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  useEffect(() => {
    // TODO: fetch users from API
    setUsers([
      { id: 1, email: 'admin@example.com', fullName: 'Admin', role: 'Admin', status: 'active', createdAt: '2024-01-01', lastLogin: '2024-06-01', imageUrl: '' },
      { id: 2, email: 'user@example.com', fullName: 'User', role: 'User', status: 'blocked', createdAt: '2024-02-01', lastLogin: '2024-06-02', imageUrl: '' },
    ]);
  }, []);

  const filtered = users.filter(u => u.email.includes(search) || u.fullName.includes(search));

  return (
    <Box>
      <Typography variant="h4" mb={2}>Quản lý người dùng</Typography>
      <Box mb={2} display="flex" gap={2}>
        <TextField size="small" placeholder="Tìm kiếm..." value={search} onChange={e => setSearch(e.target.value)} InputProps={{ startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1 }} /> }} />
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Avatar</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Họ tên</TableCell>
              <TableCell>Vai trò</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Ngày tạo</TableCell>
              <TableCell>Đăng nhập cuối</TableCell>
              <TableCell align="right">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map(user => (
              <TableRow key={user.id}>
                <TableCell><Avatar src={user.imageUrl}>{user.fullName[0]}</Avatar></TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.fullName}</TableCell>
                <TableCell><Chip label={user.role} color={user.role === 'Admin' ? 'error' : 'default'} size="small" /></TableCell>
                <TableCell><Chip label={user.status === 'active' ? 'Hoạt động' : 'Bị khóa'} color={user.status === 'active' ? 'success' : 'error'} size="small" /></TableCell>
                <TableCell>{user.createdAt}</TableCell>
                <TableCell>{user.lastLogin}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => { setEditUser(user); setOpenEdit(true); }}><EditIcon /></IconButton>
                  <IconButton color="error" onClick={() => { setEditUser(user); setOpenDelete(true); }}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {/* Edit Dialog */}
      <Dialog open={openEdit} onClose={() => setOpenEdit(false)}>
        <DialogTitle>Chỉnh sửa người dùng</DialogTitle>
        <DialogContent>
          {editUser && <>
            <TextField label="Họ tên" fullWidth sx={{ mb: 2 }} value={editUser.fullName} onChange={e => setEditUser({ ...editUser, fullName: e.target.value })} />
            <TextField label="Email" fullWidth sx={{ mb: 2 }} value={editUser.email} onChange={e => setEditUser({ ...editUser, email: e.target.value })} />
            <TextField label="Vai trò" fullWidth select value={editUser.role} onChange={e => setEditUser({ ...editUser, role: e.target.value })}>
              <MenuItem value="User">User</MenuItem>
              <MenuItem value="Admin">Admin</MenuItem>
            </TextField>
          </>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEdit(false)}>Hủy</Button>
          <Button variant="contained" onClick={() => setOpenEdit(false)}>Lưu</Button>
        </DialogActions>
      </Dialog>
      {/* Delete Dialog */}
      <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>Bạn có chắc muốn xóa người dùng này?</DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDelete(false)}>Hủy</Button>
          <Button color="error" variant="contained" onClick={() => setOpenDelete(false)}>Xóa</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 
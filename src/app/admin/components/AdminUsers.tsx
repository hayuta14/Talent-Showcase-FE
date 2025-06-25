'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Chip,
  Avatar,
  Menu,
  MenuItem,
  Alert,
  CircularProgress,
  TablePagination
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreIcon,
  Block as BlockIcon,
  CheckCircle as UnblockIcon,
  Search as SearchIcon
} from '@mui/icons-material';

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

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      // TODO: Implement API call to get users
      const mockUsers: User[] = [
        {
          id: 1,
          email: 'admin@example.com',
          fullName: 'Admin User',
          role: 'Admin',
          status: 'active',
          createdAt: '2024-01-15',
          lastLogin: '2024-01-25',
          imageUrl: 'https://via.placeholder.com/40'
        },
        {
          id: 2,
          email: 'user@example.com',
          fullName: 'Regular User',
          role: 'User',
          status: 'active',
          createdAt: '2024-01-20',
          lastLogin: '2024-01-24',
          imageUrl: 'https://via.placeholder.com/40'
        },
        {
          id: 3,
          email: 'talent@example.com',
          fullName: 'Talent User',
          role: 'Talent',
          status: 'blocked',
          createdAt: '2024-01-18',
          lastLogin: '2024-01-22',
          imageUrl: 'https://via.placeholder.com/40'
        }
      ];
      setUsers(mockUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditDialogOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleBlockUser = async (user: User) => {
    try {
      // TODO: Implement API call to block user
      setUsers(users.map(u => 
        u.id === user.id 
          ? { ...u, status: u.status === 'active' ? 'blocked' : 'active' }
          : u
      ));
    } catch (error) {
      console.error('Error blocking user:', error);
    }
  };

  const handleSaveUser = async () => {
    if (!selectedUser) return;
    
    try {
      // TODO: Implement API call to update user
      setUsers(users.map(u => 
        u.id === selectedUser.id ? selectedUser : u
      ));
      setEditDialogOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;
    
    try {
      // TODO: Implement API call to delete user
      setUsers(users.filter(u => u.id !== selectedUser.id));
      setDeleteDialogOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedUsers = filteredUsers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">
          Quản lý người dùng ({users.length})
        </Typography>
        <TextField
          placeholder="Tìm kiếm người dùng..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
          }}
          size="small"
          sx={{ width: 300 }}
        />
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Người dùng</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Vai trò</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Ngày tạo</TableCell>
              <TableCell>Đăng nhập cuối</TableCell>
              <TableCell align="right">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar src={user.imageUrl} sx={{ width: 40, height: 40 }}>
                      {user.fullName[0]}
                    </Avatar>
                    <Typography variant="body2" fontWeight="medium">
                      {user.fullName}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip 
                    label={user.role} 
                    color={user.role === 'Admin' ? 'error' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={user.status === 'active' ? 'Hoạt động' : 'Bị khóa'}
                    color={user.status === 'active' ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell>{new Date(user.createdAt).toLocaleDateString('vi-VN')}</TableCell>
                <TableCell>{new Date(user.lastLogin).toLocaleDateString('vi-VN')}</TableCell>
                <TableCell align="right">
                  <IconButton
                    onClick={(e) => setAnchorEl(e.currentTarget)}
                    size="small"
                  >
                    <MoreIcon />
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={() => setAnchorEl(null)}
                  >
                    <MenuItem onClick={() => { handleEditUser(user); setAnchorEl(null); }}>
                      <EditIcon sx={{ mr: 1 }} fontSize="small" />
                      Chỉnh sửa
                    </MenuItem>
                    <MenuItem onClick={() => { handleBlockUser(user); setAnchorEl(null); }}>
                      {user.status === 'active' ? (
                        <>
                          <BlockIcon sx={{ mr: 1 }} fontSize="small" />
                          Khóa
                        </>
                      ) : (
                        <>
                          <UnblockIcon sx={{ mr: 1 }} fontSize="small" />
                          Mở khóa
                        </>
                      )}
                    </MenuItem>
                    <MenuItem 
                      onClick={() => { handleDeleteUser(user); setAnchorEl(null); }}
                      sx={{ color: 'error.main' }}
                    >
                      <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
                      Xóa
                    </MenuItem>
                  </Menu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredUsers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          labelRowsPerPage="Hàng mỗi trang:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} của ${count}`}
        />
      </TableContainer>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Chỉnh sửa người dùng</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="Họ tên"
                value={selectedUser.fullName}
                onChange={(e) => setSelectedUser({ ...selectedUser, fullName: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Email"
                value={selectedUser.email}
                onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Vai trò"
                value={selectedUser.role}
                onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
                select
                sx={{ mb: 2 }}
              >
                <MenuItem value="User">User</MenuItem>
                <MenuItem value="Talent">Talent</MenuItem>
                <MenuItem value="Admin">Admin</MenuItem>
              </TextField>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Hủy</Button>
          <Button onClick={handleSaveUser} variant="contained">Lưu</Button>
        </DialogActions>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa người dùng "{selectedUser?.fullName}"? 
            Hành động này không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Hủy</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 
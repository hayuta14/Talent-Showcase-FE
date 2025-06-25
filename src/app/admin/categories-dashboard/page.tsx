'use client';
import { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, IconButton, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';

interface Category {
  id: number;
  name: string;
  description: string;
}

export default function CategoriesDashboard() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [openDelete, setOpenDelete] = useState(false);

  useEffect(() => {
    // TODO: fetch categories from API
    setCategories([
      { id: 1, name: 'Âm nhạc', description: 'Tất cả về âm nhạc' },
      { id: 2, name: 'Hội họa', description: 'Tài năng hội họa' },
    ]);
  }, []);

  return (
    <Box>
      <Typography variant="h4" mb={2}>Quản lý danh mục</Typography>
      <Button variant="contained" startIcon={<AddIcon />} sx={{ mb: 2 }} onClick={() => { setEditCategory({ id: 0, name: '', description: '' }); setOpen(true); }}>Thêm danh mục</Button>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tên danh mục</TableCell>
              <TableCell>Mô tả</TableCell>
              <TableCell align="right">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map(category => (
              <TableRow key={category.id}>
                <TableCell>{category.name}</TableCell>
                <TableCell>{category.description}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => { setEditCategory(category); setOpen(true); }}><EditIcon /></IconButton>
                  <IconButton color="error" onClick={() => { setEditCategory(category); setOpenDelete(true); }}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{editCategory?.id ? 'Chỉnh sửa danh mục' : 'Thêm danh mục'}</DialogTitle>
        <DialogContent>
          <TextField label="Tên danh mục" fullWidth sx={{ mb: 2 }} value={editCategory?.name || ''} onChange={e => setEditCategory({ ...editCategory!, name: e.target.value })} />
          <TextField label="Mô tả" fullWidth sx={{ mb: 2 }} value={editCategory?.description || ''} onChange={e => setEditCategory({ ...editCategory!, description: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Hủy</Button>
          <Button variant="contained" onClick={() => setOpen(false)}>{editCategory?.id ? 'Lưu' : 'Thêm'}</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>Bạn có chắc muốn xóa danh mục này?</DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDelete(false)}>Hủy</Button>
          <Button color="error" variant="contained" onClick={() => setOpenDelete(false)}>Xóa</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 
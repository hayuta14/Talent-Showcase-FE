'use client';

import { useState } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';

interface Category {
  id: number;
  name: string;
  description: string;
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([
    { id: 1, name: 'Âm nhạc', description: 'Tất cả về âm nhạc' },
    { id: 2, name: 'Hội họa', description: 'Tài năng hội họa' },
  ]);
  const [open, setOpen] = useState(false);
  const [newCategory, setNewCategory] = useState<Category>({ id: 0, name: '', description: '' });

  const handleAdd = () => {
    setNewCategory({ id: 0, name: '', description: '' });
    setOpen(true);
  };

  const handleSave = () => {
    setCategories([
      ...categories,
      { ...newCategory, id: categories.length + 1 }
    ]);
    setOpen(false);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5">Quản lý danh mục ({categories.length})</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>Thêm danh mục</Button>
      </Box>
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
            {categories.map((cat) => (
              <TableRow key={cat.id}>
                <TableCell>{cat.name}</TableCell>
                <TableCell>{cat.description}</TableCell>
                <TableCell align="right">
                  <IconButton><EditIcon /></IconButton>
                  <IconButton color="error"><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Thêm danh mục</DialogTitle>
        <DialogContent>
          <TextField
            label="Tên danh mục"
            fullWidth
            value={newCategory.name}
            onChange={e => setNewCategory({ ...newCategory, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Mô tả"
            fullWidth
            value={newCategory.description}
            onChange={e => setNewCategory({ ...newCategory, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Hủy</Button>
          <Button onClick={handleSave} variant="contained">Lưu</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 
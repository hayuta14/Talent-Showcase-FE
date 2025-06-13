import { Box, IconButton, Tooltip } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import PeopleIcon from '@mui/icons-material/People';
import PublicIcon from '@mui/icons-material/Public';
import EventIcon from '@mui/icons-material/Event';
import GroupIcon from '@mui/icons-material/Group';
import NotificationsIcon from '@mui/icons-material/Notifications';

const menu = [
  { icon: <HomeIcon fontSize="large" />, label: 'Feed', active: true },
  { icon: <PeopleIcon fontSize="large" />, label: 'Connections' },
  { icon: <PublicIcon fontSize="large" />, label: 'Latest News' },
  { icon: <EventIcon fontSize="large" />, label: 'Events' },
  { icon: <GroupIcon fontSize="large" />, label: 'Groups' },
  { icon: <NotificationsIcon fontSize="large" />, label: 'Notifications' },
];

export default function SidebarMenu() {
  return (
    <Box className="flex flex-row justify-center items-center gap-x-8 py-2 bg-white rounded-xl shadow mb-6">
      {menu.map((item, idx) => (
        <Tooltip title={item.label} key={item.label}>
          <IconButton
            className={`flex flex-col items-center ${item.active ? 'text-blue-600' : 'text-gray-500'} relative`}
            sx={{
              borderRadius: 2,
              px: 2,
              ...(item.active && {
                '&:after': {
                  content: '""',
                  display: 'block',
                  width: '60%',
                  height: '3px',
                  background: '#2563eb',
                  borderRadius: '2px',
                  margin: '6px auto 0',
                },
              }),
            }}
          >
            {item.icon}
          </IconButton>
        </Tooltip>
      ))}
    </Box>
  );
} 
import React, { useState } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";

//drawer elements used
import Drawer from "@mui/material/Drawer";
import CloseIcon from "@mui/icons-material/Close";
import Divider from "@mui/material/Divider";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import FolderIcon from "@mui/icons-material/Folder";
import ImageIcon from "@mui/icons-material/Image";
import DescriptionIcon from "@mui/icons-material/Description";
import { NavLink } from "react-router-dom";

function MainNavigation() {

  /*
  react useState hook to save the current open/close state of the drawer,
  normally variables dissapear afte the function was executed
  */
  const [open, setState] = useState(false);

  
  /*
  function that is being called every time the drawer should open or close,
  the keys tab and shift are excluded so the user can focus between
  the elements with the keys
  */
  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    //changes the function state according to the value of open
    setState(open);
  };

  return (

    <AppBar position="static">
      <Container maxWidth="lg" disableGutters="true">
        <Toolbar>

            <Typography variant="h6" sx={{flexGrow: 1, fontWeight: 700}}>
              BlueRetro
            </Typography>

            <Box sx={{mb: 2, display: {
                  xs: 'none',
                  sm: 'none',
                  md: 'none',
                  lg: 'flex'
                }}}>
                  <NavLink to="/advancedconfig">
                    <ListItemButton>
                      <ListItemIcon>
                        <ImageIcon sx={{color: "primary.main"}}/>
                      </ListItemIcon>
                      <ListItemText primary="Advanced Config" />
                      
                    </ListItemButton>
                    </NavLink>

                    <NavLink to="/n64ctrlpak">
                    <ListItemButton>
                      <ListItemIcon>
                        <FolderIcon sx={{color: "primary.main"}} />
                      </ListItemIcon>
                      <ListItemText primary="N64 controller pak manager" />
                    </ListItemButton>
                    </NavLink>

                    <NavLink to="/presets">
                    <ListItemButton>
                      <ListItemIcon>
                        <FolderIcon sx={{color: "primary.main"}} />
                      </ListItemIcon>
                      <ListItemText primary="Presets" />
                    </ListItemButton>
                    </NavLink>

                    <NavLink to="/presetsmaker">
                    <ListItemButton>
                      <ListItemIcon>
                        <FolderIcon sx={{color: "primary.main"}} />
                      </ListItemIcon>
                      <ListItemText primary="Preset Maker" />
                    </ListItemButton>
                    </NavLink>

                    <NavLink to="/ota">
                    <ListItemButton>
                      <ListItemIcon>
                        <DescriptionIcon sx={{color: "primary.main"}}/>
                      </ListItemIcon >
                      <ListItemText primary="OTA update" />
                    </ListItemButton>
                    </NavLink>

                  </Box>

            <IconButton 
              edge="start" 
              color="inherit"
              aria-label="open drawer" 
              onClick={toggleDrawer(true)}
              sx={{
                mr: 2,
                display: {
                  xs: 'block',
                  sm: 'block',
                  md: 'none',
                }
              }}
            >
              <MenuIcon />
            </IconButton>

            {/* The outside of the drawer */}
            <Drawer
              //from which side the drawer slides in
              anchor="right"
              //if open is true --> drawer is shown
              open={open}
              //function that is called when the drawer should close
              onClose={toggleDrawer(false)}
              //function that is called when the drawer should open
              onOpen={toggleDrawer(true)}
            >
                {/* The inside of the drawer */}
                <Box sx={{
                  p: 2,
                  height: 1,
                  backgroundColor: "#09d3ff",
                }}>

                  {/* 
                  when clicking the icon it calls the function toggleDrawer 
                  and closes the drawer by setting the variable open to false
                  */}
                  <IconButton onClick={toggleDrawer(false)} sx={{mb: 2}}>
                    <CloseIcon  />
                  </IconButton>

                  <Divider sx={{mb: 2}} />

                  <Box sx={{mb: 2}}>
                  <NavLink to="/advancedconfig">
                    <ListItemButton>
                      <ListItemIcon>
                        <ImageIcon sx={{color: "primary.main"}}/>
                      </ListItemIcon>
                      <ListItemText primary="Advanced Config" />
                      
                    </ListItemButton>
                    </NavLink>

                    <NavLink to="/n64ctrlpak">
                    <ListItemButton>
                      <ListItemIcon>
                        <FolderIcon sx={{color: "primary.main"}} />
                      </ListItemIcon>
                      <ListItemText primary="N64 controller pak manager" />
                    </ListItemButton>
                    </NavLink>

                    <NavLink to="/presets">
                    <ListItemButton>
                      <ListItemIcon>
                        <FolderIcon sx={{color: "primary.main"}} />
                      </ListItemIcon>
                      <ListItemText primary="Presets" />
                    </ListItemButton>
                    </NavLink>

                    <NavLink to="/presetsmaker">
                    <ListItemButton>
                      <ListItemIcon>
                        <FolderIcon sx={{color: "primary.main"}} />
                      </ListItemIcon>
                      <ListItemText primary="Preset Maker" />
                    </ListItemButton>
                    </NavLink>

                    <NavLink to="/ota">
                    <ListItemButton>
                      <ListItemIcon>
                        <DescriptionIcon sx={{color: "primary.main"}}/>
                      </ListItemIcon >
                      <ListItemText primary="OTA update" />
                    </ListItemButton>
                    </NavLink>

                  </Box>

                  <Box sx={{
                    display: "flex", 
                    justifyContent:"center", 
                    position: "absolute", 
                    bottom: "0", 
                    left: "50%", 
                    transform: "translate(-50%, 0)"}}
                  >

                  </Box>
                </Box>
              
            </Drawer>
           

          </Toolbar>
      </Container>
    </AppBar>

  );
}

export default MainNavigation
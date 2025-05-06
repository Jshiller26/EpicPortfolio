# 🖥️ Windows OS Portfolio

A Windows-inspired interactive portfolio website built with Next.js.

## ✨ Overview

This is a personal portfolio site built to showcase some of my past projects / skills and provide some information about me. This web app is a parody of Windows OS, featuring a fully functional file system, a familiar user interface, and a few pre-installed apps.

## 🔐 Lock Screen and Authorization

- **Lock Screen**: Displays current time and date in real-time with Windows-style loading animations and transitions
- **Login Screen**: User authentication with password field and forgot password hint
- **Session Management**: Persistent authentication using sessionStorage
- **Secure Authentication**: Server-side password validation

## 💻 Desktop / Home Screen

- **Desktop Windows**
  - Draggable and resizable windows with maximize/minimize controls
  - Proper window stacking and z-index management
  - Auto-focusing of active windows with visual indicators
  - Window session management that persists across usage

- **Desktop Icons**
  - Grid-based icon layout with automatic positioning
  - Draggable icons with position memory
  - Double-click functionality to open applications/files
  - Right-click context menus for file management operations
  - File/folder creation directly on desktop through context menu

- **Taskbar**
  - Centered taskbar layout with running application indicators
  - Active application highlighting with blue indicator dot
  - Live date and time display with real-time updates
  - Search bar with file/folder/app searching capabilities

- **Start Menu**
  - Pinned applications section
  - Recommended/recent files section
  - Quick access to common folders
  - Power button for system shutdown

## 📁 File System

- **File Explorer**
  - Windows-style navigation with path breadcrumbs
  - Back, forward, and up directory navigation
  - Address bar for quick navigation
  - Context menu for file operations

- **File Management**
  - Create, rename, and delete files and folders
  - Cut, copy, and paste operations
  - Drag and drop between folders

- **Structure and Types**
  - Hierarchical directory structure with parent-child relationships
  - Support for multiple file types (text, image, PDF, video)
  - File metadata (creation date, modified date, size)

## 📱 Applications

- **Text Editor**
  - Simple Notepad-style text editor for viewing and editing text files
  - Built using [Monaco Editor](https://github.com/microsoft/monaco-editor)
  - File saving and loading capabilities

- **Browser**
  - Navigation controls (back, forward, refresh, stop) with visual state indicators
  - Address bar with search and URL input functionality
  - Uses Google's iframe-friendly URL parameter for web browsing
  - Manage CORS properties to ensure sites load correctly

- **Image/Video Viewer**
  - Lightweight image viewer for common image formats
  - Basic zoom and navigation controls
  - Media player for video content with standard plyback controls

- **PDF Viewer**
  - PDF document viewer with pagination
  - Uses [React-PDF](https://github.com/wojtekmaj/react-pdf) library by Wojciech Maj
  - Zoom and navigation controls

- **Paint**
  - MS Paint clone powered by [JSPaint](https://github.com/1j01/jspaint) by Isaiah Odhner
  - Full-featured drawing application with various tools and options
  - Embedded via iframe with responsive sizing

- **Minesweeper**
  - Classic [Minesweeper](https://github.com/ziebelje/minesweeper) game by Jon Ziebell
  - Multiple difficulty levels
  - Timer and mine counter

- **Spotify Player**
  - Embedded Spotify player with playlist selection
  - Integration with Spotify Web API
  - Support for custom playlist URLs

- **GameBoy Emulator**
  - GameBoy game emulation using [EmulatorJS](https://github.com/ethanaobrien/emulatorjs) by Ethan OBrien
  - Support for ROM loading and gameplay
  - Virtual controls for gameplay

const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const Store = require('electron-store');

const store = new Store();

let mainWindow;

// 设置自启动
function setAutoStart(enabled) {
  if (process.platform === 'win32') {
    app.setLoginItemSettings({
      openAtLogin: enabled,
      path: process.execPath
    });
  }
  return enabled;
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 335,
    height: 695,
    minWidth: 300,
    minHeight: 400,
    frame: false,
    transparent: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile('index.html');
  
  // Enable acrylic effect
  mainWindow.setBackgroundColor('#00000000');
  
  // Make window draggable
  mainWindow.setMovable(true);
  
  // Load saved window position
  const savedBounds = store.get('windowBounds');
  if (savedBounds) {
    mainWindow.setBounds(savedBounds);
  }

  // Save window position before close
  mainWindow.on('close', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      store.set('windowBounds', mainWindow.getBounds());
    }
  });
}

// 应用就绪时初始化
app.whenReady().then(() => {
  createWindow();
  
  // 检查自启动设置
  const settings = store.get('settings', {});
  if (settings.autoStart) {
    setAutoStart(true);
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC handlers
ipcMain.handle('get-settings', () => {
  return store.get('settings', {
    opacity: 0.8,
    backgroundColor: '#1a1a1a',
    backgroundImage: null,
    backgroundSize: 'cover',
    language: 'zh-CN'
  });
});

ipcMain.handle('save-settings', (event, settings) => {
  store.set('settings', settings);
  return true;
});

ipcMain.handle('get-todos', async () => {
  try {
    const todos = await store.get('todos', []);
    console.log('获取待办事项:', todos);
    return todos;
  } catch (error) {
    console.error('获取待办事项时出错:', error);
    return [];
  }
});

ipcMain.handle('save-todos', async (event, todos) => {
  try {
    console.log('保存待办事项:', todos);
    
    // 验证数据
    if (!Array.isArray(todos)) {
      console.error('无效的待办事项数据: 不是数组');
      return false;
    }
    
    // 验证每个待办事项对象
    for (const todo of todos) {
      if (!todo || typeof todo !== 'object') {
        console.error('无效的待办事项数据: 对象无效');
        return false;
      }
      if (!('text' in todo) || !('completed' in todo) || !('createdAt' in todo)) {
        console.error('无效的待办事项数据: 缺少必要属性');
        return false;
      }
    }
    
    // 保存数据
    await store.set('todos', todos);
    console.log('待办事项保存成功');
    return true;
  } catch (error) {
    console.error('保存待办事项时出错:', error);
    return false;
  }
});

ipcMain.handle('select-background-image', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif'] }
    ]
  });
  
  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});

ipcMain.on('minimize-window', () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.minimize();
  }
});

ipcMain.on('close-window', () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.close();
  }
});

// 添加自启动设置处理
ipcMain.handle('set-auto-start', (event, enabled) => {
  return setAutoStart(enabled);
});

// 添加窗口置顶处理
ipcMain.handle('set-always-on-top', (event, enabled) => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.setAlwaysOnTop(enabled);
    return true;
  }
  return false;
}); 
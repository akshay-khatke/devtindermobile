const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, 'src');

const replacements = [
    // Global shared/app replacements from anywhere
    { regex: /['"]\.\.\/\.\.\/utils\/colors['"]/g, replace: '"../../../shared/utils/colors"' },
    { regex: /['"]\.\.\/utils\/colors['"]/g, replace: '"../../shared/utils/colors"' },
    
    { regex: /['"]\.\.\/\.\.\/constants\/baseUrl['"]/g, replace: '"../../../shared/constants/baseUrl"' },
    { regex: /['"]\.\.\/constants\/baseUrl['"]/g, replace: '"../../shared/constants/baseUrl"' },
    
    { regex: /['"]\.\.\/\.\.\/assets\/(.*?)['"]/g, replace: '"../../../shared/assets/$1"' },
    { regex: /['"]\.\.\/assets\/(.*?)['"]/g, replace: '"../../shared/assets/$1"' },

    { regex: /['"]\.\.\/\.\.\/api\/client['"]/g, replace: '"../../../shared/api/client"' },
    { regex: /['"]\.\.\/api\/client['"]/g, replace: '"../../shared/api/client"' },
    
    { regex: /['"]\.\.\/\.\.\/redux\/store['"]/g, replace: '"../../../app/store/store"' },
    { regex: /['"]\.\.\/redux\/store['"]/g, replace: '"../../app/store/store"' },
    
    { regex: /['"]\.\.\/\.\.\/redux\/authSlice['"]/g, replace: '"../../../features/auth/slice/authSlice"' },
    { regex: /['"]\.\.\/redux\/authSlice['"]/g, replace: '"../../features/auth/slice/authSlice"' },
    
    // Feature API replacements from feature screens
    { regex: /['"]\.\.\/\.\.\/api\/authApi['"]/g, replace: '"../api/authApi"' },
    { regex: /['"]\.\.\/\.\.\/api\/userApi['"]/g, replace: '"../api/userApi"' },
    { regex: /['"]\.\.\/\.\.\/api\/chatApi['"]/g, replace: '"../api/chatApi"' },
    { regex: /['"]\.\.\/\.\.\/api\/requestApi['"]/g, replace: '"../api/requestApi"' },

    // Screen replacements in AppStack
    { regex: /['"]\.\.\/screens\/home\/Home['"]/g, replace: '"../../features/home/screens/Home"' },
    { regex: /['"]\.\.\/screens\/connections\/Connections['"]/g, replace: '"../../features/connections/screens/Connections"' },
    { regex: /['"]\.\.\/screens\/requests\/Requests['"]/g, replace: '"../../features/connections/screens/Requests"' },
    { regex: /['"]\.\.\/screens\/chat\/Chat['"]/g, replace: '"../../features/chat/screens/Chat"' },
    { regex: /['"]\.\.\/screens\/profile\/Profile['"]/g, replace: '"../../features/profile/screens/Profile"' },
    { regex: /['"]\.\.\/screens\/chat\/ChatScreen['"]/g, replace: '"../../features/chat/screens/ChatScreen"' },
    
    // Screen replacements in AuthStack
    { regex: /['"]\.\.\/screens\/login\/Login['"]/g, replace: '"../../features/auth/screens/Login"' }
];

function processFile(filePath) {
    if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    replacements.forEach(({regex, replace}) => {
        content = content.replace(regex, replace);
    });
    
    // Fix App.tsx separately
    if (filePath.endsWith('App.tsx')) {
        content = content.replace(/['"]\.\/src\/routes\/Routes['"]/g, '"./src/app/navigation/Routes"');
        content = content.replace(/['"]\.\/src\/redux\/store['"]/g, '"./src/app/store/store"');
    }
    
    if (content !== original) {
        fs.writeFileSync(filePath, content);
        console.log('Updated:', filePath);
    }
}

function traverse(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            traverse(fullPath);
        } else {
            processFile(fullPath);
        }
    }
}

traverse(rootDir);
processFile(path.join(__dirname, 'App.tsx'));
console.log('Done replacing!');

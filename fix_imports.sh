#!/bin/bash

# Find all TS/TSX files
FILES=$(find src App.tsx -type f -name "*.ts" -o -name "*.tsx")

for file in $FILES; do
    # App.tsx
    if [[ "$file" == *"App.tsx"* ]]; then
        sed -i '' 's|./src/routes/Routes|./src/app/navigation/Routes|g' "$file"
        sed -i '' 's|./src/redux/store|./src/app/store/store|g' "$file"
    fi
    
    # Global shared/app replacements from anywhere
    sed -i '' 's|\.\./\.\./utils/colors|../../../shared/utils/colors|g' "$file"
    sed -i '' 's|\.\./utils/colors|../../shared/utils/colors|g' "$file"
    
    sed -i '' 's|\.\./\.\./constants/baseUrl|../../../shared/constants/baseUrl|g' "$file"
    sed -i '' 's|\.\./constants/baseUrl|../../shared/constants/baseUrl|g' "$file"
    
    sed -i '' 's|\.\./\.\./assets|../../../shared/assets|g' "$file"
    sed -i '' 's|\.\./assets|../../shared/assets|g' "$file"
    
    sed -i '' 's|\.\./\.\./api/client|../../../shared/api/client|g' "$file"
    sed -i '' 's|\.\./api/client|../../shared/api/client|g' "$file"
    
    sed -i '' 's|\.\./\.\./redux/store|../../../app/store/store|g' "$file"
    sed -i '' 's|\.\./redux/store|../../app/store/store|g' "$file"
    
    sed -i '' 's|\.\./\.\./redux/authSlice|../../../features/auth/slice/authSlice|g' "$file"
    sed -i '' 's|\.\./redux/authSlice|../../features/auth/slice/authSlice|g' "$file"
    
    sed -i '' 's|\.\./redux/index|../../app/store/rootReducer|g' "$file"

    # API updates inside screens
    sed -i '' 's|\.\./\.\./api/authApi|../api/authApi|g' "$file"
    sed -i '' 's|\.\./\.\./api/userApi|../api/userApi|g' "$file"
    sed -i '' 's|\.\./\.\./api/chatApi|../api/chatApi|g' "$file"
    sed -i '' 's|\.\./\.\./api/requestApi|../api/requestApi|g' "$file"

    # AppStack/AuthStack updates
    sed -i '' 's|\.\./screens/home/Home|../../features/home/screens/Home|g' "$file"
    sed -i '' 's|\.\./screens/connections/Connections|../../features/connections/screens/Connections|g' "$file"
    sed -i '' 's|\.\./screens/requests/Requests|../../features/connections/screens/Requests|g' "$file"
    sed -i '' 's|\.\./screens/chat/Chat|../../features/chat/screens/Chat|g' "$file"
    sed -i '' 's|\.\./screens/profile/Profile|../../features/profile/screens/Profile|g' "$file"
    sed -i '' 's|\.\./screens/chat/ChatScreen|../../features/chat/screens/ChatScreen|g' "$file"
    sed -i '' 's|\.\./screens/login/Login|../../features/auth/screens/Login|g' "$file"
done

echo "Imports fixed!"

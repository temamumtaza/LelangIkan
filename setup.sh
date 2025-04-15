#!/bin/bash

# Ensure proper directory structure
echo "Ensuring proper directory structure..."
mkdir -p server/uploads
mkdir -p client/public
mkdir -p client/src/assets/images
mkdir -p client/src/assets/styles

# Touch .gitkeep files to preserve empty directories
touch server/uploads/.gitkeep
touch client/src/assets/images/.gitkeep
touch client/src/assets/styles/.gitkeep

# Check if client package.json exists
if [ ! -f "client/package.json" ]; then
  echo "Client package.json not found! Creating it..."
  # If missing, copy the template we already created
  cp package-client.json client/package.json
fi

# Install server dependencies
echo "Installing server dependencies..."
npm install

# Install client dependencies
echo "Installing client dependencies..."
cd client
npm install
cd ..

echo "Setup complete! You can now run the application with 'npm run dev'" 
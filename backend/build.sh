#!/bin/bash

# Script de build da imagem Docker
# Uso: ./build.sh [dev|prod]

set -e

MODE=${1:-dev}
IMAGE_NAME="produto-app-backend"
VERSION="2.2.0"

echo "🐳 Building Docker image..."
echo "Mode: $MODE"
echo "Image: $IMAGE_NAME:$VERSION"

if [ "$MODE" = "prod" ]; then
    echo "📦 Building production image..."
    docker build \
        -f Dockerfile.prod \
        -t $IMAGE_NAME:$VERSION \
        -t $IMAGE_NAME:latest \
        --build-arg BUILDKIT_INLINE_CACHE=1 \
        .
    
    echo "✅ Production image built successfully!"
    echo ""
    echo "Image tags created:"
    echo "  - $IMAGE_NAME:$VERSION"
    echo "  - $IMAGE_NAME:latest"
    
else
    echo "🔧 Building development image..."
    docker build \
        -f Dockerfile \
        -t $IMAGE_NAME:dev \
        .
    
    echo "✅ Development image built successfully!"
    echo ""
    echo "Image tag created:"
    echo "  - $IMAGE_NAME:dev"
fi

echo ""
echo "📊 Image details:"
docker images $IMAGE_NAME --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"

echo ""
echo "🚀 To run the container:"
if [ "$MODE" = "prod" ]; then
    echo "  docker run -p 8000:8000 --env-file .env $IMAGE_NAME:latest"
else
    echo "  docker-compose up -d"
fi

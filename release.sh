#!/bin/bash
# Automated release script for Code Weaver

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Get current version
CURRENT_VERSION=$(git describe --tags --abbrev=0 2>/dev/null || echo "v0.0.0")
echo -e "${GREEN}Current version: ${CURRENT_VERSION}${NC}"

# Ask for new version
echo -n "Enter new version (e.g., v1.0.1): "
read NEW_VERSION

# Validate version format
if [[ ! "$NEW_VERSION" =~ ^v[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo -e "${RED}Invalid version format. Please use vX.Y.Z${NC}"
    exit 1
fi

# Update version in code if needed
echo -e "${YELLOW}Updating version references...${NC}"
# Update version in main.go or wherever it's defined
sed -i.bak "s/version = \".*\"/version = \"$NEW_VERSION\"/" main.go 2>/dev/null || true

# Commit changes
if git diff --quiet; then
    echo "No changes to commit"
else
    git add .
    git commit -m "chore: bump version to $NEW_VERSION"
fi

# Create and push tag
echo -e "${YELLOW}Creating tag $NEW_VERSION...${NC}"
git tag -a "$NEW_VERSION" -m "Release $NEW_VERSION"

# Push changes and tags
echo -e "${YELLOW}Pushing to GitHub...${NC}"
git push origin main
git push origin "$NEW_VERSION"

echo -e "${GREEN}✅ Release $NEW_VERSION created!${NC}"
echo ""
echo "GitHub Actions will now:"
echo "1. Run tests"
echo "2. Build binaries for all platforms"
echo "3. Build and push Docker images"
echo "4. Create GitHub release with artifacts"
echo ""
echo "Monitor progress at: https://github.com/snowsoft/codeweaver/actions"
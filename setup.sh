#!/bin/bash
# إعداد موقع د. سارة
GREEN='\033[0;32m' YELLOW='\033[1;33m' RED='\033[0;31m' BLUE='\033[0;34m' BOLD='\033[1m' NC='\033[0m'

echo -e "${BLUE}${BOLD}\n╔══════════════════════════════╗\n║   🌸 إعداد موقع د. سارة   ║\n╚══════════════════════════════╝${NC}\n"
echo -e "${BLUE}اختر طريقة البيكند:${NC}"
echo -e "  ${GREEN}1${NC}) Flask/Python + SQLite  ${GREEN}← الأسهل (موصى به)${NC}"
echo -e "  ${YELLOW}2${NC}) Node.js + PostgreSQL"
echo ""
read -p "اختيارك [1]: " CHOICE
CHOICE=${CHOICE:-1}

if [ "$CHOICE" = "1" ]; then
    python3 --version &>/dev/null || { echo -e "${RED}❌ Python3 غير مثبت${NC}"; exit 1; }
    echo -e "${GREEN}✅ Python: $(python3 --version)${NC}"
    pip3 install flask werkzeug 2>/dev/null || pip install flask werkzeug
    npm install
    echo -e "${GREEN}\n✅ جاهز!\n${NC}"
    echo -e "Terminal 1 - Backend:  ${YELLOW}cd backend && python3 server.py${NC}"
    echo -e "Terminal 2 - Frontend: ${YELLOW}npm run dev${NC}"
    echo -e "\nالموقع: ${GREEN}http://localhost:3000${NC}"
    echo -e "Admin:  ${GREEN}http://localhost:3000/login${NC}  |  dr.sara@example.com  |  Admin@123\n"
else
    node --version &>/dev/null || { echo -e "${RED}❌ Node.js غير مثبت${NC}"; exit 1; }
    cd backend && npm install && cd ..
    npm install
    echo -e "${GREEN}✅ جاهز!${NC}"
    echo -e "${YELLOW}⚠️  عدّل backend/.env وشغّل schema.sql أولاً${NC}"
    echo -e "Backend:  ${YELLOW}cd backend && npm start${NC}"
    echo -e "Frontend: ${YELLOW}npm run dev${NC}"
fi

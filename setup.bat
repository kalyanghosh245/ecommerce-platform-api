@echo off
setlocal EnableDelayedExpansion

echo ============================================
echo    E-COMMERCE MICROSERVICES SETUP
echo    Windows Version - All 5 Services
echo ============================================
echo.

:: Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed.
    pause
    exit /b 1
)

echo [OK] Node.js found
echo.

:: Step 1: Shared Library
echo [1/6] Building Shared Library...
cd shared
call npm install
if errorlevel 1 goto error
call npm run build
if errorlevel 1 goto error
cd ..
echo [OK] Shared library built
echo.

:: Step 2-6: All Services
call :install_service "2/6] Product Service" "services/product-service" "@nestjs/common @nestjs/core @nestjs/platform-express @nestjs/config @nestjs/typeorm typeorm pg @nestjs/swagger swagger-ui-express class-validator class-transformer reflect-metadata rxjs @nestjs/axios axios" "@nestjs/cli typescript @types/node ts-node"
if errorlevel 1 goto error

call :install_service "[3/6] Order Service" "services/order-service" "@nestjs/common @nestjs/core @nestjs/platform-express @nestjs/config @nestjs/typeorm typeorm pg @nestjs/axios axios class-validator class-transformer reflect-metadata rxjs" "@nestjs/cli typescript @types/node ts-node"
if errorlevel 1 goto error

call :install_service "[4/6] Admin Service" "services/admin-service" "@nestjs/common @nestjs/core @nestjs/platform-express @nestjs/config @nestjs/typeorm typeorm pg @nestjs/swagger swagger-ui-express class-validator class-transformer reflect-metadata rxjs" "@nestjs/cli typescript @types/node ts-node"
if errorlevel 1 goto error

call :install_service "[5/6] Customer Service" "services/customer-service" "@nestjs/common @nestjs/core @nestjs/platform-express @nestjs/config @nestjs/typeorm typeorm pg @nestjs/swagger swagger-ui-express class-validator class-transformer bcrypt reflect-metadata rxjs" "@nestjs/cli typescript @types/node ts-node @types/bcrypt"
if errorlevel 1 goto error

call :install_service "[6/6] Notification Service" "services/notification-service" "@nestjs/common @nestjs/core @nestjs/platform-express @nestjs/config @nestjs/typeorm typeorm pg @nestjs/swagger swagger-ui-express class-validator class-transformer nodemailer twilio web-push reflect-metadata rxjs" "@nestjs/cli typescript @types/node ts-node @types/nodemailer @types/web-push"
if errorlevel 1 goto error

:: Success
echo.
echo ============================================
echo    SETUP COMPLETED SUCCESSFULLY!
echo ============================================
echo.
echo All 5 Services Installed:
echo - Product Service    (Port 3003)
echo - Order Service      (Port 3004)
echo - Admin Service      (Port 3001)
echo - Customer Service   (Port 3002)
echo - Notification Service (Port 3005)
echo.
echo Next Steps:
echo 1. Copy .env.example to .env and configure
echo 2. docker-compose up -d postgres redis
echo 3. Start each service: npm run start:dev
echo.
pause
goto end

:install_service
echo [%~1] Setting up...
cd %~2

echo   - Installing dependencies...
call npm install %~3
if errorlevel 1 exit /b 1

echo   - Installing dev dependencies...
call npm install -D %~4
if errorlevel 1 exit /b 1

echo   - Linking shared library...
call npm install ../../shared
if errorlevel 1 exit /b 1

cd ..\..
echo [OK] %~1 ready
echo.
exit /b 0

:error
echo.
echo [ERROR] Installation failed!
pause
exit /b 1

:end
endlocal
# Hackathon HubTech 2025 problem

Steps to run this project:

1. docker-compose up -d

the admin user by default is Admin@admin.com || Password123


## Troubleshooting

### Invalid ELF header error (bcrypt)
1. In the docker-compose.yml you will need to activate the command line
2. you need to install the bycript module again inside the cointainer 
3. docker exec -it backend-app-1 bash
4. cd /app
5. npm uninstall bcrypt
6. npm install bcrypt --build-from-source
7. npm run

# TechFix
docker run -d `
  --name techfix_user_service `
  -p 8080:8080 `
  -e DB_HOST=localhost `
  -e DB_PORT=5432 `
  -e DB_NAME=techfix_usuarios `
  -e DB_USER=postgres `
  -e DB_PASSWORD=postgres `
  techfix-user-service

# Kouka

```bash
docker build -t spirit-kouka . && docker run -e DATABASE_URL="postgresql://postgres:postgres@host.docker.internal:5432/kouka" -p 3000:3000 spirit-kouka
```

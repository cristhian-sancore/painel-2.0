#!/bin/sh

# Cria o diretório de dados se não existir
mkdir -p /app/data

# Se o banco não existir no volume, copia o banco inicial gerado no build
if [ ! -f /app/data/dev.db ]; then
  echo "Inicializando banco de dados no volume persistente..."
  cp /app/dev.db /app/data/dev.db
fi

# Dá permissão total para evitar o Erro 14 do SQLite
chmod 777 /app/data
chmod 666 /app/data/dev.db

# Inicia a aplicação
exec node server.js

---
name: deploy-portainer
description: Automatiza o processo de deploy. Sempre que o usuário pedir para fazer deploy, enviar para o git, ou atualizar o portainer, você deve fazer o git push, certificar-se de que terminou e, em seguida, rodar o script de atualização do portainer.
---

# Deploy e Portainer Sync (deploy-portainer)

Quando o usuário solicitar o envio de alterações para produção, git push, ou atualização no Portainer, você deve **obrigatoriamente** seguir este fluxo:

1. Executar as adições ao git (`git add .`).
2. Fazer o commit detalhando o que foi feito (`git commit -m "..."`).
3. Enviar para o repositório (`git push`).
4. **Aguardar e verificar se o git push finalizou com sucesso**.
5. Rodar o script de atualização do Portainer localizado na raiz do projeto (`npx tsx update_portainer.ts`).
6. Acompanhar a execução para garantir que o Portainer retornou "Stack updated successfully".
7. Informar o usuário apenas após a conclusão bem-sucedida do deploy no Portainer.

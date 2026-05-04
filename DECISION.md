## Decisão: Dois builds ao invés de promote

### Problema
Variáveis `VITE_*` são inlined (embutidas) no bundle em tempo de build. O `vercel promote` 
re-aponta o domínio sem gerar um novo build. Portanto, promover o bundle de preview 
para produção faria com que a produção continuasse apontando para o banco de dados do Supabase de preview.

## Alternativas consideradas
1. **promote + rebuild**: Complexo, cria uma janela de inconsistência e anula o benefício de velocidade do promote.
2. **Dois builds independentes** ✅ Escolhida: Limpa, auditável e garante isolamento total sem ambiguidade.

## Resultado
Preview e Produção agora têm builds, variáveis de ambiente e bancos de dados (Supabase) completamente isolados. 
O deploy de produção só ocorre se os testes E2E passarem com sucesso no ambiente de preview.

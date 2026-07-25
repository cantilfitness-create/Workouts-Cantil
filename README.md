# Cantil Fitness — colocar no ar (Netlify + Supabase)

Este é o mesmo app, agora como um site de verdade (não depende mais do Claude).
Os dados ficam num banco Postgres gratuito no Supabase.

## Passo 1 — Criar o banco no Supabase

1. Crie uma conta em https://supabase.com (tem plano gratuito).
2. Clique em **New project**. Escolha um nome, uma senha de banco (guarde-a) e a região mais próxima.
3. Espere o projeto terminar de provisionar (1-2 min).
4. No menu lateral, vá em **SQL Editor** → **New query**.
5. Abra o arquivo `supabase-schema.sql` (está nesta pasta), copie tudo e cole no editor.
6. Clique em **Run**. Isso cria as 4 tabelas (`exercicios`, `workouts`, `legendas`, `logs`), os índices de busca e libera o acesso.
7. Vá em **Project Settings → API**. Copie:
   - **Project URL** (algo como `https://xxxx.supabase.co`)
   - **anon public key** (uma chave longa)

Guarde os dois — vai usar no passo 3.

## Passo 2 — Subir o código para o GitHub

1. Crie um repositório novo no GitHub (pode ser privado).
2. Suba todos os arquivos desta pasta para o repositório (exceto `node_modules`, que nem existe aqui ainda).
   - Mais simples: crie o repositório vazio, depois arraste os arquivos pela interface web do GitHub, ou use `git init / git add . / git commit / git push` se preferir linha de comando.

## Passo 3 — Publicar no Netlify

1. Crie uma conta em https://netlify.com (dá pra entrar direto com o GitHub).
2. Clique em **Add new site → Import an existing project**.
3. Escolha o repositório que você acabou de criar.
4. O Netlify já vai detectar o `netlify.toml` (build command `npm run build`, pasta `dist`). Não precisa mudar nada aí.
5. Antes de clicar em **Deploy**, vá em **Add environment variables** e adicione:
   - `VITE_SUPABASE_URL` = a Project URL que você copiou
   - `VITE_SUPABASE_ANON_KEY` = a anon public key que você copiou
6. Clique em **Deploy site**. Em ~1 minuto o site estará no ar, num endereço tipo `https://algum-nome.netlify.app`.
7. (Opcional) Em **Site settings → Domain management** dá pra trocar por um domínio próprio, ou pelo menos renomear o subdomínio `.netlify.app` de graça.

Pronto — o app está no ar, com banco de dados gratuito, para todo mundo que tiver o link.

## Sobre "criar muitos workouts"

Pensando nisso, a aba Workouts já está preparada para volume:

- A lista carrega em páginas de 20 (botão "Carregar mais"), em vez de baixar tudo de uma vez.
- A busca (por nome, código, categoria ou tag) roda direto no banco de dados, não só nos itens já carregados na tela — então funciona mesmo com centenas/milhares de treinos.
- O banco já sai com índices (`idx_workouts_data`, `idx_workouts_codigo`, índices de texto em nome/tags/categoria) para essas buscas continuarem rápidas conforme a tabela cresce.

Se um dia isso crescer muito (milhares de treinos por mês, vários coaches ao mesmo tempo), o próximo passo natural seria adicionar paginação por categoria/data e, possivelmente, filtros salvos — mas para o uso normal de uma box isso não deve ser necessário.

## Novidades desta versão

- **Link de demonstração** nos exercícios (vídeo do YouTube/Instagram, etc.).
- **Banner de destaque** na página inicial (Treino do dia / Treino destaque / Aviso), vinculado a um treino real já cadastrado.
- **Senha única e editável pelo próprio app**: agora dá pra trocar a senha direto pelo botão de chave 🔑 no cabeçalho, sem mexer no código. Ela protege: criar/editar/excluir treino, criar/editar/excluir exercício, editar a legenda dos níveis e editar o banner.

Se o seu banco já estava rodando a versão anterior, é só rodar o `supabase-schema.sql` de novo —
ele foi escrito para não apagar nada (`create table if not exists`, `add column if not exists`),
só cria o que estiver faltando (coluna `link`, tabelas `config` e `banner`).

## Importante: sobre segurança

Como o app ainda não tem login de verdade (email/senha), as tabelas do Supabase estão liberadas
para qualquer pessoa que tenha o link do site ler e escrever — é um "quadro compartilhado", como
era dentro do Claude. As telas de senha (novo treino, editar legenda, editar banner, trocar senha)
são travas de conveniência na interface, não segurança real: como a tabela `config` (onde a senha
fica guardada) também está com leitura liberada, alguém com conhecimento técnico consegue ler a
senha atual ou escrever direto no banco pela API do Supabase, sem passar pela tela do app.

Isso é razoável para o uso normal (alunos e coach de uma mesma box). Se no futuro você quiser
contas de verdade (cada aluno loga com email/senha e só vê o próprio log, coach tem um papel especial
para editar treinos), dá pra evoluir usando o **Supabase Auth** — é um passo a mais que pode ser
feito depois, sem precisar refazer o app.

## Rodando localmente (opcional, para testar antes de publicar)

```bash
npm install
cp .env.example .env
# edite o .env com sua URL e chave do Supabase
npm run dev
```

## Estrutura do projeto

```
├── index.html
├── netlify.toml           ← configuração de build/deploy do Netlify
├── package.json
├── supabase-schema.sql    ← rode isso no SQL Editor do Supabase
├── vite.config.js
├── .env.example
└── src/
    ├── main.jsx
    ├── App.jsx            ← o app inteiro (biblioteca, workouts, log, link compartilhado)
    └── supabaseClient.js  ← conexão com o Supabase
```

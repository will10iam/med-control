# 💊 MedControl

App PWA para controlar o estoque e os horários dos meus medicamentos — saber quanto ainda tem na caixa, quando vai acabar e ser lembrado na hora de tomar, com aviso tanto por push quanto no Telegram.

Nasceu de um problema bem prático: perder a conta de quantos comprimidos ainda restam e esquecer horário de remédio de uso contínuo.

## Funcionalidades

- Cadastro de medicamentos de uso **contínuo** (com horários fixos) ou **eventual**
- Controle de estoque: dar baixa a cada dose tomada e repor ao comprar uma caixa nova
- Geração automática da próxima dose ao confirmar a atual
- Alerta visual de status (`OK` / `Acabando` / `Acabou`) baseado num limite mínimo configurável
- Notificação push (Firebase Cloud Messaging) quando o estoque fica baixo ou chega o horário do remédio
- Aviso automático no Telegram sempre que um medicamento novo é cadastrado
- Instalável como PWA (funciona como app no celular)

## Stack

- [Next.js 16](https://nextjs.org/) (App Router) + React 19 + TypeScript
- Tailwind CSS 4
- Firebase (Firestore, Cloud Messaging, Cloud Functions)
- Telegram Bot API
- next-pwa

## Rodando localmente

```bash
npm install
npm run dev
```

Crie um `.env.local` na raiz com:

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
```

As duas primeiras (Firebase) vêm do console do Firebase, no cadastro do app web. As do Telegram vêm do [@BotFather](https://t.me/BotFather) (token) e do chat/canal que vai receber os avisos.

## Firebase Functions

As notificações automáticas (verificação de estoque a cada 15 min e verificação de horário a cada 1 min) rodam em Cloud Functions, em `functions/`:

```bash
cd functions
npm install
npm run deploy
```

## Estrutura

```
src/
  app/            páginas (App Router) e rotas de API
  components/     formulário e pickers de UI
  services/       regras de negócio (medicamentos, doses)
  lib/            inicialização do Firebase
  server/         integração com o Telegram
  types/ utils/   tipos e helpers
functions/        Cloud Functions (jobs agendados)
```

## Status

Projeto pessoal, em uso ativo no dia a dia. Próximos passos que pretendo atacar: regras de segurança do Firestore versionadas no repo e disparo automático dos lembretes de dose (hoje a rota que lista as doses pendentes existe, mas ainda depende de algo externo chamá-la).

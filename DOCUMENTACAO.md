# MedControl — Documentação do Projeto

Aplicativo PWA para controle de estoque e horários de medicamentos, com lembretes via push (Firebase Cloud Messaging) e notificações no Telegram.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS 4**
- **Firebase**: Firestore (banco de dados), Cloud Messaging (push web), Cloud Functions (jobs agendados)
- **Telegram Bot API** (via `axios`) para notificar cadastro de novos medicamentos
- **next-pwa** para funcionamento como PWA instalável
- **sonner** para toasts de UI
- **react-icons** para ícones

## Estrutura de pastas

```
src/
  app/
    page.tsx                          Lista de medicamentos (home)
    layout.tsx                        Layout raiz, PWA meta tags, Toaster
    medicamentos/
      novo/page.tsx                   Formulário de cadastro
      [id]/page.tsx                   Detalhe do medicamento (estoque, ações)
      [id]/editar/page.tsx            Formulário de edição
    api/
      telegram/novo-medicamento/route.ts   Envia mensagem ao Telegram ao cadastrar
      telegram/test/route.ts               Testa conexão com o bot do Telegram
      test-lembretes/route.ts              Lista doses elegíveis para lembrete
  components/
    MedicamentoForm.tsx               Form compartilhado (criar/editar)
    IOSPicker.tsx                     Seletor numérico estilo iOS (wheel picker)
    IOSDatePicker.tsx                 Seletor de data estilo iOS
  services/
    medicamentoService.ts             CRUD de medicamentos + integração com doses/Telegram
    doseService.ts                    CRUD e regras de negócio das doses
  lib/
    firebase.ts                       Inicialização do Firebase App + Firestore
    firebaseMessaging.ts              Permissão e token de push (FCM)
  server/telegram/telegramService.ts  Cliente HTTP do Telegram Bot API
  types/
    Medicamento.ts, Dose.ts           Tipos de domínio
  utils/
    dateUtils.ts                      Formatação de datas (pt-BR, ISO local)
    medicamentoUtils.ts               Cálculo de duração/estoque/status
functions/
  src/index.ts                       Firebase Cloud Functions (jobs agendados + push)
public/
  firebase-messaging-sw.js           Service worker do FCM (background push)
  manifest.json                      Manifesto PWA
```

## Modelo de dados (Firestore)

### Coleção `medicamentos` (tipo `Medicamento`)
| Campo | Tipo | Descrição |
|---|---|---|
| `nome` | string | Nome do medicamento |
| `tipo` | `"continuo" \| "eventual"` | Uso contínuo (com horários fixos) ou eventual |
| `quantidadePorCaixa` | number | Comprimidos por caixa |
| `comprimidosPorDia` | number? | Dose diária (uso contínuo) |
| `estoqueAtual` | number | Estoque restante |
| `alertaMinimo` | number | Limite para status "Acabando" |
| `dataInicio` | string (ISO) | Início do tratamento/caixa atual |
| `horarios` | string[]? | Horários fixos, formato `HH:MM` |
| `createdAt` | string (ISO) | Data de criação do registro |

### Coleção `doses` (tipo `Dose`)
| Campo | Tipo | Descrição |
|---|---|---|
| `medicamentoId` / `medicamentoNome` | string | Referência ao medicamento |
| `data` | string (`YYYY-MM-DD`) | Data local da dose |
| `horario` | string (`HH:MM`) | Horário previsto |
| `previstoPara` | string (ISO) | Timestamp completo previsto |
| `status` | `"pendente" \| "confirmada" \| "atrasada" \| "ignorada"` | Estado da dose |
| `confirmadoEm` | string? | Timestamp de confirmação |
| `origemConfirmacao` | `"app" \| "telegram" \| "fcm"` | Onde a dose foi confirmada |
| `lembreteEnviado` / `ultimoLembreteEm` | boolean / string | Controle de lembrete já disparado |
| `createdAt` | string (ISO) | Data de criação |

### Coleção `tokens`
Armazena tokens de push (FCM) dos dispositivos que ativaram notificações (`salvarToken`), usados pelas Cloud Functions para `sendEachForMulticast`.

## Fluxos principais

### 1. Cadastro de medicamento
`app/medicamentos/novo/page.tsx` → `MedicamentoForm` → `addMedicamento` ([medicamentoService.ts:30](src/services/medicamentoService.ts#L30)):
1. Cria o documento em `medicamentos`.
2. Chama `criarPrimeiraDose` para já agendar a primeira dose (só se houver `horarios`, ou seja, uso contínuo).
3. Dispara (sem aguardar) `POST /api/telegram/novo-medicamento`, que envia um resumo formatado ao Telegram via `sendNovoMedicamento`.

### 2. Uso de um comprimido
Tela de detalhe (`app/medicamentos/[id]/page.tsx`) → `usarComprimido` ([medicamentoService.ts:98](src/services/medicamentoService.ts#L98)):
1. Chama `confirmarDoseDoMedicamento`, que busca a dose `pendente` mais antiga (`orderBy("previstoPara")`) e marca como `confirmada`.
2. Cria automaticamente a próxima dose (`criarProximaDose`, +1 dia no mesmo horário).
3. Se havia dose pendente, decrementa `estoqueAtual` em 1 (nunca abaixo de 0).
4. Se não havia dose pendente, a ação é abortada e o estoque **não** é alterado (evita descontar comprimido sem dose correspondente).

### 3. Reposição de estoque
`adicionarCaixa` soma `quantidadePorCaixa` ao `estoqueAtual` — não altera `dataInicio` nem cria doses.

### 4. Lembretes de dose
`buscarDosesParaLembrete` ([doseService.ts:152](src/services/doseService.ts#L152)) busca doses `pendente` com `lembreteEnviado=false` cujo `previstoPara` esteja entre 0 e 10 minutos no futuro. Exposto via `GET /api/test-lembretes` — parece pensado para ser chamado por um cron/scheduler externo (não há chamador automático no próprio Next.js).

### 5. Notificações push (FCM)
- Cliente pede permissão e obtém token (`requestNotificationPermission`), que é salvo na coleção `tokens`.
- **Cloud Functions** (`functions/src/index.ts`) rodam de forma independente do Next.js:
  - `verificarEstoque` (a cada 15 min): notifica quando `estoqueAtual <= alertaMinimo`, controlando 1 aviso/dia via campo `ultimoAviso`.
  - `verificarHorario` (a cada 1 min): notifica quando o horário atual bate com algum item de `medicamento.horarios`.
  - `enviarNotificacaoTeste`: endpoint HTTP manual para testar push.

### 6. Notificações via Telegram
`telegramService.ts` usa `TELEGRAM_BOT_TOKEN` e `TELEGRAM_CHAT_ID` (variáveis de servidor) para enviar mensagens formatadas em Markdown. Hoje só é acionado no cadastro de um novo medicamento; a rota `api/telegram/test` serve para verificar a conexão do bot.

## Rotas de API (Next.js Route Handlers)

| Rota | Método | Função |
|---|---|---|
| `/api/telegram/novo-medicamento` | POST | Envia mensagem ao Telegram com dados do medicamento recém-criado |
| `/api/telegram/test` | GET | Testa se o bot do Telegram está configurado corretamente |
| `/api/test-lembretes` | GET | Retorna as doses elegíveis para lembrete nos próximos 10 min |

## Componentes de UI

- **`MedicamentoForm`**: formulário único reaproveitado em criação e edição; alterna campos conforme `tipo` (contínuo exige `comprimidosPorDia` e `horarios`).
- **`IOSPicker`**: seletor numérico em modal bottom-sheet (estilo roda do iOS), usado para quantidade/dose/alerta.
- **`IOSDatePicker`**: input de data nativo (`<input type="date">`) escondido, com exibição formatada em pt-BR e abertura via `showPicker()`.

## PWA

- `manifest.json` define nome, ícones, tema (`#16a34a`) e modo `standalone`.
- `firebase-messaging-sw.js` é o service worker que recebe push em background (config do Firebase hardcoded — são as chaves públicas do client SDK, não segredos).
- `layout.tsx` injeta meta tags para comportamento de app no iOS (`apple-mobile-web-app-*`).

## Variáveis de ambiente

**Client (`NEXT_PUBLIC_*`, usadas em `src/lib/firebase.ts`):**
`NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`, `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID`

**Server (usadas em `telegramService.ts`):**
`TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`

Ambas ficam em `.env.local` (já ignorado pelo git).

## Firebase Functions (`functions/`)

Projeto separado (Node 20, `firebase-functions` v4 + `firebase-admin`), com deploy via `firebase deploy --only functions` (configurado em `firebase.json`, com predeploy `npm run build`).

## Scripts

**App principal** (`package.json`): `npm run dev`, `npm run build`, `npm run start`, `npm run lint`.
**Functions** (`functions/package.json`): `npm run build`, `npm run serve` (emulador), `npm run deploy`, `npm run logs`.

## Observações / pontos de atenção

- Não há arquivo de **regras do Firestore** (`firestore.rules`) no repositório — as regras de segurança do banco, se existirem, estão configuradas apenas no console do Firebase.
- `subscribeMedicamentos(callback: any)` e alguns pontos usam `any`, reduzindo a tipagem em runtime dos dados vindos do Firestore (não há `converter`/validação de schema).
- Vários trechos de código antigo ficam comentados no lugar (ex.: `medicamentoService.ts:18-28`, formulário manual em `novo/page.tsx:44-151`) em vez de removidos.
- O lembrete de dose (`/api/test-lembretes`) só **retorna** as doses elegíveis — não há disparo automático de notificação a partir dele; presumivelmente é chamado por um agendador externo (cron) ainda não versionado neste repo.
- Diretório `src/app/api/test-lembretes/` aparece como não rastreado no git (`??` no status) — ainda não commitado.

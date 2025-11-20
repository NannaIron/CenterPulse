# CenterPulse

Projeto de timer Pomodoro / foco — trabalho para Global Solution.

Grupo:
- Fernando Borelli - RM 98343  
- Giovanna Ferro Menis - RM 99639

## Especificações
- Timer com duração padrão de 25:00.
- Iniciar / Pausar / Parar (mesma sessão ao retomar).
- Botões rápidos que acrescentam tempo: `+0:30` e `+1:00`.
- Modal customizado que aceita entrada em MM:SS (máscara por dígitos).
- Persistência da sessão ativa para continuar o timer ao sair do app / suspender o celular.
- Contagem de pausas por sessão registrada no histórico.
- Botão "Zerar" que coloca o timer em 00:00 (pausa, sem concluir).
- Ícones via `@expo/vector-icons` (Ionicons).

Principais funções/componentes:
- Persistência: [`saveActiveSession`](src/services/storage.js), [`getActiveSession`](src/services/storage.js), [`clearActiveSession`](src/services/storage.js), [`saveSession`](src/services/storage.js) — [src/services/storage.js](src/services/storage.js)  
- Tela principal: [`HomeScreen`](src/screens/HomeScreen.js) — [src/screens/HomeScreen.js](src/screens/HomeScreen.js)  
- Modal custom: [`CustomTimeModal`](src/components/CustomTimeModal.js) — [src/components/CustomTimeModal.js](src/components/CustomTimeModal.js)  
- Visor do timer: [`TimerCircle`](src/components/TimerCircle.js) — [src/components/TimerCircle.js](src/components/TimerCircle.js)  
- Histórico: [`HistoryScreen`](src/screens/HistoryScreen.js) — [src/screens/HistoryScreen.js](src/screens/HistoryScreen.js)  
- Estatísticas: [`StatsScreen`](src/screens/StatsScreen.js) — [src/screens/StatsScreen.js](src/screens/StatsScreen.js)

## Descrição (curta)
App simples de foco que mantém estado entre sessões e quando o app vai para background. Usuário pode ajustar tempo via modal MM:SS, pausar/retomar sem criar nova sessão e ver histórico com contagem de pausas.

## Como rodar
1. Instale dependências:
```bash
npm install
```

2. Inicie o projeto:
```bash
npm run start
```

Se o comando `expo` não estiver disponível globalmente, o script do `package.json` usa a dependência do projeto. Em ambientes onde o `expo` não é encontrado, instale o CLI globalmente ou use npx conforme sua preferência.

Testes rápidos:
- Abrir app → ir em Home → INICIO inicia o timer.
- PAUSAR pausa (não cria sessão nova). INICIO retoma.
- PARAR salva sessão (abandonada) e reseta para 25:00.
- Custom abre modal → digitar MM:SS → Salvar ajusta o tempo.
- Minimize/suspenda → ao voltar o timer deve refletir o tempo real restante.

## Dependências (ver `package.json`)
Arquivo: [package.json](package.json)

Principais dependências:
- "expo": ~54.x — integrado ao projeto.  
- "react": 19.1.0, "react-native": 0.81.5  
- "@expo/vector-icons" — ícones Ionicons usados em [App.js](App.js) e [`HomeScreen`](src/screens/HomeScreen.js).  
- "@react-native-async-storage/async-storage" — utilizado em [src/services/storage.js](src/services/storage.js).  
- "expo-navigation-bar", "expo-status-bar", "react-native-safe-area-context".

## Arquivos principais
- [App.js](App.js) — entrada / navegação simples entre telas.  
- [index.js](index.js) — registro do app.  
- [app.json](app.json) — configurações expo/android.  
- [src/screens/HomeScreen.js](src/screens/HomeScreen.js) — lógica do timer, botões e persistência.  
- [src/components/CustomTimeModal.js](src/components/CustomTimeModal.js) — modal de tempo customizado.  
- [src/components/TimerCircle.js](src/components/TimerCircle.js) — display do tempo.  
- [src/screens/HistoryScreen.js](src/screens/HistoryScreen.js) — histórico de sessões.  
- [src/screens/StatsScreen.js](src/screens/StatsScreen.js) — estatísticas.  
- [src/services/storage.js](src/services/storage.js) — AsyncStorage helpers: [`getSessions`](src/services/storage.js), [`saveSession`](src/services/storage.js), [`saveActiveSession`](src/services/storage.js), etc.

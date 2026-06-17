# 🏁 Taborda Setups — Le Mans Ultimate

Uma biblioteca pessoal e painel de controle interativo para gerenciar configurações (setups), calcular estratégias de combustível e acompanhar corridas diárias no simulador oficial do WEC, **Le Mans Ultimate (LMU)**.

---

## 🚀 Funcionalidades

### 1. 🏎️ Gerenciamento de Setups
- **Filtros Avançados:** Busque e filtre seus setups por classe (Hypercar, LMP2, LMGTE), carro, pista, condição de pista (Seco, Chuva, Misto) e tipo de sessão (Qualifying, Sprint Race, Endurance).
- **Métricas e Avaliações:** Registre tempos de volta, notas de desempenho, nível de aderência e anotações detalhadas de telemetria ou comportamento do carro.
- **Painel de Estatísticas:** Acompanhe o total de setups cadastrados, média de avaliação, pista mais utilizada e distribuição gráfica por classe de veículos.

### 2. ⛽ Calculadora de Pitstop Avançada
- **Abas de Categoria Dinâmicas**: Layout especializado que se adapta de acordo com o veículo (Hypercar/LMGT3 com uso de Energia Virtual, e LMP2/LMP3/LMGTE com tanques físicos tradicionais).
- **Tank Maximizer (Estratégia de Fuel Saving)**: Módulo inteligente que calcula matematicamente se vale a pena economizar combustível em pista para estender stints, economizar tempo no box ou até reduzir o número de pitstops necessários, exibindo métricas precisas de ganho de tempo estimado, perda máxima de tempo aceitável por volta e o relógio da corrida no início da última volta.
- **Estratégia de Pneus**: Planejamento do número de stints por jogo de pneu (double stints, triple stints, etc.) com estimativa integrada do tempo de parada.
- **Guia Integrado (Como Calcular?)**: Modal interativo com passo a passo ilustrado ensinando o piloto a ler os dados de telemetria/MFD no cockpit para alimentar a calculadora.

### 3. 📅 Mural de Corridas Diárias (Online Championships)
- Agenda de corridas sincronizada com o formato do simulador (**Temporada 11**).
- Exibe o calendário das corridas Diárias (Daily) e Semanais (Weekly) com informações cruciais: nível de Safety Rating (SR) exigido, classes de carros elegíveis, mapas vetorizados dinâmicos das pistas, extensão do circuito, tipo de setup da prova (Fixo ou Aberto), duração e multiplicadores de desgaste de pneus e combustível.

### 4. 🔒 Autenticação e Compartilhamento (Supabase)
- **Login por Usuário e Senha:** Autenticação real integrada ao **Supabase Auth** para controle de acesso seguro.
- **Público vs. Privado:** Escolha se o seu setup será visível para toda a comunidade na aba de setups públicos ou privado (exclusivo para sua conta).
- **Persistência em Nuvem e Fallback:** Sincronização em tempo real com o banco de dados PostgreSQL do Supabase, contendo fallback automático para `localStorage` caso o cliente perca conectividade.

---

## 🎨 Design & Interface
O projeto possui um estilo visual moderno e de alta fidelidade:
- **Tema Escuro Nativo:** Layout voltado para o conforto visual durante longas sessões de jogatina ou consultas rápidas de setup.
- **Visual Responsivo Premium:** Visual clean com sublinhados vermelhos interativos e animações de scroll otimizadas de alta taxa de quadros (60 FPS).
- **Design Adaptativo:** Consultas ideais para telas secundárias ou celulares enquanto você corre no cockpit principal.

---

## 🛠️ Tecnologias Utilizadas

- **HTML5:** Estruturação semântica.
- **CSS3 (Vanilla):** Animações com aceleração de GPU, transições e variáveis de ambiente.
- **JavaScript (Vanilla):** Lógica de estados, cálculos de consumo e integração.
- **Supabase (PostgreSQL & Auth):** Persistência remota segura e gerenciamento de sessões com regras de segurança RLS (Row Level Security).

---

## 🏁 Como Executar Localmente

Como o projeto é construído em HTML/CSS/JS puros, você não precisa instalar nenhuma dependência de build:

1. Clone o repositório ou faça o download dos arquivos:
   ```bash
   git clone https://github.com/irwaynetaborda/LMU-Setups.git
   ```
2. Abra o arquivo `index.html` diretamente em qualquer navegador moderno ou utilize uma extensão de Live Server (como a do VS Code) para ter a melhor experiência de desenvolvimento.

---

## 🌐 Publicação no GitHub Pages

Este site pode ser facilmente publicado no **GitHub Pages**:
1. Vá nas configurações (Settings) do seu repositório no GitHub.
2. Acesse a seção **Pages** no menu lateral esquerdo.
3. Em *Build and deployment*, escolha a branch `main` e a pasta `/ (root)`.
4. Salve e em poucos minutos o seu site estará no ar!

# 🏁 Taborda Setups — Le Mans Ultimate

Uma biblioteca pessoal e painel de controle interativo para gerenciar configurações (setups), calcular estratégias de combustível e acompanhar corridas diárias no simulador oficial do WEC, **Le Mans Ultimate (LMU)**.

---

## 🚀 Funcionalidades

### 1. 🏎️ Gerenciamento de Setups
- **Filtros Avançados:** Busque e filtre seus setups por classe (Hypercar, LMP2, LMGTE), carro, pista, condição de pista (Seco, Chuva, Misto) e tipo de sessão (Qualifying, Sprint Race, Endurance).
- **Métricas e Avaliações:** Registre tempos de volta, notas de desempenho, nível de aderência e anotações detalhadas de telemetria ou comportamento do carro.
- **Painel de Estatísticas:** Acompanhe o total de setups cadastrados, média de avaliação, pista mais utilizada e distribuição gráfica por classe de veículos.

### 2. ⛽ Calculadora de Combustível (Fuel Calculator)
- **Estimativa Precisa:** Calcule a quantidade de combustível exata necessária para terminar a corrida com base no tempo de volta e consumo médio por volta.
- **Opções de Margem de Segurança:** Adicione margens de segurança (+1 ou +2 voltas) e inclua opcionalmente a Volta de Apresentação (Formation Lap).
- **Virtual Energy:** Suporte para carros híbridos (Hypercar), calculando o consumo total da energia virtual necessária para a sessão.

### 3. 📅 Corridas Diárias (Daily Races Schedule)
- Interface de acompanhamento para as sessões e agendas do simulador.

### 4. 🔒 Autenticação e Armazenamento Local
- Sistema de login básico com controle de acesso para visualizar e adicionar novos setups.
- Utilização de `localStorage` para persistência de dados de forma local no navegador, permitindo a utilização rápida e segura sem necessidade de um banco de dados externo complexo.

---

## 🎨 Design & Interface
O projeto possui um estilo visual moderno e de alta fidelidade:
- **Tema Escuro Nativo:** Layout voltado para o conforto visual durante longas sessões de jogatina ou consultas rápidas de setup.
- **Glassmorphism e Gradientes:** Visual premium inspirado nos maiores portais de automobilismo virtual.
- **Design Responsivo:** Adaptado para celulares, tablets e computadores, permitindo consultar os setups no celular enquanto pilota no PC.

---

## 🛠️ Tecnologias Utilizadas

- **HTML5:** Estruturação semântica.
- **CSS3 (Vanilla):** Variáveis de ambiente, flexbox/grid layouts e animações fluidas baseadas no estilo premium customizado.
- **JavaScript (Vanilla):** Lógica da aplicação, cálculos de combustível, manipulação dinâmica do DOM, autenticação fictícia e persistência com `localStorage`.

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

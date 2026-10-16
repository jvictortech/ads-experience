# ADS EXPERIENCE — MISSÃO: SALVE O SISTEMA

Jogo educativo offline para a Mostra de Profissões. Equipes de 2 a 3 estudantes; duração aproximada de 10 minutos.

## Abrir e usar no laboratório

Abra `index.html` no Edge, Chrome ou Firefox. Mantenha os quatro arquivos juntos. Não precisa de instalação, servidor ou internet. Não há dependências, fontes remotas, analytics ou coleta de dados pessoais.

Copie a pasta para cada computador. Oriente as equipes a escolherem um codinome fictício, sem dados pessoais. Consulte “Como jogar”. Clique em “Aceitar missão”. Um diagnóstico de até 1,4 segundo apresenta NEXA e pode ser pulado. O cronômetro começa somente quando o primeiro desafio fica disponível. Os estudantes podem errar, tentar novamente e pedir pistas. Cada pista conta uma vez por missão, mesmo quando reaberta. Respostas erradas e códigos completos incorretos contam como tentativas; entradas incompletas recebem orientação sem penalidade.

Ao final dos 10 minutos, a equipe pode continuar em exploração. O tempo total continua sendo acompanhado, mas a conclusão fica marcada fora do prazo.

## Reiniciar entre equipes

Clique em “Nova equipe” e confirme no diálogo. O jogo remove apenas sua chave `ads-experience.v1`, nunca outros dados do navegador. Cronômetro, inventário, respostas e estatísticas recomeçam.

## Progresso e acessibilidade

O localStorage salva automaticamente quando disponível. Ao reabrir o mesmo arquivo no mesmo navegador, escolha “Continuar partida”. Fechar ou recarregar não pausa nem reinicia o cronômetro: o tempo é calculado a partir do horário de início. Se o armazenamento estiver bloqueado, a partida funciona, mas não pode ser recuperada após fechar. O suporte ao armazenamento em arquivos locais varia entre navegadores.

Use Tab/Shift+Tab para navegar e Enter/Espaço para acionar botões. Na missão de programação, os botões de subir e descer substituem a necessidade de arrastar. Há foco visível, símbolos e mensagens além das cores. Animações respeitam a preferência de movimento reduzido. O jogo não simula invasões nem solicita senhas reais.

## Alterar textos e desafios

O bloco `MISSIONS`, no início de `script.js`, contém áreas, profissões, descrições, enunciados, alternativas, pistas, feedbacks e fragmentos. `correct` é o índice correto começando em zero. Na missão 2, `steps` contém a ordem correta; `order` na função `start` define a ordem inicial embaralhada. Ao trocar fragmentos, altere também a comparação do código final na função `submit`. As demais telas estão nas funções `landing`, `beginDiagnostic`, `render`, `restoration` e `victory`. As interfaces específicas estão em `mailbox`, `algorithm`, `network`, `aiLab` e `decoder`. `MAILS` reúne os metadados fictícios dos e-mails; `OBJECTIVES` e `GUIDANCE` contêm as orientações. `coreArt`, `animalArt`, `nexa` e `icon` geram SVGs originais inline. Cores, espaçamento, responsividade e animações estão em `styles.css`.

Após alterações estruturais nos dados salvos, atualize a versão e a chave de armazenamento para evitar partidas incompatíveis.

## Gabarito para o professor

1. Segurança: **B** — urgência, pedido de senha e endereço desconhecido. Outras mensagens não são garantidamente seguras apenas pelo texto. Fragmento **7**.
2. Programação: **receber usuário e senha → conferir os dados → decidir se são válidos → liberar acesso ou mostrar erro**. Fragmento **3**.
3. Redes: **C — 192.168.10.50**. Mesma sub-rede e endereço diferente. Fragmento **1**.
4. IA: **A** — exemplos variados e corretamente rotulados, seguidos de novos testes. Fragmento **4**.
5. Criptografia: **B — ADS**. Voltar três letras. Cifra apenas didática; sistemas reais precisam de criptografia moderna. Fragmento **2**.

Código final: **73142**. A vitória exige concluir todas as missões e digitar o código exato. Por ser inteiramente local, o código-fonte pode ser inspecionado; as travas são de progressão didática.

## GitHub Pages futuramente

Nenhum serviço foi configurado ou publicado. Quando desejar, crie um repositório, envie os quatro arquivos e configure Settings → Pages para publicar a branch e a pasta raiz que contêm `index.html`. O jogo continua estático e sem dependências. O progresso local não é transferido para o endereço publicado.

## Reformulação da experiência

- Abertura com central de servidores em SVG, conexões e módulos em falha, alerta e botão “Aceitar missão”. Diagnóstico breve com opção de pular; o tempo ainda não corre nessa etapa.
- Painel com missão atual, objetivo, relógio, inventário e NEXA, com avatar SVG e orientações contextuais.
- Segurança: caixa de entrada fictícia. Abra uma mensagem e clique em “Marcar como suspeita”. Após o acerto, os três sinais são explicados. Os endereços terminam em `.exemplo` e não são links.
- Programação: blocos com controles de subir e descer. “Executar” percorre a sequência em cerca de um segundo antes do feedback; arrastar não é necessário.
- Redes: PC, switch e três servidores. Selecione e use “Testar conexão” para acompanhar o pacote e o resultado.
- IA: exemplos SVG de gatos e cães, cenários de interior e jardim, classificação equivocada e decisões de treinamento. O acerto acrescenta variedade ilustrada. Não há modelo treinado nem métricas inventadas.
- Criptografia: mensagem, letras selecionáveis e faixas alinhadas do alfabeto. D → A e G → D são apoios; a transformação completa só é animada após o acerto. Na letra V, a correspondência selecionada fica como exercício até resolver.
- Final: console com os cinco fragmentos. A conclusão é registrada no instante da validação correta, antes da sequência visual de até 1,2 segundo. “Ver resultado” pula essa sequência.
- Vitória: núcleo online, conexões ativas, partículas breves, estatísticas, áreas profissionais e destaque para a mensagem final.

Os SVGs são originais e estão no JavaScript/HTML; não há imagens raster, arquivos de mídia adicionais ou áudio. As animações são curtas, finitas e respeitam movimento reduzido; nesse modo, as esperas das sequências também são removidas. Fontes são do sistema. O texto principal no desktop usa pelo menos 18px; rótulos auxiliares são menores.

As alternativas partem do mesmo estado visual. Selecionar uma opção apenas indica a seleção, sem validar ou revelar o gabarito. A ação de cada missão faz a validação real, bloqueia repetições enquanto processa e mantém o resultado até clicar em “Próxima missão”. Os dados e a chave v1 foram preservados para continuar partidas da versão anterior.

## Testes executados

Execute `node tests/review.cjs`, sem instalar dependências. Node é usado somente para testes; o jogo continua exigindo apenas o navegador. Para verificar a sintaxe: `node --check script.js`.

Foram executados e aprovados 11 grupos de testes com DOM, relógio e agendador simulados:

1. Diagnóstico sem iniciar o cronômetro; pular não inicia duas partidas.
2. Diagnóstico automático e execução com preferência de movimento reduzido.
3. Seleção de e-mails, respostas certas/erradas, cliques duplicados, foco e pistas sem contagem duplicada.
4. Ordenação pelos controles, sequência inicialmente embaralhada e bloqueio de edição durante a execução.
5. Fluxo completo até a vitória, código incompleto/incorreto/correto, conclusão registrada antes da animação e tempo final congelado.
6. Erros de rede por sub-rede ou endereço duplicado, erros de IA e cifra; ausência de estados de acerto e sinais explicativos antes da validação.
7. Prazo exato, cancelamento de validação pendente ao expirar e conclusão completa em exploração.
8. Nova execução do script com retomada do horário e progresso v1; rejeição de saves inconsistentes.
9. Reinício seletivo, cancelamento de confirmação e descarte de callbacks da equipe anterior.
10. Armazenamento bloqueado sem interromper a partida.
11. Recursos locais existentes, ausência de chamadas externas, ausência de bytes nulos, CSS com blocos equilibrados e cronômetro fora da região aria-live.

Também foi feita uma verificação estrutural com Python em 152 estados de tela gerados pelos testes: 1.578 ocorrências de SVG analisadas como XML, IDs únicos e todos os `aria-controls` com destino existente. Isso verifica o código gerado, não a aparência das telas.

### Limites e conferência manual

Não foram executados testes visuais em 1366×768, 1920×1080 ou celular, nem testes reais com Tab/Enter, leitores de tela ou navegador desconectado. A ferramenta de navegador bloqueou o protocolo `file://` na revisão anterior; esse bloqueio não foi contornado. O funcionamento offline foi verificado por inspeção e testes estáticos de recursos. O foco foi testado em DOM simulado.

Para conferir manualmente, abra `index.html`, desconecte a internet e percorra as cinco missões. Use Tab/Shift+Tab e Enter/Espaço para abrir e-mails, escolher respostas, mover blocos, pedir pistas, continuar e reiniciar. Confira o foco, o texto e a rolagem em 1366×768, 1920×1080 e uma janela de 360px de largura. Ative a preferência de movimento reduzido no sistema e confira se as animações desaparecem. Recarregue uma partida em andamento para testar a retomada no navegador do laboratório.

Nenhuma publicação ou serviço externo foi configurado.

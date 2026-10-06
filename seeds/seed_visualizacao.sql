-- Banco de Talentos - dados fictícios para demonstração visual
-- Todos os candidatos usam a senha: Teste@123
-- Script idempotente: pode ser executado mais de uma vez.

BEGIN;

INSERT INTO areas_interesse (nome) VALUES
('Desenvolvimento Web'),('Desenvolvimento Mobile'),('Dados e BI'),('Design e UX'),
('Marketing Digital'),('Recursos Humanos'),('Gestão de Projetos'),('Infraestrutura e Cloud'),
('Segurança da Informação'),('Qualidade de Software'),('Atendimento e Sucesso do Cliente'),
('Financeiro'),('Comercial'),('Inteligência Artificial'),('Produto')
ON CONFLICT (nome) DO NOTHING;

INSERT INTO habilidades (nome,categoria) VALUES
('JavaScript','hard'),('TypeScript','hard'),('React','hard'),('Node.js','hard'),('Java','hard'),
('Spring Boot','hard'),('Python','hard'),('SQL','hard'),('Power BI','hard'),('Figma','hard'),
('UX Research','hard'),('React Native','hard'),('Docker','hard'),('AWS','hard'),('Git','hard'),
('Testes automatizados','hard'),('Excel avançado','hard'),('SEO','hard'),('Google Ads','hard'),
('Scrum','hard'),('Comunicação','soft'),('Trabalho em equipe','soft'),('Organização','soft'),
('Liderança','soft'),('Criatividade','soft'),('Pensamento analítico','soft'),
('Resolução de problemas','soft'),('Proatividade','soft'),('Empatia','soft'),('Adaptabilidade','soft')
ON CONFLICT (nome) DO NOTHING;

WITH dados(nome,email,consentimento,dias) AS (VALUES
('Mariana Oliveira','mariana.oliveira@demo.com','sempre',42),
('Lucas Ferreira','lucas.ferreira@demo.com','sempre',39),
('Camila Santos','camila.santos@demo.com','somente_candidatura',36),
('Rafael Almeida','rafael.almeida@demo.com','sempre',34),
('Beatriz Costa','beatriz.costa@demo.com','sempre',31),
('João Pedro Lima','joao.lima@demo.com','somente_candidatura',29),
('Ana Clara Souza','ana.souza@demo.com','sempre',27),
('Gabriel Rodrigues','gabriel.rodrigues@demo.com','sempre',24),
('Isabela Martins','isabela.martins@demo.com','somente_candidatura',22),
('Thiago Nunes','thiago.nunes@demo.com','sempre',19),
('Larissa Ribeiro','larissa.ribeiro@demo.com','sempre',17),
('Pedro Henrique Melo','pedro.melo@demo.com','somente_candidatura',15),
('Sofia Carvalho','sofia.carvalho@demo.com','sempre',12),
('Matheus Barbosa','matheus.barbosa@demo.com','sempre',9),
('Julia Fernandes','julia.fernandes@demo.com','sempre',6)
)
INSERT INTO usuarios(nome_completo,email,senha_hash,cargo,consentimento_talentos,criado_em)
SELECT nome,email,'$2b$10$Sr7vP27uFxmo7Xgl67JSLOldZ9vP6pe2prW3VXAPHgHqj7piwIGRS','candidato',consentimento,now()-(dias||' days')::interval
FROM dados ON CONFLICT (email) DO NOTHING;

WITH dados(email,telefone,cep,logradouro,numero,bairro,cidade,estado,nascimento,linkedin,portfolio,curriculo,cargo) AS (VALUES
('mariana.oliveira@demo.com','+55 15 99842-1160','18270001','Rua Onze de Agosto','245','Centro','Tatuí','SP','1999-04-18'::date,'https://linkedin.com/in/mariana-oliveira-demo','https://portfolio.example.com/mariana','https://example.com/curriculos/mariana.pdf','Desenvolvedora Front-end Sênior'),
('lucas.ferreira@demo.com','+55 11 99210-4785','18035000','Avenida Barão de Tatuí','880','Jardim Vergueiro','Sorocaba','SP','1997-11-03'::date,'https://linkedin.com/in/lucas-ferreira-demo',NULL,'https://example.com/curriculos/lucas.pdf','Analista de Dados'),
('camila.santos@demo.com','+55 15 99731-2209','18200100','Rua Campos Salles','91','Centro','Itapetininga','SP','2001-02-21'::date,'https://linkedin.com/in/camila-santos-demo','https://portfolio.example.com/camila','https://example.com/curriculos/camila.pdf','Product Designer'),
('rafael.almeida@demo.com','+55 15 99148-7792','18520000','Rua Doutor Campos','510','Centro','Cerquilho','SP','1998-08-12'::date,'https://linkedin.com/in/rafael-almeida-demo','https://github.com/rafael-demo','https://example.com/curriculos/rafael.pdf','Desenvolvedor Back-end Java'),
('beatriz.costa@demo.com','+55 11 99564-1028','04538000','Rua Gomes de Carvalho','1280','Vila Olímpia','São Paulo','SP','1996-05-30'::date,'https://linkedin.com/in/beatriz-costa-demo',NULL,'https://example.com/curriculos/beatriz.pdf','Especialista em Marketing Digital'),
('joao.lima@demo.com','+55 19 99418-6630','13015000','Avenida Francisco Glicério','740','Centro','Campinas','SP','2000-09-14'::date,'https://linkedin.com/in/joao-lima-demo','https://github.com/joao-demo','https://example.com/curriculos/joao.pdf','Desenvolvedor Mobile'),
('ana.souza@demo.com','+55 15 99863-4051','18271200','Rua Santa Cruz','322','Vila Dr. Laurindo','Tatuí','SP','2002-09-07'::date,'https://linkedin.com/in/ana-souza-demo','https://portfolio.example.com/ana','https://example.com/curriculos/ana.pdf','UX/UI Designer Júnior'),
('gabriel.rodrigues@demo.com','+55 15 99447-3086','13300000','Rua Floriano Peixoto','620','Centro','Itu','SP','1995-12-20'::date,'https://linkedin.com/in/gabriel-rodrigues-demo','https://github.com/gabriel-demo','https://example.com/curriculos/gabriel.pdf','Engenheiro de Software Mobile'),
('isabela.martins@demo.com','+55 11 99770-4388','06016000','Avenida dos Autonomistas','1550','Centro','Osasco','SP','1999-07-25'::date,'https://linkedin.com/in/isabela-martins-demo',NULL,'https://example.com/curriculos/isabela.pdf','Analista de Recursos Humanos'),
('thiago.nunes@demo.com','+55 19 99618-2240','13480000','Rua Treze de Maio','405','Centro','Limeira','SP','1994-03-09'::date,'https://linkedin.com/in/thiago-nunes-demo','https://github.com/thiago-demo','https://example.com/curriculos/thiago.pdf','DevOps Engineer'),
('larissa.ribeiro@demo.com','+55 11 99348-5561','05001000','Rua Clélia','710','Lapa','São Paulo','SP','1998-10-16'::date,'https://linkedin.com/in/larissa-ribeiro-demo',NULL,'https://example.com/curriculos/larissa.pdf','Analista de Produto'),
('pedro.melo@demo.com','+55 15 99712-8190','18010000','Rua São Bento','130','Centro','Sorocaba','SP','2001-06-11'::date,'https://linkedin.com/in/pedro-melo-demo','https://github.com/pedro-demo','https://example.com/curriculos/pedro.pdf','Analista de QA'),
('sofia.carvalho@demo.com','+55 11 99120-7643','01310930','Avenida Paulista','1578','Bela Vista','São Paulo','SP','1997-01-28'::date,'https://linkedin.com/in/sofia-carvalho-demo','https://portfolio.example.com/sofia','https://example.com/curriculos/sofia.pdf','Cientista de Dados'),
('matheus.barbosa@demo.com','+55 19 99225-1184','13400000','Avenida Independência','965','Cidade Alta','Piracicaba','SP','1996-12-05'::date,'https://linkedin.com/in/matheus-barbosa-demo','https://github.com/matheus-demo','https://example.com/curriculos/matheus.pdf','Analista de Segurança da Informação'),
('julia.fernandes@demo.com','+55 15 99517-3309','18270090','Rua do Cruzeiro','44','Centro','Tatuí','SP','2003-04-02'::date,'https://linkedin.com/in/julia-fernandes-demo','https://portfolio.example.com/julia','https://example.com/curriculos/julia.pdf','Desenvolvedora Full Stack Júnior')
)
INSERT INTO candidatos(usuario_id,telefone,cep,logradouro,numero_rua,bairro,cidade,estado,data_nascimento,linkedin_url,portfolio_url,curriculo_url,cargo_desejado)
SELECT u.id,d.telefone,d.cep,d.logradouro,d.numero,d.bairro,d.cidade,d.estado,d.nascimento,d.linkedin,d.portfolio,d.curriculo,d.cargo
FROM dados d JOIN usuarios u ON u.email=d.email
ON CONFLICT (usuario_id) DO UPDATE SET telefone=EXCLUDED.telefone,cep=EXCLUDED.cep,logradouro=EXCLUDED.logradouro,numero_rua=EXCLUDED.numero_rua,bairro=EXCLUDED.bairro,cidade=EXCLUDED.cidade,estado=EXCLUDED.estado,data_nascimento=EXCLUDED.data_nascimento,linkedin_url=EXCLUDED.linkedin_url,portfolio_url=EXCLUDED.portfolio_url,curriculo_url=EXCLUDED.curriculo_url,cargo_desejado=EXCLUDED.cargo_desejado;

WITH dados(email,motivacao,valores,apresentacao) AS (VALUES
('mariana.oliveira@demo.com','Quero construir produtos digitais acessíveis e de alto impacto.','Transparência, qualidade técnica e colaboração.','Desenvolvedora front-end com seis anos de experiência em React, TypeScript e design systems.'),
('lucas.ferreira@demo.com','Transformar dados complexos em decisões claras de negócio.','Precisão, ética e aprendizado contínuo.','Analista de dados com experiência em SQL, Python, Power BI e indicadores executivos.'),
('camila.santos@demo.com','Criar experiências simples a partir de problemas reais dos usuários.','Empatia, diversidade e escuta ativa.','Product Designer especializada em pesquisa, prototipação e testes de usabilidade.'),
('rafael.almeida@demo.com','Desenvolver sistemas confiáveis que simplifiquem processos.','Responsabilidade, consistência e trabalho em equipe.','Desenvolvedor Java com experiência em APIs REST, Spring Boot e bancos relacionais.'),
('beatriz.costa@demo.com','Conectar marcas e pessoas com campanhas relevantes.','Criatividade, clareza e orientação a resultados.','Profissional de marketing com experiência em mídia paga, conteúdo e análise de funil.'),
('joao.lima@demo.com','Criar aplicativos rápidos, úteis e agradáveis de usar.','Curiosidade, disciplina e melhoria contínua.','Desenvolvedor mobile focado em React Native, integração com APIs e publicação de apps.'),
('ana.souza@demo.com','Iniciar minha carreira criando interfaces inclusivas.','Empatia, criatividade e abertura para feedback.','Designer em início de carreira com projetos acadêmicos de UX/UI e prototipação.'),
('gabriel.rodrigues@demo.com','Resolver problemas complexos em produtos móveis.','Cooperação, autonomia e excelência.','Engenheiro de software com foco em arquitetura mobile, testes e performance.'),
('isabela.martins@demo.com','Ajudar pessoas a crescerem em ambientes de trabalho saudáveis.','Respeito, confidencialidade e justiça.','Analista de RH com atuação em recrutamento, onboarding e desenvolvimento de pessoas.'),
('thiago.nunes@demo.com','Automatizar entregas e aumentar a confiabilidade dos sistemas.','Segurança, previsibilidade e documentação.','DevOps Engineer com experiência em AWS, Docker, CI/CD e observabilidade.'),
('larissa.ribeiro@demo.com','Transformar necessidades do usuário em produtos sustentáveis.','Visão de negócio, colaboração e foco no cliente.','Analista de Produto com experiência em discovery, métricas e gestão de backlog.'),
('pedro.melo@demo.com','Garantir experiências estáveis por meio da qualidade contínua.','Atenção aos detalhes, prevenção e transparência.','Analista de QA com experiência em testes manuais, automação e documentação de cenários.'),
('sofia.carvalho@demo.com','Usar modelos e dados para solucionar problemas relevantes.','Rigor, curiosidade científica e responsabilidade.','Cientista de dados com experiência em Python, machine learning e visualização.'),
('matheus.barbosa@demo.com','Proteger dados e reduzir riscos de forma prática.','Ética, prevenção e atualização constante.','Analista de segurança com experiência em gestão de vulnerabilidades e cloud.'),
('julia.fernandes@demo.com','Evoluir como desenvolvedora participando de produtos reais.','Proatividade, respeito e vontade de aprender.','Desenvolvedora full stack júnior com projetos em React, Node.js e PostgreSQL.')
)
INSERT INTO cultura_candidato(candidato_id,motivacao,descricao_valores,apresentacao)
SELECT c.id,d.motivacao,d.valores,d.apresentacao FROM dados d JOIN usuarios u ON u.email=d.email JOIN candidatos c ON c.usuario_id=u.id
ON CONFLICT (candidato_id) DO UPDATE SET motivacao=EXCLUDED.motivacao,descricao_valores=EXCLUDED.descricao_valores,apresentacao=EXCLUDED.apresentacao;

WITH dados(titulo,descricao,modelo,contrato,smin,smax,status,area,icone,cor,visibilidade,dias) AS (VALUES
('Desenvolvedor Front-end React','Desenvolvimento de interfaces responsivas, componentes reutilizáveis e integração com APIs REST.','hibrido','CLT',4800,7200,'ativo','Desenvolvimento Web','code','#169CF9','publica',2),
('Desenvolvedor Back-end Java','Construção e manutenção de APIs com Java, Spring Boot e PostgreSQL.','hibrido','CLT',6000,9000,'ativo','Desenvolvimento Web','server','#7C3AED','publica',3),
('Analista de Dados Pleno','Criação de consultas SQL, dashboards e análises para áreas de negócio.','remoto','CLT',5200,7800,'ativo','Dados e BI','chart','#0EA5E9','publica',4),
('Product Designer','Pesquisa com usuários, prototipação e evolução do design system.','hibrido','PJ',5500,8500,'ativo','Design e UX','palette','#EC4899','publica',5),
('Desenvolvedor Mobile React Native','Desenvolvimento e sustentação de aplicativos iOS e Android.','remoto','PJ',5800,9000,'ativo','Desenvolvimento Mobile','mobile','#14B8A6','publica',6),
('Estágio em Desenvolvimento Web','Apoio no desenvolvimento de páginas, testes e manutenção de sistemas internos.','hibrido','Estágio',1400,1900,'ativo','Desenvolvimento Web','code','#22C55E','publica',7),
('Analista de QA','Planejamento de testes, automação e acompanhamento de correções.','remoto','CLT',4200,6500,'ativo','Qualidade de Software','check','#F59E0B','publica',8),
('DevOps Engineer','Automação de pipelines, infraestrutura como código e observabilidade.','remoto','PJ',7500,12000,'ativo','Infraestrutura e Cloud','cloud','#6366F1','publica',9),
('Analista de Segurança da Informação','Gestão de vulnerabilidades, políticas de segurança e resposta a incidentes.','hibrido','CLT',6500,9800,'ativo','Segurança da Informação','shield','#EF4444','publica',10),
('Cientista de Dados','Criação de modelos preditivos, experimentos e pipelines de dados.','remoto','CLT',7000,11000,'ativo','Inteligência Artificial','brain','#8B5CF6','publica',11),
('Analista de Marketing Digital','Planejamento de campanhas, mídia paga, SEO e análise de conversão.','hibrido','CLT',3800,6000,'ativo','Marketing Digital','megaphone','#F97316','publica',12),
('Analista de Recursos Humanos','Recrutamento, onboarding e apoio às ações de desenvolvimento.','presencial','CLT',3500,5200,'ativo','Recursos Humanos','users','#D946EF','publica',13),
('Product Owner','Gestão de backlog, discovery e alinhamento entre negócio e tecnologia.','hibrido','CLT',6500,9500,'ativo','Produto','clipboard','#06B6D4','publica',14),
('Scrum Master','Facilitação de cerimônias, remoção de impedimentos e evolução ágil.','hibrido','PJ',6000,8500,'ativo','Gestão de Projetos','team','#84CC16','publica',15),
('Analista de Sucesso do Cliente','Acompanhamento da jornada, treinamento e retenção de clientes.','presencial','CLT',3200,4800,'ativo','Atendimento e Sucesso do Cliente','heart','#F43F5E','publica',16),
('Assistente Financeiro','Contas a pagar e receber, conciliação e apoio aos relatórios financeiros.','presencial','CLT',2500,3600,'ativo','Financeiro','money','#10B981','publica',17),
('Executivo Comercial B2B','Prospecção, diagnóstico de necessidades e negociação de contratos.','hibrido','CLT',3500,6500,'ativo','Comercial','briefcase','#0284C7','publica',18),
('Desenvolvedor Full Stack','Desenvolvimento de aplicações com React, Node.js e PostgreSQL.','remoto','PJ',6500,10000,'ativo','Desenvolvimento Web','code','#2563EB','publica',19),
('UX Researcher','Planejamento de pesquisas, entrevistas e síntese de insights.','remoto','CLT',5000,7600,'pausado','Design e UX','search','#DB2777','publica',20),
('Engenheiro de Machine Learning','Construção, implantação e monitoramento de modelos de machine learning.','remoto','PJ',9000,14000,'ativo','Inteligência Artificial','brain','#9333EA','privada',21),
('Analista de BI Júnior','Manutenção de dashboards e apoio em consultas e modelagem de dados.','hibrido','CLT',3200,4500,'ativo','Dados e BI','chart','#0891B2','publica',22),
('Tech Lead Front-end','Liderança técnica, arquitetura front-end e mentoria do time.','remoto','PJ',11000,16000,'ativo','Desenvolvimento Web','code','#4F46E5','privada',23),
('Estágio em UX/UI','Apoio em protótipos, pesquisas e documentação do design system.','hibrido','Estágio',1300,1800,'ativo','Design e UX','palette','#E879F9','publica',24),
('Analista de Cloud Júnior','Monitoramento de ambientes, automações e suporte à infraestrutura AWS.','hibrido','CLT',4000,5800,'fechado','Infraestrutura e Cloud','cloud','#64748B','publica',30)
)
INSERT INTO vagas(titulo,descricao,modelo_trabalho,tipo_contrato,salario_min,salario_max,status,area_interesse_id,icone,cor,visibilidade,criado_em)
SELECT d.titulo,d.descricao,d.modelo,d.contrato,d.smin,d.smax,d.status,a.id,d.icone,d.cor,d.visibilidade,now()-(d.dias||' days')::interval
FROM dados d JOIN areas_interesse a ON a.nome=d.area
WHERE NOT EXISTS(SELECT 1 FROM vagas v WHERE v.titulo=d.titulo);

WITH dados(email,empresa,cargo,descricao,inicio,fim,atual) AS (VALUES
('mariana.oliveira@demo.com','Studio Connect','Desenvolvedora Front-end','Criação de interfaces React e manutenção do design system.','2021-03-01'::date,NULL::date,true),
('mariana.oliveira@demo.com','WebBox','Desenvolvedora Júnior','Landing pages e integração com APIs.','2019-02-01'::date,'2021-02-15'::date,false),
('lucas.ferreira@demo.com','Data Loop','Analista de BI','Dashboards gerenciais, indicadores e consultas SQL.','2022-06-01'::date,NULL::date,true),
('camila.santos@demo.com','Produto Vivo','Product Designer','Discovery, prototipação e testes de usabilidade.','2022-01-10'::date,NULL::date,true),
('rafael.almeida@demo.com','Nexa Sistemas','Desenvolvedor Java','APIs REST e integrações com sistemas financeiros.','2020-08-01'::date,NULL::date,true),
('beatriz.costa@demo.com','Agência Órbita','Analista de Marketing','Campanhas de mídia paga e análise de conversão.','2019-04-01'::date,NULL::date,true),
('joao.lima@demo.com','Move Apps','Desenvolvedor Mobile','Aplicativos React Native e publicação nas lojas.','2022-02-01'::date,NULL::date,true),
('ana.souza@demo.com','Fatec Projetos','Designer Voluntária','Protótipos para projetos acadêmicos e eventos.','2025-03-01'::date,NULL::date,true),
('gabriel.rodrigues@demo.com','Mobile One','Engenheiro de Software','Arquitetura mobile, testes e mentoria técnica.','2020-05-01'::date,NULL::date,true),
('gabriel.rodrigues@demo.com','Web Mais','Desenvolvedor Júnior','Desenvolvimento de interfaces web responsivas.','2018-08-01'::date,'2020-04-15'::date,false),
('isabela.martins@demo.com','Pessoas & Cultura','Analista de RH','Recrutamento, seleção e onboarding.','2021-07-01'::date,NULL::date,true),
('thiago.nunes@demo.com','CloudWay','DevOps Engineer','AWS, Docker, pipelines e monitoramento.','2019-09-01'::date,NULL::date,true),
('larissa.ribeiro@demo.com','IdeaHub','Analista de Produto','Discovery, métricas e gestão de backlog.','2021-01-01'::date,NULL::date,true),
('pedro.melo@demo.com','Quality First','Analista de QA Júnior','Testes funcionais, regressivos e automação.','2023-02-01'::date,NULL::date,true),
('sofia.carvalho@demo.com','Insight Analytics','Cientista de Dados','Modelos preditivos e automação de análises.','2021-09-01'::date,NULL::date,true),
('matheus.barbosa@demo.com','SecureNet','Analista de Segurança','Vulnerabilidades, cloud e resposta a incidentes.','2020-11-01'::date,NULL::date,true),
('julia.fernandes@demo.com','Projeto Acadêmico Integrador','Desenvolvedora Full Stack','Aplicação React e Node.js para gestão acadêmica.','2025-02-01'::date,NULL::date,true)
)
INSERT INTO experiencias(candidato_id,empresa,cargo,descricao,data_inicio,data_fim,atual)
SELECT c.id,d.empresa,d.cargo,d.descricao,d.inicio,d.fim,d.atual FROM dados d JOIN usuarios u ON u.email=d.email JOIN candidatos c ON c.usuario_id=u.id
WHERE NOT EXISTS(SELECT 1 FROM experiencias e WHERE e.candidato_id=c.id AND e.empresa=d.empresa AND e.cargo=d.cargo);

WITH dados(email,curso,instituicao,semestre,turno,status,inicio,fim,certificado) AS (VALUES
('mariana.oliveira@demo.com','Análise e Desenvolvimento de Sistemas','Fatec Tatuí',NULL,'noite','concluido','2017-02-01'::date,'2019-12-15'::date,'https://example.com/certificados/mariana.pdf'),
('lucas.ferreira@demo.com','Ciência de Dados','Universidade de Sorocaba',NULL,'noite','concluido','2020-02-01'::date,'2023-12-15'::date,'https://example.com/certificados/lucas.pdf'),
('camila.santos@demo.com','Design Digital','ESPM',NULL,'manhã','concluido','2019-02-01'::date,'2022-12-01'::date,'https://example.com/certificados/camila.pdf'),
('rafael.almeida@demo.com','Sistemas de Informação','Universidade Metodista',NULL,'noite','concluido','2016-02-01'::date,'2019-12-01'::date,'https://example.com/certificados/rafael.pdf'),
('beatriz.costa@demo.com','Publicidade e Propaganda','Anhembi Morumbi',NULL,'noite','concluido','2015-02-01'::date,'2018-12-01'::date,NULL),
('joao.lima@demo.com','Análise e Desenvolvimento de Sistemas','Fatec Campinas',6,'noite','cursando','2024-02-01'::date,NULL::date,NULL),
('ana.souza@demo.com','Design Digital','Fatec Tatuí',4,'noite','cursando','2025-02-01'::date,NULL::date,NULL),
('gabriel.rodrigues@demo.com','Engenharia de Software','FIAP',NULL,'noite','concluido','2016-02-01'::date,'2019-12-01'::date,'https://example.com/certificados/gabriel.pdf'),
('isabela.martins@demo.com','Gestão de Recursos Humanos','Universidade Paulista',NULL,'noite','concluido','2018-02-01'::date,'2020-12-01'::date,NULL),
('thiago.nunes@demo.com','Redes de Computadores','Fatec Americana',NULL,'noite','concluido','2014-02-01'::date,'2017-12-01'::date,'https://example.com/certificados/thiago.pdf'),
('larissa.ribeiro@demo.com','Administração','Mackenzie',NULL,'manhã','concluido','2017-02-01'::date,'2020-12-01'::date,NULL),
('pedro.melo@demo.com','Análise e Desenvolvimento de Sistemas','Fatec Sorocaba',5,'noite','cursando','2024-02-01'::date,NULL::date,NULL),
('sofia.carvalho@demo.com','Estatística','Unicamp',NULL,'manhã','concluido','2016-02-01'::date,'2020-12-01'::date,'https://example.com/certificados/sofia.pdf'),
('matheus.barbosa@demo.com','Segurança da Informação','Fatec Americana',NULL,'noite','concluido','2016-02-01'::date,'2019-12-01'::date,'https://example.com/certificados/matheus.pdf'),
('julia.fernandes@demo.com','Análise e Desenvolvimento de Sistemas','Fatec Tatuí',3,'noite','cursando','2025-02-01'::date,NULL::date,NULL)
)
INSERT INTO formacoes(candidato_id,curso,instituicao,semestre_atual,turno,status,data_inicio,data_fim,url_certificado)
SELECT c.id,d.curso,d.instituicao,d.semestre,d.turno,d.status,d.inicio,d.fim,d.certificado FROM dados d JOIN usuarios u ON u.email=d.email JOIN candidatos c ON c.usuario_id=u.id
WHERE NOT EXISTS(SELECT 1 FROM formacoes f WHERE f.candidato_id=c.id AND f.curso=d.curso AND f.instituicao=d.instituicao);

WITH vinculos(email,habilidade,nivel,experiencia) AS (VALUES
('mariana.oliveira@demo.com','React',5,'senior'),('mariana.oliveira@demo.com','TypeScript',5,'senior'),('mariana.oliveira@demo.com','JavaScript',5,'senior'),('mariana.oliveira@demo.com','Comunicação',4,'pleno'),
('lucas.ferreira@demo.com','SQL',5,'senior'),('lucas.ferreira@demo.com','Python',4,'pleno'),('lucas.ferreira@demo.com','Power BI',5,'senior'),('lucas.ferreira@demo.com','Pensamento analítico',5,'senior'),
('camila.santos@demo.com','Figma',5,'senior'),('camila.santos@demo.com','UX Research',4,'pleno'),('camila.santos@demo.com','Criatividade',5,'senior'),('camila.santos@demo.com','Empatia',5,'senior'),
('rafael.almeida@demo.com','Java',5,'senior'),('rafael.almeida@demo.com','Spring Boot',5,'senior'),('rafael.almeida@demo.com','SQL',4,'pleno'),('rafael.almeida@demo.com','Resolução de problemas',5,'senior'),
('beatriz.costa@demo.com','SEO',4,'pleno'),('beatriz.costa@demo.com','Google Ads',5,'senior'),('beatriz.costa@demo.com','Criatividade',5,'senior'),('beatriz.costa@demo.com','Comunicação',5,'senior'),
('joao.lima@demo.com','React Native',4,'pleno'),('joao.lima@demo.com','JavaScript',4,'pleno'),('joao.lima@demo.com','Git',4,'pleno'),('joao.lima@demo.com','Proatividade',4,'pleno'),
('ana.souza@demo.com','Figma',4,'junior'),('ana.souza@demo.com','UX Research',3,'junior'),('ana.souza@demo.com','Criatividade',5,'pleno'),
('gabriel.rodrigues@demo.com','React Native',5,'senior'),('gabriel.rodrigues@demo.com','TypeScript',5,'senior'),('gabriel.rodrigues@demo.com','Testes automatizados',4,'senior'),('gabriel.rodrigues@demo.com','Liderança',4,'pleno'),
('isabela.martins@demo.com','Excel avançado',4,'pleno'),('isabela.martins@demo.com','Comunicação',5,'senior'),('isabela.martins@demo.com','Empatia',5,'senior'),
('thiago.nunes@demo.com','Docker',5,'senior'),('thiago.nunes@demo.com','AWS',5,'senior'),('thiago.nunes@demo.com','Git',4,'senior'),('thiago.nunes@demo.com','Organização',5,'senior'),
('larissa.ribeiro@demo.com','Scrum',5,'senior'),('larissa.ribeiro@demo.com','Pensamento analítico',4,'pleno'),('larissa.ribeiro@demo.com','Comunicação',5,'senior'),
('pedro.melo@demo.com','Testes automatizados',4,'pleno'),('pedro.melo@demo.com','Git',4,'pleno'),('pedro.melo@demo.com','Organização',5,'pleno'),
('sofia.carvalho@demo.com','Python',5,'senior'),('sofia.carvalho@demo.com','SQL',5,'senior'),('sofia.carvalho@demo.com','Power BI',4,'pleno'),('sofia.carvalho@demo.com','Pensamento analítico',5,'senior'),
('matheus.barbosa@demo.com','AWS',4,'pleno'),('matheus.barbosa@demo.com','Docker',4,'pleno'),('matheus.barbosa@demo.com','Resolução de problemas',5,'senior'),
('julia.fernandes@demo.com','React',4,'junior'),('julia.fernandes@demo.com','Node.js',3,'junior'),('julia.fernandes@demo.com','SQL',3,'junior'),('julia.fernandes@demo.com','Proatividade',5,'pleno')
)
INSERT INTO habilidades_candidato(candidato_id,habilidade_id,nivel,nivel_experiencia)
SELECT c.id,h.id,v.nivel,v.experiencia FROM vinculos v JOIN usuarios u ON u.email=v.email JOIN candidatos c ON c.usuario_id=u.id JOIN habilidades h ON h.nome=v.habilidade
ON CONFLICT (candidato_id,habilidade_id) DO UPDATE SET nivel=EXCLUDED.nivel,nivel_experiencia=EXCLUDED.nivel_experiencia;

WITH vinculos(email,area) AS (VALUES
('mariana.oliveira@demo.com','Desenvolvimento Web'),('mariana.oliveira@demo.com','Produto'),
('lucas.ferreira@demo.com','Dados e BI'),('lucas.ferreira@demo.com','Inteligência Artificial'),
('camila.santos@demo.com','Design e UX'),('camila.santos@demo.com','Produto'),
('rafael.almeida@demo.com','Desenvolvimento Web'),('rafael.almeida@demo.com','Infraestrutura e Cloud'),
('beatriz.costa@demo.com','Marketing Digital'),('beatriz.costa@demo.com','Comercial'),
('joao.lima@demo.com','Desenvolvimento Mobile'),('joao.lima@demo.com','Desenvolvimento Web'),
('ana.souza@demo.com','Design e UX'),('gabriel.rodrigues@demo.com','Desenvolvimento Mobile'),
('isabela.martins@demo.com','Recursos Humanos'),('thiago.nunes@demo.com','Infraestrutura e Cloud'),('thiago.nunes@demo.com','Segurança da Informação'),
('larissa.ribeiro@demo.com','Produto'),('larissa.ribeiro@demo.com','Gestão de Projetos'),
('pedro.melo@demo.com','Qualidade de Software'),('sofia.carvalho@demo.com','Dados e BI'),('sofia.carvalho@demo.com','Inteligência Artificial'),
('matheus.barbosa@demo.com','Segurança da Informação'),('julia.fernandes@demo.com','Desenvolvimento Web')
)
INSERT INTO interesses_candidato(candidato_id,interesse_id)
SELECT c.id,a.id FROM vinculos v JOIN usuarios u ON u.email=v.email JOIN candidatos c ON c.usuario_id=u.id JOIN areas_interesse a ON a.nome=v.area
ON CONFLICT (candidato_id,interesse_id) DO NOTHING;

WITH vinculos(vaga,habilidade,obrigatoria) AS (VALUES
('Desenvolvedor Front-end React','React',true),('Desenvolvedor Front-end React','TypeScript',true),('Desenvolvedor Front-end React','Git',false),
('Desenvolvedor Back-end Java','Java',true),('Desenvolvedor Back-end Java','Spring Boot',true),('Desenvolvedor Back-end Java','SQL',true),
('Analista de Dados Pleno','SQL',true),('Analista de Dados Pleno','Power BI',true),('Analista de Dados Pleno','Python',false),
('Product Designer','Figma',true),('Product Designer','UX Research',true),('Product Designer','Empatia',false),
('Desenvolvedor Mobile React Native','React Native',true),('Desenvolvedor Mobile React Native','TypeScript',true),
('Analista de QA','Testes automatizados',true),('Analista de QA','Git',false),
('DevOps Engineer','Docker',true),('DevOps Engineer','AWS',true),('DevOps Engineer','Git',true),
('Cientista de Dados','Python',true),('Cientista de Dados','SQL',true),('Cientista de Dados','Pensamento analítico',true),
('Desenvolvedor Full Stack','React',true),('Desenvolvedor Full Stack','Node.js',true),('Desenvolvedor Full Stack','SQL',true),
('Tech Lead Front-end','React',true),('Tech Lead Front-end','TypeScript',true),('Tech Lead Front-end','Liderança',true)
)
INSERT INTO habilidades_vaga(vaga_id,habilidade_id,obrigatoria)
SELECT v.id,h.id,x.obrigatoria FROM vinculos x JOIN vagas v ON v.titulo=x.vaga JOIN habilidades h ON h.nome=x.habilidade
ON CONFLICT (vaga_id,habilidade_id) DO UPDATE SET obrigatoria=EXCLUDED.obrigatoria;

WITH dados(email,vaga,status,favorito,pretensao,disponibilidade,contrato,modelo,dias) AS (VALUES
('mariana.oliveira@demo.com','Desenvolvedor Front-end React','em análise',true,6800,'integral','CLT','hibrido',2),
('mariana.oliveira@demo.com','Tech Lead Front-end','em triagem',true,12500,'integral','PJ','remoto',5),
('lucas.ferreira@demo.com','Analista de Dados Pleno','em triagem',true,7200,'integral','CLT','remoto',3),
('lucas.ferreira@demo.com','Analista de BI Júnior','dispensado',false,6000,'integral','CLT','hibrido',9),
('camila.santos@demo.com','Product Designer','novo',true,7600,'integral','PJ','hibrido',1),
('camila.santos@demo.com','UX Researcher','em análise',false,7000,'integral','CLT','remoto',7),
('rafael.almeida@demo.com','Desenvolvedor Back-end Java','em análise',true,8500,'integral','CLT','hibrido',4),
('rafael.almeida@demo.com','Desenvolvedor Full Stack','novo',false,9000,'integral','PJ','remoto',1),
('beatriz.costa@demo.com','Analista de Marketing Digital','em triagem',true,5800,'integral','CLT','hibrido',6),
('beatriz.costa@demo.com','Executivo Comercial B2B','novo',false,6200,'integral','CLT','hibrido',2),
('joao.lima@demo.com','Desenvolvedor Mobile React Native','novo',true,6000,'noite','PJ','remoto',1),
('joao.lima@demo.com','Estágio em Desenvolvimento Web','dispensado',false,1900,'tarde','Estágio','hibrido',12),
('ana.souza@demo.com','Estágio em UX/UI','em análise',true,1800,'tarde','Estágio','hibrido',3),
('ana.souza@demo.com','Product Designer','novo',false,4200,'integral','PJ','remoto',1),
('gabriel.rodrigues@demo.com','Desenvolvedor Mobile React Native','contratado',true,8800,'integral','CLT','hibrido',14),
('gabriel.rodrigues@demo.com','Tech Lead Front-end','em triagem',true,14000,'integral','PJ','remoto',4),
('isabela.martins@demo.com','Analista de Recursos Humanos','em análise',true,4900,'integral','CLT','presencial',5),
('thiago.nunes@demo.com','DevOps Engineer','em triagem',true,11500,'integral','PJ','remoto',3),
('thiago.nunes@demo.com','Analista de Cloud Júnior','dispensado',false,7200,'integral','CLT','hibrido',18),
('larissa.ribeiro@demo.com','Product Owner','novo',true,9000,'integral','CLT','hibrido',2),
('larissa.ribeiro@demo.com','Scrum Master','em análise',false,8200,'integral','PJ','hibrido',8),
('pedro.melo@demo.com','Analista de QA','em triagem',true,5800,'integral','CLT','remoto',4),
('sofia.carvalho@demo.com','Cientista de Dados','em análise',true,10500,'integral','CLT','remoto',2),
('sofia.carvalho@demo.com','Engenheiro de Machine Learning','novo',true,13000,'integral','PJ','remoto',1),
('matheus.barbosa@demo.com','Analista de Segurança da Informação','em triagem',true,9200,'integral','CLT','hibrido',6),
('matheus.barbosa@demo.com','DevOps Engineer','novo',false,10500,'integral','PJ','remoto',2),
('julia.fernandes@demo.com','Estágio em Desenvolvimento Web','em análise',true,1800,'noite','Estágio','hibrido',5),
('julia.fernandes@demo.com','Desenvolvedor Full Stack','novo',false,4200,'integral','CLT','remoto',1)
)
INSERT INTO candidaturas(vaga_id,candidato_id,status,favorito,pretensao_salarial,disponibilidade,preferencia_contrato,preferencia_modelo_trabalho,criado_em)
SELECT v.id,c.id,d.status,d.favorito,d.pretensao,d.disponibilidade,d.contrato,d.modelo,now()-(d.dias||' days')::interval
FROM dados d JOIN usuarios u ON u.email=d.email JOIN candidatos c ON c.usuario_id=u.id JOIN vagas v ON v.titulo=d.vaga
ON CONFLICT (candidato_id,vaga_id) DO UPDATE SET status=EXCLUDED.status,favorito=EXCLUDED.favorito,pretensao_salarial=EXCLUDED.pretensao_salarial,disponibilidade=EXCLUDED.disponibilidade,preferencia_contrato=EXCLUDED.preferencia_contrato,preferencia_modelo_trabalho=EXCLUDED.preferencia_modelo_trabalho;

-- Notificações variadas para testar lista, paginação e estados lida/não lida.
INSERT INTO notificacoes(usuario_id,tipo,titulo,mensagem,dados,lida,criado_em)
SELECT u.id,'status_candidatura','Atualização na candidatura',
       CASE (g.n%4) WHEN 0 THEN 'Sua candidatura avançou para análise.' WHEN 1 THEN 'Seu perfil está em triagem.' WHEN 2 THEN 'Recebemos sua candidatura com sucesso.' ELSE 'Há uma nova atualização no processo seletivo.' END,
       jsonb_build_object('demonstracao',true,'ordem',g.n),g.n%3=0,now()-(g.n||' hours')::interval
FROM usuarios u CROSS JOIN generate_series(1,24) AS g(n)
WHERE u.email='mariana.oliveira@demo.com'
  AND NOT EXISTS(SELECT 1 FROM notificacoes n WHERE n.usuario_id=u.id AND n.dados->>'demonstracao'='true');

COMMIT;

-- Resumo do conteúdo criado
SELECT
  (SELECT count(*) FROM vagas) AS total_vagas,
  (SELECT count(*) FROM usuarios WHERE cargo='candidato') AS total_candidatos,
  (SELECT count(*) FROM candidaturas) AS total_candidaturas,
  (SELECT count(*) FROM habilidades) AS total_habilidades;

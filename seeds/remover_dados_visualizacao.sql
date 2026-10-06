-- Banco de Talentos - remoção segura dos dados fictícios do seed_visualizacao.sql
-- Remove somente registros criados para demonstração.
-- Perfis, candidaturas, experiências, formações, vínculos e notificações
-- relacionados são removidos automaticamente pelas chaves ON DELETE CASCADE.

BEGIN;

-- 1. Remove os 15 usuários candidatos fictícios e todos os dados dependentes.
DELETE FROM usuarios
WHERE email IN (
    'mariana.oliveira@demo.com',
    'lucas.ferreira@demo.com',
    'camila.santos@demo.com',
    'rafael.almeida@demo.com',
    'beatriz.costa@demo.com',
    'joao.lima@demo.com',
    'ana.souza@demo.com',
    'gabriel.rodrigues@demo.com',
    'isabela.martins@demo.com',
    'thiago.nunes@demo.com',
    'larissa.ribeiro@demo.com',
    'pedro.melo@demo.com',
    'sofia.carvalho@demo.com',
    'matheus.barbosa@demo.com',
    'julia.fernandes@demo.com'
);

-- 2. Remove somente as vagas inseridas pelo seed e seus vínculos dependentes.
DELETE FROM vagas
WHERE titulo IN (
    'Desenvolvedor Front-end React',
    'Desenvolvedor Back-end Java',
    'Analista de Dados Pleno',
    'Product Designer',
    'Desenvolvedor Mobile React Native',
    'Estágio em Desenvolvimento Web',
    'Analista de QA',
    'DevOps Engineer',
    'Analista de Segurança da Informação',
    'Cientista de Dados',
    'Analista de Marketing Digital',
    'Analista de Recursos Humanos',
    'Product Owner',
    'Scrum Master',
    'Analista de Sucesso do Cliente',
    'Assistente Financeiro',
    'Executivo Comercial B2B',
    'Desenvolvedor Full Stack',
    'UX Researcher',
    'Engenheiro de Machine Learning',
    'Analista de BI Júnior',
    'Tech Lead Front-end',
    'Estágio em UX/UI',
    'Analista de Cloud Júnior'
);

-- Áreas e habilidades são catálogos permanentes da aplicação e são preservadas.

COMMIT;

-- Conferência: todos os valores devem retornar 0.
SELECT
    (SELECT count(*) FROM usuarios WHERE email LIKE '%@demo.com') AS candidatos_demo_restantes,
    (SELECT count(*) FROM notificacoes n JOIN usuarios u ON u.id=n.usuario_id WHERE u.email LIKE '%@demo.com') AS notificacoes_demo_restantes,
    (SELECT count(*) FROM vagas WHERE titulo IN (
        'Desenvolvedor Front-end React','Desenvolvedor Back-end Java','Analista de Dados Pleno',
        'Product Designer','Desenvolvedor Mobile React Native','Estágio em Desenvolvimento Web',
        'Analista de QA','DevOps Engineer','Analista de Segurança da Informação','Cientista de Dados',
        'Analista de Marketing Digital','Analista de Recursos Humanos','Product Owner','Scrum Master',
        'Analista de Sucesso do Cliente','Assistente Financeiro','Executivo Comercial B2B',
        'Desenvolvedor Full Stack','UX Researcher','Engenheiro de Machine Learning','Analista de BI Júnior',
        'Tech Lead Front-end','Estágio em UX/UI','Analista de Cloud Júnior'
    )) AS vagas_demo_restantes;

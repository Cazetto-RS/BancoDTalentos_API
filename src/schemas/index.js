const { z } = require('zod');

const texto = (max) => z.string().trim().min(1).max(max);
const opcional = (schema) => schema.optional().nullable();
const id = z.coerce.number().int().positive();
const dataIso = z.string().date();
const dinheiro = z.coerce.number().nonnegative().max(99999999.99);

const envelope = ({ body = z.object({}).passthrough(), params = z.object({}).passthrough(), query = z.object({}).passthrough() } = {}) =>
    z.object({ body, params, query });

const idParam = z.object({ id });

const usuario = {
    registrar: envelope({ body: z.object({
        nome_completo: texto(120),
        email: z.email().trim().toLowerCase().max(120),
        senha: z.string().min(8).max(72)
    }).strict() }),
    login: envelope({ body: z.object({
        email: z.email().trim().toLowerCase().max(120),
        senha: z.string().min(1).max(72)
    }).strict() }),
    atualizar: envelope({ params: idParam, body: z.object({
        nome_completo: texto(120).optional(),
        email: z.email().trim().toLowerCase().max(120).optional(),
        senha: z.string().min(8).max(72).optional()
    }).strict().refine((data) => Object.keys(data).length > 0, 'Envie pelo menos um campo para atualização.') }),
    id: envelope({ params: idParam }),
    deletar: envelope({ params: idParam, body: z.object({ senha: z.string().min(1).max(72).optional() }).strict() }),
    nome: envelope({ query: z.object({ nome: texto(120) }).strict() }),
    criarFuncionario: envelope({ body: z.object({
        nome_completo: texto(120),
        email: z.email().trim().toLowerCase().max(120),
        senha: z.string().min(8).max(72),
        cargo: z.enum(['admin', 'rh'])
    }).strict() })
};

const candidato = {
    perfil: envelope({ body: z.object({
        telefone: opcional(texto(30)),
        cep: opcional(z.string().trim().regex(/^\d{8}$/, 'CEP deve conter 8 dígitos.')),
        numero_rua: opcional(texto(20)),
        logradouro: opcional(texto(160)),
        bairro: opcional(texto(120)),
        cidade: opcional(texto(100)),
        estado: opcional(z.string().trim().toUpperCase().length(2)),
        url_foto: opcional(z.url().max(2048)),
        data_nascimento: opcional(dataIso),
        linkedin_url: opcional(z.url().max(2048)),
        portfolio_url: opcional(z.url().max(2048)),
        curriculo_url: opcional(z.url().max(2048)),
        cargo_desejado: opcional(texto(120))
    }).strict() }),
    cultura: envelope({ body: z.object({
        motivacao: opcional(z.string().trim().max(5000)),
        descricao_valores: opcional(z.string().trim().max(5000)),
        apresentacao: opcional(z.string().trim().max(5000)),
        arquivo_recomendacao: opcional(z.url().max(2048))
    }).strict() })
};

const experienciaBase = z.object({
    empresa: texto(255), cargo: texto(255), descricao: opcional(z.string().trim().max(5000)),
    data_inicio: dataIso, data_fim: opcional(dataIso), atual: z.boolean().default(false)
}).strict();
const experiencia = experienciaBase.refine((v) => !v.data_fim || v.data_fim >= v.data_inicio, { message: 'data_fim deve ser posterior a data_inicio.', path: ['data_fim'] });

const formacaoBase = z.object({
    curso: texto(255), instituicao: texto(255), semestre_atual: opcional(z.coerce.number().int().min(1).max(30)),
    turno: opcional(z.enum(['manhã', 'tarde', 'noite'])), status: z.enum(['cursando', 'concluido', 'trancado']),
    data_inicio: opcional(dataIso), data_fim: opcional(dataIso), url_certificado: opcional(z.url().max(2048))
}).strict();
const formacao = formacaoBase.refine((v) => !v.data_inicio || !v.data_fim || v.data_fim >= v.data_inicio, { message: 'data_fim deve ser posterior a data_inicio.', path: ['data_fim'] });

const historico = {
    criarExperiencia: envelope({ body: z.union([experiencia, z.array(experiencia).min(1).max(20)]) }),
    criarFormacao: envelope({ body: z.union([formacao, z.array(formacao).min(1).max(20)]) }),
    editarExperiencia: envelope({ params: idParam, body: experienciaBase.partial().refine((v) => Object.keys(v).length > 0) }),
    editarFormacao: envelope({ params: idParam, body: formacaoBase.partial().refine((v) => Object.keys(v).length > 0) }),
    id: envelope({ params: idParam })
};

const habilidadeItem = z.object({ habilidade_id: id, nivel: z.coerce.number().int().min(1).max(5).optional(), nivel_experiencia: z.enum(['junior', 'pleno', 'senior', 'especialista']).optional() }).strict();
const catalogo = {
    criarHabilidade: envelope({ body: z.object({ nome: texto(100), categoria: z.enum(['hard', 'soft']) }).strict() }),
    editarHabilidade: envelope({ params: idParam, body: z.object({ nome: texto(100).optional(), categoria: z.enum(['hard', 'soft']).optional() }).strict().refine((v) => Object.keys(v).length > 0) }),
    habilidadeId: envelope({ params: idParam }),
    habilidadesCandidato: envelope({ body: z.object({ habilidades: z.array(habilidadeItem).max(100) }).strict() }),
    criarArea: envelope({ body: z.object({ nome: texto(100) }).strict() }),
    editarArea: envelope({ params: idParam, body: z.object({ nome: texto(100) }).strict() }),
    areaId: envelope({ params: idParam }),
    interesses: envelope({ body: z.object({ areas_ids: z.array(id).max(100) }).strict() })
};

const habilidadeVaga = z.object({ habilidade_id: id, obrigatoria: z.boolean().default(true) }).strict();
const vagaBase = z.object({
    titulo: texto(120), descricao: opcional(z.string().trim().max(10000)),
    modelo_trabalho: opcional(z.enum(['remoto', 'hibrido', 'presencial'])), tipo_contrato: opcional(z.enum(['CLT', 'PJ', 'Estágio'])),
    salario_min: opcional(dinheiro), salario_max: opcional(dinheiro), status: z.enum(['ativo', 'pausado', 'fechado']).default('ativo'),
    area_interesse_id: opcional(id), habilidades: z.array(habilidadeVaga).max(100).optional(),
    icone: z.enum(['code', 'design', 'data', 'mobile', 'briefcase']).default('code'),
    cor: z.string().trim().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor deve estar no formato hexadecimal.').default('#169CF9')
}).strict();
const baseVaga = vagaBase.refine((v) => v.salario_min == null || v.salario_max == null || v.salario_min <= v.salario_max, { message: 'salario_min não pode ser maior que salario_max.', path: ['salario_max'] });

const vaga = {
    criar: envelope({ body: baseVaga }),
    editar: envelope({ params: idParam, body: vagaBase.partial().refine((v) => Object.keys(v).length > 0) }),
    id: envelope({ params: idParam })
};

const candidatura = {
    inscrever: envelope({ body: z.object({
        vaga_id: id, pretensao_salarial: opcional(dinheiro), disponibilidade: opcional(z.enum(['manhã', 'tarde', 'noite', 'integral'])),
        preferencia_contrato: opcional(z.enum(['CLT', 'PJ', 'Estágio'])), preferencia_modelo_trabalho: opcional(z.enum(['remoto', 'hibrido', 'presencial']))
    }).strict() }),
    vagaId: envelope({ params: z.object({ vagaId: id }) }),
    id: envelope({ params: idParam }),
    editarMinha: envelope({ params: idParam, body: z.object({
        pretensao_salarial: opcional(dinheiro), disponibilidade: opcional(z.enum(['manhã', 'tarde', 'noite', 'integral'])),
        preferencia_contrato: opcional(z.enum(['CLT', 'PJ', 'Estágio'])), preferencia_modelo_trabalho: opcional(z.enum(['remoto', 'hibrido', 'presencial']))
    }).strict() }),
    atualizar: envelope({ params: idParam, body: z.object({ status: z.enum(['novo', 'em análise', 'em triagem', 'contratado', 'dispensado']).optional(), favorito: z.boolean().optional() }).strict().refine((v) => Object.keys(v).length > 0) })
};

const notificacao = {
    id: envelope({ params: idParam })
};

module.exports = { usuario, candidato, historico, catalogo, vaga, candidatura, notificacao };

import type { DocumentTemplate } from "./types";

// ─── OPERAÇÃO ───────────────────────────────────────────────────────────────

const termoEntregaVeiculo: DocumentTemplate = {
  id: "termo-entrega-veiculo",
  name: "Termo de Entrega de Veículo",
  category: "Operação",
  description: "Registra a entrega do veículo ao motorista com checklist de itens.",
  icon: "drive_eta",
  body: `TERMO DE ENTREGA DE VEÍCULO

LOCADORA: {{company_name}}
CNPJ: {{company_cnpj}}
Endereço: {{company_address}}

LOCATÁRIO

Nome: {{driver_name}}
CPF: {{driver_cpf}}
CNH: {{driver_cnh}} — Categoria: {{driver_cnh_category}}
CONDUTAX: {{driver_condutax}}

VEÍCULO

Marca/Modelo: {{vehicle_model}}
Placa: {{vehicle_plate}}
Prefixo/Frota: {{vehicle_prefix}}
Alvará Municipal: {{vehicle_permit}}
Número do Taxímetro: {{taximeter_number}}

QUILOMETRAGEM DE ENTREGA: {{vehicle_mileage}} KM

O LOCATÁRIO declara receber o veículo em perfeitas condições de funcionamento e conservação, tendo realizado vistoria presencial no ato da entrega.

ITENS ENTREGUES

☒ Chave principal
☒ Chave reserva
☒ CRLV (Certificado de Registro e Licenciamento de Veículo)
☒ Alvará Municipal de Táxi
☒ Certificado do Taxímetro
☒ Estepe
☒ Macaco
☒ Chave de roda
☒ Triângulo de sinalização
☒ Máquina de cartão
☒ Sistema de rastreamento ativo
☒ QR Code de identificação interna

O LOCATÁRIO declara que acompanhou a vistoria de entrega e concorda com o registro fotográfico e checklist eletrônico anexados ao sistema FleetOS, reconhecendo-os como prova válida das condições do veículo no ato da entrega.

{{company_address}}, {{contract_date}}

_________________________________        _________________________________
LOCADORA — {{company_name}}              LOCATÁRIO — {{driver_name}}`,
};

const termoDevolucaoVeiculo: DocumentTemplate = {
  id: "termo-devolucao-veiculo",
  name: "Termo de Devolução de Veículo",
  category: "Operação",
  description: "Registra a devolução do veículo com conferência de KM, combustível e itens.",
  icon: "directions_car",
  extraFields: [
    { key: "return_mileage", label: "KM de Devolução", type: "number", placeholder: "Ex: 54200", required: true },
    { key: "fuel_level", label: "Nível de Combustível", type: "select", options: ["Reserva", "1/4", "1/2", "3/4", "Cheio"], required: true },
    { key: "damage_description", label: "Avarias Identificadas", type: "textarea", placeholder: "Descreva as avarias ou escreva 'Nenhuma avaria identificada'" },
    { key: "return_notes", label: "Observações Gerais", type: "textarea", placeholder: "Observações adicionais sobre a devolução" },
  ],
  body: `TERMO DE DEVOLUÇÃO DE VEÍCULO

LOCADORA: {{company_name}}
CNPJ: {{company_cnpj}}

LOCATÁRIO

Nome: {{driver_name}}
CPF: {{driver_cpf}}
CNH: {{driver_cnh}}

VEÍCULO

Marca/Modelo: {{vehicle_model}}
Placa: {{vehicle_plate}}
Prefixo/Frota: {{vehicle_prefix}}

QUILOMETRAGEM DE ENTREGA: {{vehicle_mileage}} KM
QUILOMETRAGEM DE DEVOLUÇÃO: {{return_mileage}} KM
KM PERCORRIDOS: {{km_rodados}} KM

COMBUSTÍVEL NA DEVOLUÇÃO: {{fuel_level}}

ITENS CONFERIDOS

☐ Chave principal
☐ Chave reserva
☐ CRLV
☐ Alvará Municipal
☐ Certificado do Taxímetro
☐ Estepe
☐ Macaco
☐ Chave de roda
☐ Triângulo de sinalização
☐ Máquina de cartão

AVARIAS IDENTIFICADAS

{{damage_description}}

OBSERVAÇÕES GERAIS

{{return_notes}}

Após conferência presencial, as partes declaram encerrada a posse do veículo descrito acima, estando os itens listados devidamente restituídos à LOCADORA.

{{company_address}}, {{contract_date}}

_________________________________        _________________________________
LOCADORA — {{company_name}}              LOCATÁRIO — {{driver_name}}`,
};

const termoTransferenciaPossé: DocumentTemplate = {
  id: "termo-transferencia-posse",
  name: "Termo de Transferência de Posse",
  category: "Operação",
  description: "Formaliza a transferência de posse do veículo entre motoristas.",
  icon: "swap_horiz",
  extraFields: [
    { key: "new_driver_name", label: "Nome do Novo Motorista", type: "text", required: true },
    { key: "new_driver_cpf", label: "CPF do Novo Motorista", type: "text", required: true },
    { key: "transfer_reason", label: "Motivo da Transferência", type: "textarea", required: true },
    { key: "transfer_mileage", label: "KM na Transferência", type: "number", required: true },
  ],
  body: `TERMO DE TRANSFERÊNCIA DE POSSE DE VEÍCULO

LOCADORA: {{company_name}}
CNPJ: {{company_cnpj}}

CEDENTE (Motorista Atual)

Nome: {{driver_name}}
CPF: {{driver_cpf}}
CNH: {{driver_cnh}}

CESSIONÁRIO (Novo Motorista)

Nome: {{new_driver_name}}
CPF: {{new_driver_cpf}}

VEÍCULO

Marca/Modelo: {{vehicle_model}}
Placa: {{vehicle_plate}}
Prefixo/Frota: {{vehicle_prefix}}
KM na Transferência: {{transfer_mileage}} KM

MOTIVO DA TRANSFERÊNCIA

{{transfer_reason}}

As partes declaram que a transferência de posse do veículo acima identificado foi realizada com ciência e concordância de todos os envolvidos, comprometendo-se o CESSIONÁRIO a zelar pelo veículo e cumprir todas as obrigações previstas no contrato de locação vigente.

{{company_address}}, {{contract_date}}

_________________________________
LOCADORA — {{company_name}}

_________________________________
CEDENTE — {{driver_name}}

_________________________________
CESSIONÁRIO — {{new_driver_name}}`,
};

const termoRecebimentoChaves: DocumentTemplate = {
  id: "termo-recebimento-chaves",
  name: "Termo de Recebimento de Chaves",
  category: "Operação",
  description: "Comprova a devolução das chaves do veículo.",
  icon: "key",
  extraFields: [
    { key: "keys_returned", label: "Chaves Devolvidas", type: "select", options: ["Chave principal apenas", "Chave reserva apenas", "Ambas as chaves"], required: true },
    { key: "return_condition", label: "Condição das Chaves", type: "select", options: ["Perfeito estado", "Com desgaste normal", "Danificada"], required: true },
  ],
  body: `TERMO DE RECEBIMENTO DE CHAVES

LOCADORA: {{company_name}}
CNPJ: {{company_cnpj}}

MOTORISTA

Nome: {{driver_name}}
CPF: {{driver_cpf}}

VEÍCULO

Marca/Modelo: {{vehicle_model}}
Placa: {{vehicle_plate}}
Prefixo/Frota: {{vehicle_prefix}}

CHAVES DEVOLVIDAS: {{keys_returned}}
CONDIÇÃO: {{return_condition}}

Declaro, para os devidos fins, que recebi as chaves do veículo acima identificado nas condições descritas.

{{company_address}}, {{contract_date}}

_________________________________        _________________________________
LOCADORA — {{company_name}}              MOTORISTA — {{driver_name}}`,
};

const termoRecebimentoDocumentos: DocumentTemplate = {
  id: "termo-recebimento-documentos",
  name: "Termo de Recebimento de Documentos",
  category: "Operação",
  description: "Comprova a entrega/devolução dos documentos do veículo.",
  icon: "folder_open",
  extraFields: [
    { key: "doc_action", label: "Ação", type: "select", options: ["Entrega ao Motorista", "Devolução à Locadora"], required: true },
  ],
  body: `TERMO DE RECEBIMENTO DE DOCUMENTOS

LOCADORA: {{company_name}}
CNPJ: {{company_cnpj}}

MOTORISTA

Nome: {{driver_name}}
CPF: {{driver_cpf}}

VEÍCULO

Marca/Modelo: {{vehicle_model}}
Placa: {{vehicle_plate}}

AÇÃO: {{doc_action}}

DOCUMENTOS

☐ CRLV (Certificado de Registro e Licenciamento de Veículo)
☐ Alvará Municipal de Exploração de Táxi
☐ Certificado de Aferição do Taxímetro
☐ Certificado de Instalação de GNV (se aplicável)
☐ Apólice de Seguro (se aplicável)

Declaro ter recebido/devolvido os documentos acima relacionados, em bom estado de conservação.

{{company_address}}, {{contract_date}}

_________________________________        _________________________________
LOCADORA — {{company_name}}              MOTORISTA — {{driver_name}}`,
};

const aditivoContratual: DocumentTemplate = {
  id: "aditivo-contratual",
  name: "Aditivo Contratual",
  category: "Operação",
  description: "Formaliza alterações nas condições do contrato de locação.",
  icon: "edit_document",
  extraFields: [
    { key: "addendum_type", label: "Tipo de Aditivo", type: "select", options: ["Prorrogação de Prazo", "Alteração de Valor", "Alteração de Veículo", "Outras Condições"], required: true },
    { key: "addendum_description", label: "Descrição das Alterações", type: "textarea", required: true },
    { key: "new_end_date", label: "Nova Data de Vigência (se aplicável)", type: "date" },
    { key: "new_daily_rate", label: "Novo Valor da Diária (se aplicável)", type: "number", placeholder: "Ex: 85.00" },
  ],
  body: `ADITIVO AO CONTRATO DE LOCAÇÃO DE VEÍCULO

ADITIVO Nº: {{contract_number}}-A

LOCADORA: {{company_name}}
CNPJ: {{company_cnpj}}

LOCATÁRIO: {{driver_name}}
CPF: {{driver_cpf}}

VEÍCULO

Marca/Modelo: {{vehicle_model}}
Placa: {{vehicle_plate}}

TIPO DE ADITIVO: {{addendum_type}}

CLÁUSULA ÚNICA – DAS ALTERAÇÕES

{{addendum_description}}

Nova data de vigência: {{new_end_date}}
Novo valor da diária: R$ {{new_daily_rate}}

As demais cláusulas do contrato original permanecem inalteradas.

{{company_address}}, {{contract_date}}

_________________________________        _________________________________
LOCADORA — {{company_name}}              LOCATÁRIO — {{driver_name}}`,
};

// ─── FINANCEIRO ─────────────────────────────────────────────────────────────

const reciboCaucao: DocumentTemplate = {
  id: "recibo-caucao",
  name: "Recibo de Caução",
  category: "Financeiro",
  description: "Comprova o recebimento de valor a título de caução/garantia.",
  icon: "savings",
  extraFields: [
    { key: "caucao_amount", label: "Valor da Caução (R$)", type: "number", required: true },
    { key: "caucao_method", label: "Forma de Pagamento", type: "select", options: ["Dinheiro", "PIX", "Transferência", "Cheque"], required: true },
    { key: "caucao_reason", label: "Motivo/Finalidade", type: "text", placeholder: "Ex: Garantia do contrato de locação", required: true },
  ],
  body: `RECIBO DE CAUÇÃO

LOCADORA: {{company_name}}
CNPJ: {{company_cnpj}}

MOTORISTA

Nome: {{driver_name}}
CPF: {{driver_cpf}}

VEÍCULO

Marca/Modelo: {{vehicle_model}}
Placa: {{vehicle_plate}}

Recebi de {{driver_name}}, portador do CPF {{driver_cpf}}, a importância de:

R$ {{caucao_amount}}
({{caucao_amount_extenso}})

Forma de pagamento: {{caucao_method}}
Finalidade: {{caucao_reason}}

O valor da caução será restituído ao LOCATÁRIO quando da devolução do veículo em perfeitas condições, sem pendências financeiras ou danos, conforme previsto no contrato de locação.

{{company_address}}, {{contract_date}}

_________________________________        _________________________________
LOCADORA — {{company_name}}              MOTORISTA — {{driver_name}}`,
};

const notaPromissoria: DocumentTemplate = {
  id: "nota-promissoria",
  name: "Nota Promissória",
  category: "Financeiro",
  description: "Documento de crédito para formalizar dívida com prazo de pagamento.",
  icon: "receipt_long",
  extraFields: [
    { key: "promissory_number", label: "Número da Promissória", type: "text", required: true },
    { key: "promissory_amount", label: "Valor (R$)", type: "number", required: true },
    { key: "due_date", label: "Data de Vencimento", type: "date", required: true },
    { key: "promissory_reason", label: "Origem da Dívida", type: "text", placeholder: "Ex: Sinistro em 10/05/2025", required: true },
  ],
  body: `NOTA PROMISSÓRIA

Nº {{promissory_number}}

No dia {{due_date}} pagarei por esta NOTA PROMISSÓRIA a {{company_name}}, inscrita no CNPJ {{company_cnpj}}, a importância de:

R$ {{promissory_amount}}
({{promissory_amount_extenso}})

EMITENTE

Nome: {{driver_name}}
CPF: {{driver_cpf}}
RG: {{driver_rg}}
Endereço: {{driver_address}}

ORIGEM DA DÍVIDA: {{promissory_reason}}

Concordo com os termos desta nota promissória e declaro-me ciente de que o não pagamento na data de vencimento ensejará as medidas legais cabíveis.

{{company_address}}, {{contract_date}}

_________________________________
EMITENTE — {{driver_name}}
CPF: {{driver_cpf}}`,
};

const confissaoDivida: DocumentTemplate = {
  id: "confissao-divida",
  name: "Confissão de Dívida",
  category: "Financeiro",
  description: "Formaliza o reconhecimento de dívida pelo motorista.",
  icon: "gavel",
  extraFields: [
    { key: "debt_amount", label: "Valor Total da Dívida (R$)", type: "number", required: true },
    { key: "debt_origin", label: "Origem da Dívida", type: "textarea", required: true },
    { key: "payment_deadline", label: "Prazo para Pagamento", type: "date", required: true },
  ],
  body: `CONFISSÃO DE DÍVIDA

CREDOR: {{company_name}}
CNPJ: {{company_cnpj}}

DEVEDOR

Nome: {{driver_name}}
CPF: {{driver_cpf}}
RG: {{driver_rg}}
Endereço: {{driver_address}}

VEÍCULO

Placa: {{vehicle_plate}} — Modelo: {{vehicle_model}}

CLÁUSULA 1 – DO RECONHECIMENTO

Eu, {{driver_name}}, portador do CPF {{driver_cpf}}, reconheço e confesso que devo à {{company_name}} a importância de:

R$ {{debt_amount}}
({{debt_amount_extenso}})

CLÁUSULA 2 – DA ORIGEM

{{debt_origin}}

CLÁUSULA 3 – DO PAGAMENTO

O valor total será pago até {{payment_deadline}}.

CLÁUSULA 4 – DOS EFEITOS

O não pagamento no prazo estabelecido implicará em imediata exigibilidade do valor integral, acrescido de juros de mora de 1% ao mês e multa de 2% sobre o valor devido.

{{company_address}}, {{contract_date}}

_________________________________        _________________________________
CREDOR — {{company_name}}                DEVEDOR — {{driver_name}}

TESTEMUNHA 1: ___________________ CPF: _______________
TESTEMUNHA 2: ___________________ CPF: _______________`,
};

const termoParcelamento: DocumentTemplate = {
  id: "termo-parcelamento",
  name: "Termo de Parcelamento",
  category: "Financeiro",
  description: "Formaliza o parcelamento de débito em aberto.",
  icon: "calendar_month",
  extraFields: [
    { key: "total_debt", label: "Valor Total a Parcelar (R$)", type: "number", required: true },
    { key: "installment_count", label: "Número de Parcelas", type: "number", required: true },
    { key: "installment_value", label: "Valor de Cada Parcela (R$)", type: "number", required: true },
    { key: "first_due_date", label: "Data do 1º Vencimento", type: "date", required: true },
    { key: "debt_origin", label: "Origem do Débito", type: "textarea", required: true },
  ],
  body: `TERMO DE PARCELAMENTO DE DÉBITO

CREDOR: {{company_name}}
CNPJ: {{company_cnpj}}

DEVEDOR

Nome: {{driver_name}}
CPF: {{driver_cpf}}

VEÍCULO

Placa: {{vehicle_plate}} — Modelo: {{vehicle_model}}

CLÁUSULA 1 – DO DÉBITO

As partes reconhecem que o DEVEDOR possui saldo devedor de R$ {{total_debt}} junto ao CREDOR, originado de:

{{debt_origin}}

CLÁUSULA 2 – DO PARCELAMENTO

O CREDOR, em caráter excepcional, aceita o parcelamento do débito nas seguintes condições:

Total a pagar: R$ {{total_debt}}
Número de parcelas: {{installment_count}}
Valor de cada parcela: R$ {{installment_value}}
Vencimento da 1ª parcela: {{first_due_date}}
Periodicidade: Mensal

CLÁUSULA 3 – DA INADIMPLÊNCIA

O atraso em qualquer parcela por mais de 5 dias corridos tornará o saldo imediatamente exigível em sua totalidade.

{{company_address}}, {{contract_date}}

_________________________________        _________________________________
CREDOR — {{company_name}}                DEVEDOR — {{driver_name}}`,
};

const termoReconhecimentoDebito: DocumentTemplate = {
  id: "termo-reconhecimento-debito",
  name: "Termo de Reconhecimento de Débito",
  category: "Financeiro",
  description: "Reconhecimento formal de débito pelo motorista.",
  icon: "fact_check",
  extraFields: [
    { key: "debit_amount", label: "Valor do Débito (R$)", type: "number", required: true },
    { key: "debit_description", label: "Descrição do Débito", type: "textarea", required: true },
  ],
  body: `TERMO DE RECONHECIMENTO DE DÉBITO

CREDOR: {{company_name}}

DEVEDOR: {{driver_name}}
CPF: {{driver_cpf}}

Pelo presente instrumento, eu, {{driver_name}}, portador do CPF {{driver_cpf}}, reconheço expressamente o débito de R$ {{debit_amount}} junto à {{company_name}}, referente a:

{{debit_description}}

Declaro estar ciente do valor e me comprometo a regularizar a pendência conforme acordado com a LOCADORA.

{{company_address}}, {{contract_date}}

_________________________________
{{driver_name}} — CPF: {{driver_cpf}}`,
};

const demonstrativoContaCorrente: DocumentTemplate = {
  id: "demonstrativo-conta-corrente",
  name: "Demonstrativo de Conta Corrente",
  category: "Financeiro",
  description: "Demonstrativo do saldo e movimentações da conta corrente do motorista.",
  icon: "account_balance",
  extraFields: [
    { key: "statement_period", label: "Período do Demonstrativo", type: "text", placeholder: "Ex: Janeiro/2025", required: true },
    { key: "opening_balance", label: "Saldo Inicial (R$)", type: "number", required: true },
    { key: "total_credits", label: "Total de Créditos (R$)", type: "number", required: true },
    { key: "total_debits", label: "Total de Débitos (R$)", type: "number", required: true },
    { key: "closing_balance", label: "Saldo Final (R$)", type: "number", required: true },
  ],
  body: `DEMONSTRATIVO DE CONTA CORRENTE

LOCADORA: {{company_name}}
Período: {{statement_period}}

MOTORISTA

Nome: {{driver_name}}
CPF: {{driver_cpf}}

VEÍCULO

Placa: {{vehicle_plate}} — Modelo: {{vehicle_model}}

RESUMO DO PERÍODO

Saldo Inicial:         R$ {{opening_balance}}
(+) Total de Créditos: R$ {{total_credits}}
(-) Total de Débitos:  R$ {{total_debits}}
                       ─────────────────────
Saldo Final:           R$ {{closing_balance}}

O presente demonstrativo foi gerado automaticamente pelo sistema FleetOS e reflete os registros da conta corrente do motorista no período indicado.

{{company_address}}, {{contract_date}}

_________________________________
{{company_name}}`,
};

// ─── SINISTROS ───────────────────────────────────────────────────────────────

const relatorioSinistro: DocumentTemplate = {
  id: "relatorio-sinistro",
  name: "Relatório de Sinistro",
  category: "Sinistros",
  description: "Registra formalmente um sinistro (acidente, furto, roubo, incêndio).",
  icon: "car_crash",
  extraFields: [
    { key: "claim_date", label: "Data do Sinistro", type: "date", required: true },
    { key: "claim_time", label: "Horário (aprox.)", type: "text", placeholder: "Ex: 14:30" },
    { key: "claim_type", label: "Tipo de Sinistro", type: "select", options: ["Colisão", "Furto", "Roubo", "Incêndio", "Alagamento", "Vandalismo", "Outro"], required: true },
    { key: "claim_location", label: "Local do Sinistro", type: "text", required: true },
    { key: "claim_description", label: "Descrição Detalhada", type: "textarea", required: true },
    { key: "bo_number", label: "Número do B.O. (se houver)", type: "text" },
    { key: "damage_estimate", label: "Estimativa de Dano (R$)", type: "number" },
    { key: "third_party_involved", label: "Terceiro Envolvido?", type: "select", options: ["Não", "Sim — dados anexados"] },
  ],
  body: `RELATÓRIO DE SINISTRO

LOCADORA: {{company_name}}
CNPJ: {{company_cnpj}}

MOTORISTA RESPONSÁVEL

Nome: {{driver_name}}
CPF: {{driver_cpf}}
CNH: {{driver_cnh}}
CONDUTAX: {{driver_condutax}}

VEÍCULO

Marca/Modelo: {{vehicle_model}}
Placa: {{vehicle_plate}}
Prefixo/Frota: {{vehicle_prefix}}

DADOS DO SINISTRO

Data: {{claim_date}}
Horário: {{claim_time}}
Tipo: {{claim_type}}
Local: {{claim_location}}
B.O. nº: {{bo_number}}

DESCRIÇÃO DO OCORRIDO

{{claim_description}}

ESTIMATIVA DE DANO: R$ {{damage_estimate}}
TERCEIRO ENVOLVIDO: {{third_party_involved}}

DECLARAÇÃO

O motorista {{driver_name}} declara que as informações prestadas neste relatório são verdadeiras e completas, sob pena de responsabilização civil e criminal em caso de omissão ou falsidade.

{{company_address}}, {{contract_date}}

_________________________________
{{driver_name}} — CPF: {{driver_cpf}}`,
};

const termoResponsabilidadeSinistro: DocumentTemplate = {
  id: "termo-responsabilidade-sinistro",
  name: "Termo de Responsabilidade por Sinistro",
  category: "Sinistros",
  description: "Formaliza a responsabilidade do motorista pelo sinistro.",
  icon: "report",
  extraFields: [
    { key: "claim_date", label: "Data do Sinistro", type: "date", required: true },
    { key: "claim_description", label: "Descrição do Sinistro", type: "textarea", required: true },
    { key: "damage_estimate", label: "Estimativa de Dano (R$)", type: "number" },
    { key: "payment_term", label: "Prazo para Regularização (dias)", type: "number", placeholder: "Ex: 30" },
  ],
  body: `TERMO DE RESPONSABILIDADE POR SINISTRO

LOCADORA: {{company_name}}
CNPJ: {{company_cnpj}}

RESPONSÁVEL

Nome: {{driver_name}}
CPF: {{driver_cpf}}
CNH: {{driver_cnh}}

VEÍCULO

Placa: {{vehicle_plate}} — Modelo: {{vehicle_model}}

DATA DO SINISTRO: {{claim_date}}

DESCRIÇÃO DO SINISTRO

{{claim_description}}

ESTIMATIVA DE DANO: R$ {{damage_estimate}}

DECLARAÇÃO DE RESPONSABILIDADE

Eu, {{driver_name}}, portador do CPF {{driver_cpf}}, declaro-me responsável pelo sinistro descrito acima, ocorrido durante o período de minha posse do veículo de placa {{vehicle_plate}}.

Comprometo-me a regularizar os prejuízos causados à LOCADORA no prazo de {{payment_term}} dias a contar desta data, podendo o valor ser descontado de minha conta corrente ou parcelado mediante acordo com a LOCADORA.

{{company_address}}, {{contract_date}}

_________________________________        _________________________________
LOCADORA — {{company_name}}              RESPONSÁVEL — {{driver_name}}`,
};

const termoAcordoSinistro: DocumentTemplate = {
  id: "termo-acordo-sinistro",
  name: "Termo de Acordo para Pagamento de Sinistro",
  category: "Sinistros",
  description: "Formaliza acordo de pagamento dos danos do sinistro.",
  icon: "handshake",
  extraFields: [
    { key: "claim_date", label: "Data do Sinistro", type: "date", required: true },
    { key: "total_damage", label: "Valor Total do Dano (R$)", type: "number", required: true },
    { key: "entry_amount", label: "Valor de Entrada (R$)", type: "number" },
    { key: "installment_count", label: "Número de Parcelas Restantes", type: "number" },
    { key: "installment_value", label: "Valor de Cada Parcela (R$)", type: "number" },
    { key: "first_due_date", label: "Data do 1º Vencimento", type: "date" },
  ],
  body: `TERMO DE ACORDO PARA PAGAMENTO DE SINISTRO

LOCADORA: {{company_name}}
MOTORISTA: {{driver_name}} — CPF: {{driver_cpf}}

VEÍCULO: {{vehicle_plate}} — {{vehicle_model}}
DATA DO SINISTRO: {{claim_date}}

VALOR TOTAL DO DANO: R$ {{total_damage}}

CONDIÇÕES DE PAGAMENTO

Entrada: R$ {{entry_amount}}
Parcelas: {{installment_count}} x R$ {{installment_value}}
1º Vencimento: {{first_due_date}}

As partes acordam que o pagamento conforme as condições acima estabelecidas quitará integralmente as obrigações decorrentes do sinistro descrito.

O descumprimento do acordo tornará o saldo imediatamente exigível.

{{company_address}}, {{contract_date}}

_________________________________        _________________________________
LOCADORA — {{company_name}}              MOTORISTA — {{driver_name}}`,
};

const relatorioFotograficoAvarias: DocumentTemplate = {
  id: "relatorio-fotografico-avarias",
  name: "Relatório Fotográfico de Avarias",
  category: "Sinistros",
  description: "Registra as avarias identificadas com referência às fotos do sistema.",
  icon: "photo_camera",
  extraFields: [
    { key: "inspection_date", label: "Data da Vistoria", type: "date", required: true },
    { key: "inspector_name", label: "Nome do Vistoriador", type: "text", required: true },
    { key: "damage_list", label: "Lista de Avarias Identificadas", type: "textarea", required: true },
    { key: "total_repair_estimate", label: "Estimativa Total de Reparo (R$)", type: "number" },
  ],
  body: `RELATÓRIO FOTOGRÁFICO DE AVARIAS

LOCADORA: {{company_name}}
Data da Vistoria: {{inspection_date}}
Vistoriador: {{inspector_name}}

VEÍCULO

Marca/Modelo: {{vehicle_model}}
Placa: {{vehicle_plate}}
KM: {{vehicle_mileage}}

MOTORISTA RESPONSÁVEL

Nome: {{driver_name}}
CPF: {{driver_cpf}}

AVARIAS IDENTIFICADAS

{{damage_list}}

ESTIMATIVA TOTAL DE REPARO: R$ {{total_repair_estimate}}

As fotos referentes a este relatório estão arquivadas no sistema FleetOS e fazem parte integrante deste documento para todos os efeitos legais.

{{company_address}}, {{contract_date}}

_________________________________        _________________________________
VISTORIADOR — {{inspector_name}}         MOTORISTA — {{driver_name}}`,
};

// ─── COMPLIANCE ─────────────────────────────────────────────────────────────

const advertencia: DocumentTemplate = {
  id: "advertencia",
  name: "Advertência",
  category: "Compliance",
  description: "Registro formal de advertência ao motorista.",
  icon: "warning",
  extraFields: [
    { key: "warning_reason", label: "Motivo da Advertência", type: "textarea", required: true },
    { key: "warning_number", label: "Nº da Advertência", type: "text", placeholder: "Ex: ADV-001/2025" },
    { key: "corrective_action", label: "Ação Corretiva Exigida", type: "textarea" },
  ],
  body: `ADVERTÊNCIA FORMAL

Nº {{warning_number}}

LOCADORA: {{company_name}}

MOTORISTA ADVERTIDO

Nome: {{driver_name}}
CPF: {{driver_cpf}}
CNH: {{driver_cnh}}
Veículo: {{vehicle_plate}} — {{vehicle_model}}

MOTIVO DA ADVERTÊNCIA

{{warning_reason}}

AÇÃO CORRETIVA EXIGIDA

{{corrective_action}}

O presente documento constitui advertência formal nos termos do contrato de locação vigente. Reincidências poderão acarretar suspensão operacional ou rescisão contratual.

{{company_address}}, {{contract_date}}

Ciente e de acordo:

_________________________________
{{driver_name}} — CPF: {{driver_cpf}}`,
};

const suspensaoOperacional: DocumentTemplate = {
  id: "suspensao-operacional",
  name: "Suspensão Operacional",
  category: "Compliance",
  description: "Notificação formal de suspensão das atividades do motorista.",
  icon: "block",
  extraFields: [
    { key: "suspension_reason", label: "Motivo da Suspensão", type: "textarea", required: true },
    { key: "suspension_start", label: "Início da Suspensão", type: "date", required: true },
    { key: "suspension_end", label: "Término Previsto", type: "date" },
    { key: "vehicle_return_required", label: "Exige Devolução do Veículo?", type: "select", options: ["Sim", "Não — veículo permanece com o motorista"] },
  ],
  body: `NOTIFICAÇÃO DE SUSPENSÃO OPERACIONAL

LOCADORA: {{company_name}}
CNPJ: {{company_cnpj}}

MOTORISTA

Nome: {{driver_name}}
CPF: {{driver_cpf}}
Veículo: {{vehicle_plate}} — {{vehicle_model}}

Comunicamos a V.Sa. que, a partir de {{suspension_start}}, sua operação junto à {{company_name}} fica SUSPENSA pelos motivos abaixo:

MOTIVO

{{suspension_reason}}

TÉRMINO PREVISTO: {{suspension_end}}
DEVOLUÇÃO DO VEÍCULO: {{vehicle_return_required}}

A suspensão poderá ser revertida mediante regularização das pendências junto à LOCADORA.

{{company_address}}, {{contract_date}}

_________________________________
{{company_name}}`,
};

const termoBloqueioOperacional: DocumentTemplate = {
  id: "termo-bloqueio-operacional",
  name: "Termo de Bloqueio Operacional",
  category: "Compliance",
  description: "Documenta o bloqueio operacional e suas condições de desbloqueio.",
  icon: "lock",
  extraFields: [
    { key: "block_reason", label: "Motivo do Bloqueio", type: "textarea", required: true },
    { key: "block_conditions", label: "Condições para Desbloqueio", type: "textarea", required: true },
  ],
  body: `TERMO DE BLOQUEIO OPERACIONAL

LOCADORA: {{company_name}}

MOTORISTA

Nome: {{driver_name}}
CPF: {{driver_cpf}}
Veículo: {{vehicle_plate}}

Por meio deste, informamos que o motorista acima identificado encontra-se com operação BLOQUEADA no sistema FleetOS.

MOTIVO DO BLOQUEIO

{{block_reason}}

CONDIÇÕES PARA DESBLOQUEIO

{{block_conditions}}

O desbloqueio somente será efetivado após o cumprimento integral das condições acima, mediante análise e aprovação da LOCADORA.

{{company_address}}, {{contract_date}}

_________________________________
{{company_name}}`,
};

const declaracaoRegularidade: DocumentTemplate = {
  id: "declaracao-regularidade",
  name: "Declaração de Regularidade",
  category: "Compliance",
  description: "Atesta que o motorista está em situação regular com a locadora.",
  icon: "verified",
  body: `DECLARAÇÃO DE REGULARIDADE

LOCADORA: {{company_name}}
CNPJ: {{company_cnpj}}

Declaramos, para os fins que se fizerem necessários, que o motorista abaixo identificado encontra-se em situação REGULAR junto à nossa empresa na data desta declaração.

MOTORISTA

Nome: {{driver_name}}
CPF: {{driver_cpf}}
CNH: {{driver_cnh}} — Válida até: {{driver_cnh_expiration}}
CONDUTAX: {{driver_condutax}} — Válido até: {{driver_condutax_expiration}}

VEÍCULO VINCULADO

Placa: {{vehicle_plate}} — {{vehicle_model}}
Alvará: {{vehicle_permit}}

STATUS: REGULAR — sem pendências financeiras, documentais ou disciplinares.

Declaração emitida em {{contract_date}}, válida por 30 (trinta) dias da data de emissão.

{{company_address}}, {{contract_date}}

_________________________________
{{company_name}}
CNPJ: {{company_cnpj}}`,
};

// ─── PATRIMÔNIO ─────────────────────────────────────────────────────────────

const termoItemPerdido: DocumentTemplate = {
  id: "termo-item-perdido",
  name: "Termo de Item Perdido",
  category: "Patrimônio",
  description: "Registra a perda de um item pertencente à locadora.",
  icon: "search_off",
  extraFields: [
    { key: "lost_item", label: "Item Perdido", type: "text", required: true },
    { key: "loss_date", label: "Data da Perda/Constatação", type: "date", required: true },
    { key: "loss_description", label: "Circunstâncias da Perda", type: "textarea", required: true },
    { key: "item_value", label: "Valor de Reposição (R$)", type: "number", required: true },
  ],
  body: `TERMO DE ITEM PERDIDO

LOCADORA: {{company_name}}

MOTORISTA RESPONSÁVEL

Nome: {{driver_name}}
CPF: {{driver_cpf}}
Veículo: {{vehicle_plate}} — {{vehicle_model}}

ITEM PERDIDO: {{lost_item}}
DATA DA CONSTATAÇÃO: {{loss_date}}
VALOR DE REPOSIÇÃO: R$ {{item_value}}

CIRCUNSTÂNCIAS

{{loss_description}}

Eu, {{driver_name}}, portador do CPF {{driver_cpf}}, declaro ciência da perda do item acima descrito durante o período de minha responsabilidade sobre o veículo e comprometo-me a realizar a reposição no valor de R$ {{item_value}}, que poderá ser descontado de minha conta corrente.

{{company_address}}, {{contract_date}}

_________________________________        _________________________________
LOCADORA — {{company_name}}              MOTORISTA — {{driver_name}}`,
};

const termoExtravioEquipamento: DocumentTemplate = {
  id: "termo-extravio-equipamento",
  name: "Termo de Extravio de Equipamento",
  category: "Patrimônio",
  description: "Registra o extravio de equipamento instalado no veículo.",
  icon: "device_unknown",
  extraFields: [
    { key: "equipment_name", label: "Equipamento Extraviado", type: "text", required: true },
    { key: "equipment_serial", label: "Número de Série/ID", type: "text" },
    { key: "loss_date", label: "Data do Extravio/Constatação", type: "date", required: true },
    { key: "equipment_value", label: "Valor do Equipamento (R$)", type: "number", required: true },
    { key: "loss_circumstances", label: "Circunstâncias do Extravio", type: "textarea", required: true },
  ],
  body: `TERMO DE EXTRAVIO DE EQUIPAMENTO

LOCADORA: {{company_name}}
CNPJ: {{company_cnpj}}

MOTORISTA RESPONSÁVEL

Nome: {{driver_name}}
CPF: {{driver_cpf}}
Veículo: {{vehicle_plate}} — {{vehicle_model}}

EQUIPAMENTO EXTRAVIADO

Descrição: {{equipment_name}}
Número de Série/ID: {{equipment_serial}}
Valor: R$ {{equipment_value}}

DATA DO EXTRAVIO: {{loss_date}}

CIRCUNSTÂNCIAS

{{loss_circumstances}}

Declaro ciência do extravio e responsabilidade pela reposição ou ressarcimento do equipamento no valor indicado.

{{company_address}}, {{contract_date}}

_________________________________
{{driver_name}} — CPF: {{driver_cpf}}`,
};

const relatorioAvarias: DocumentTemplate = {
  id: "relatorio-avarias",
  name: "Relatório de Avarias",
  category: "Patrimônio",
  description: "Registro detalhado de avarias identificadas no veículo.",
  icon: "car_repair",
  extraFields: [
    { key: "inspection_date", label: "Data da Vistoria", type: "date", required: true },
    { key: "front_condition", label: "Dianteira", type: "text", placeholder: "Ex: Sem avarias / Amassado / Riscado" },
    { key: "rear_condition", label: "Traseira", type: "text", placeholder: "Ex: Sem avarias / Amassado / Riscado" },
    { key: "left_condition", label: "Lateral Esquerda", type: "text" },
    { key: "right_condition", label: "Lateral Direita", type: "text" },
    { key: "interior_condition", label: "Interior", type: "text" },
    { key: "mechanical_condition", label: "Mecânica", type: "text" },
    { key: "total_repair_cost", label: "Custo Total Estimado (R$)", type: "number" },
  ],
  body: `RELATÓRIO DE AVARIAS

LOCADORA: {{company_name}}
Data da Vistoria: {{inspection_date}}

VEÍCULO

Placa: {{vehicle_plate}} — Modelo: {{vehicle_model}}
KM: {{vehicle_mileage}}

MOTORISTA

Nome: {{driver_name}}
CPF: {{driver_cpf}}

CONDIÇÕES DO VEÍCULO

Dianteira:        {{front_condition}}
Traseira:         {{rear_condition}}
Lateral Esquerda: {{left_condition}}
Lateral Direita:  {{right_condition}}
Interior:         {{interior_condition}}
Mecânica:         {{mechanical_condition}}

CUSTO ESTIMADO DE REPARO: R$ {{total_repair_cost}}

Vistoria realizada com registro fotográfico no sistema FleetOS.

{{company_address}}, {{contract_date}}

_________________________________        _________________________________
VISTORIADOR                              MOTORISTA — {{driver_name}}`,
};

const inventarioEquipamentos: DocumentTemplate = {
  id: "inventario-equipamentos",
  name: "Inventário de Equipamentos",
  category: "Patrimônio",
  description: "Inventário completo dos equipamentos vinculados ao veículo.",
  icon: "inventory",
  body: `INVENTÁRIO DE EQUIPAMENTOS

LOCADORA: {{company_name}}
Data: {{contract_date}}

VEÍCULO

Placa: {{vehicle_plate}} — Modelo: {{vehicle_model}}
Prefixo/Frota: {{vehicle_prefix}}

MOTORISTA RESPONSÁVEL

Nome: {{driver_name}}
CPF: {{driver_cpf}}

EQUIPAMENTOS VINCULADOS

| Nº | Equipamento              | Status        | Observação |
|----|--------------------------|---------------|------------|
| 01 | Taxímetro                | ☐ OK ☐ Falta  |            |
| 02 | Máquina de Cartão        | ☐ OK ☐ Falta  |            |
| 03 | Sistema de Rastreamento  | ☐ OK ☐ Falta  |            |
| 04 | Rádio / Comunicador      | ☐ OK ☐ Falta  |            |
| 05 | QR Code de Identificação | ☐ OK ☐ Falta  |            |
| 06 | Extintor                 | ☐ OK ☐ Falta  |            |
| 07 | Triângulo                | ☐ OK ☐ Falta  |            |
| 08 | Estepe                   | ☐ OK ☐ Falta  |            |
| 09 | Macaco                   | ☐ OK ☐ Falta  |            |
| 10 | Chave de Roda            | ☐ OK ☐ Falta  |            |

Taxímetro nº: {{taximeter_number}} — Marca: {{taximeter_brand}}
Última Aferição: {{taximeter_calibration}}

{{company_address}}, {{contract_date}}

_________________________________        _________________________________
RESPONSÁVEL PELO INVENTÁRIO              MOTORISTA — {{driver_name}}`,
};

// ─── ENCERRAMENTO ────────────────────────────────────────────────────────────

const distrato: DocumentTemplate = {
  id: "distrato",
  name: "Distrato e Encerramento Contratual",
  category: "Encerramento",
  description: "Encerramento formal do contrato de locação por mútuo acordo.",
  icon: "cancel",
  extraFields: [
    { key: "end_reason", label: "Motivo do Encerramento", type: "textarea", required: true },
    { key: "driver_balance", label: "Saldo da Conta Corrente (R$)", type: "number", required: true },
    { key: "pending_items", label: "Pendências Ressalvadas (ou 'Nenhuma')", type: "textarea", required: true },
    { key: "contract_end_date", label: "Data de Encerramento", type: "date", required: true },
  ],
  body: `DISTRATO E ENCERRAMENTO CONTRATUAL

LOCADORA: {{company_name}}
CNPJ: {{company_cnpj}}
Endereço: {{company_address}}

LOCATÁRIO: {{driver_name}}
CPF: {{driver_cpf}}

CONTRATO: {{contract_number}}
VEÍCULO: {{vehicle_plate}} — {{vehicle_model}}

Data de início: {{contract_start_date}}
Data de encerramento: {{contract_end_date}}

MOTIVO DO ENCERRAMENTO

{{end_reason}}

SALDO FINANCEIRO

Saldo da Conta Corrente: R$ {{driver_balance}}

PENDÊNCIAS RESSALVADAS

{{pending_items}}

DECLARAÇÕES

O LOCATÁRIO declara ter devolvido o veículo e todos os equipamentos vinculados, ficando quitadas as obrigações decorrentes do contrato, ressalvadas as pendências expressamente descritas acima.

A LOCADORA declara ter realizado a vistoria de devolução e recebido o veículo nas condições acordadas.

As partes concedem plena, geral e irrevogável quitação das obrigações decorrentes deste contrato, ressalvadas as pendências acima.

{{company_address}}, {{contract_date}}

_________________________________        _________________________________
LOCADORA — {{company_name}}              LOCATÁRIO — {{driver_name}}

TESTEMUNHA 1: ___________________ CPF: _______________
TESTEMUNHA 2: ___________________ CPF: _______________`,
};

const declaracaoNadaConsta: DocumentTemplate = {
  id: "declaracao-nada-consta",
  name: "Declaração de Nada Consta / Termo de Quitação",
  category: "Encerramento",
  description: "Declara que o motorista não possui pendências com a locadora.",
  icon: "task_alt",
  body: `DECLARAÇÃO DE NADA CONSTA / TERMO DE QUITAÇÃO

LOCADORA: {{company_name}}
CNPJ: {{company_cnpj}}

Declaramos, para os fins que se fizerem necessários, que o ex-motorista abaixo identificado NÃO POSSUI PENDÊNCIAS junto a esta empresa na data desta declaração, tendo quitado todas as suas obrigações financeiras, devolvido o veículo e os equipamentos a ele confiados.

MOTORISTA

Nome: {{driver_name}}
CPF: {{driver_cpf}}

CONTRATO ENCERRADO

Veículo: {{vehicle_plate}} — {{vehicle_model}}
Vigência: {{contract_start_date}} a {{contract_end_date}}

Nada mais havendo a reclamar, seja a que título for, a {{company_name}} concede ao ex-motorista plena e irrevogável quitação de todas as obrigações decorrentes do contrato de locação acima identificado.

{{company_address}}, {{contract_date}}

_________________________________
{{company_name}}
CNPJ: {{company_cnpj}}`,
};

// ─── EXPORT ──────────────────────────────────────────────────────────────────

export const DOCUMENT_TEMPLATES: DocumentTemplate[] = [
  // Operação
  termoEntregaVeiculo,
  termoDevolucaoVeiculo,
  termoTransferenciaPossé,
  termoRecebimentoChaves,
  termoRecebimentoDocumentos,
  aditivoContratual,
  // Financeiro
  reciboCaucao,
  notaPromissoria,
  confissaoDivida,
  termoParcelamento,
  termoReconhecimentoDebito,
  demonstrativoContaCorrente,
  // Sinistros
  relatorioSinistro,
  termoResponsabilidadeSinistro,
  termoAcordoSinistro,
  relatorioFotograficoAvarias,
  // Compliance
  advertencia,
  suspensaoOperacional,
  termoBloqueioOperacional,
  declaracaoRegularidade,
  // Patrimônio
  termoItemPerdido,
  termoExtravioEquipamento,
  relatorioAvarias,
  inventarioEquipamentos,
  // Encerramento
  distrato,
  declaracaoNadaConsta,
];

export const CATEGORY_META: Record<string, { color: string; bg: string; border: string; icon: string }> = {
  "Operação":    { color: "text-blue-700",   bg: "bg-blue-50",   border: "border-blue-200",   icon: "drive_eta" },
  "Financeiro":  { color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", icon: "payments" },
  "Sinistros":   { color: "text-red-700",     bg: "bg-red-50",     border: "border-red-200",     icon: "car_crash" },
  "Compliance":  { color: "text-amber-700",   bg: "bg-amber-50",   border: "border-amber-200",   icon: "policy" },
  "Patrimônio":  { color: "text-purple-700",  bg: "bg-purple-50",  border: "border-purple-200",  icon: "inventory_2" },
  "Encerramento":{ color: "text-slate-700",   bg: "bg-slate-50",   border: "border-slate-200",   icon: "cancel" },
};

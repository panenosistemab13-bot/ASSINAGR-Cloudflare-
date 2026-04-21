export interface DriverData {
  mes?: string;
  origem?: string;
  dia?: string;
  data?: string;
  contato_whats?: string;
  hora_liberado?: string;
  status?: string;
  modelo_carreta?: string;
  modelo_cavalo?: string;
  fez_contato?: string;
  destino?: string;
  transportador?: string;
  cavalo?: string;
  carreta?: string;
  carreta2?: string;
  motorista?: string;
  cpf?: string;
  rg?: string;
  cnh?: string;
  telefone?: string;
  vigencia_cadastro?: string;
  vinculo?: string;
  uf_placas?: string;
  tipo_carreta?: string;
  tipo_cavalo?: string;
  tecnologia?: string;
  trajeto?: string;
  n_pallets?: string;
  pbt?: string;
  m3?: string;
  categoria?: string;
  codigo_transportadora?: string;
  id_carga?: string;
  estado_motorista?: string;
  estado_cavalo?: string;
  estado_carreta?: string;
  pendencia?: string;
  check_list?: string;
  valido?: string;
  dias?: string;
  mapa_arquivo?: string;
  paradas_proibidas?: string;
  termo_personalizado?: string;
}

export interface Contract {
  id: string;
  data: DriverData;
  signature?: string;
  signed_at?: string;
  created_at: string;
  onbase_status?: boolean;
}

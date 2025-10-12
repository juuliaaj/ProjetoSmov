import { useState } from 'react';
import { FileText, Image, CheckCircle, AlertCircle } from 'lucide-react';
import styles from './OngRegisterPage.module.css';
import Footer from '../components/Footer';
import Header from '../components/Header';
import usePermissions from "../hooks/usePermissions";

// TODO: Importar e configurar cliente Supabase aqui
// import { createClient } from '@supabase/supabase-js';
// const supabase = createClient(
//   import.meta.env.VITE_SUPABASE_URL,
//   import.meta.env.VITE_SUPABASE_ANON_KEY
// );

export default function OngRegisterPage() {

  const [permissions] = usePermissions();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [formData, setFormData] = useState({
    nome_ong: '',
    cnpj: '',
    email: '',
    telefone: '',
    site: '',
    endereco_rua: '',
    endereco_numero: '',
    endereco_complemento: '',
    endereco_bairro: '',
    endereco_cidade: '',
    endereco_estado: '',
    endereco_cep: '',
    descricao: '',
    area_atuacao: '',
    publico_alvo: '',
    responsavel_nome: '',
    responsavel_cpf: '',
    responsavel_email: '',
    responsavel_telefone: '',
    banco: '',
    agencia: '',
    conta: '',
    pix: ''
  });

  const [files, setFiles] = useState({
    logo: null,
    foto_fachada: null,
    doc_cnpj: null,
    doc_estatuto: null,
    doc_ata_eleicao: null,
    doc_comprovante_endereco: null,
    doc_identidade_responsavel: null
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      setFiles(prev => ({ ...prev, [fieldName]: file }));
    }
  };

  // TODO: BACKEND - Função para fazer upload de arquivos
  // Esta função deve fazer o upload dos arquivos para o storage e retornar a URL
  const uploadFile = async (file) => {
    // TODO: Implementar upload usando Supabase Storage
    // const fileExt = file.name.split('.').pop();
    // const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    // const filePath = `${path}/${fileName}`;
    //
    // const { data, error } = await supabase.storage
    //   .from('ong-documents')
    //   .upload(filePath, file);
    //
    // if (error) throw error;
    //
    // const { data: urlData } = supabase.storage
    //   .from('ong-documents')
    //   .getPublicUrl(filePath);
    //
    // return urlData.publicUrl;

    return `temp_url_${file.name}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSubmitStatus(null);

    try {
      // TODO: BACKEND - Upload de todos os arquivos para o storage
      const uploadedUrls = {};

      if (files.logo) {
        uploadedUrls.logo_url = await uploadFile(files.logo, 'logos');
      }
      if (files.foto_fachada) {
        uploadedUrls.foto_fachada_url = await uploadFile(files.foto_fachada, 'fotos');
      }
      if (files.doc_cnpj) {
        uploadedUrls.doc_cnpj_url = await uploadFile(files.doc_cnpj, 'documentos');
      }
      if (files.doc_estatuto) {
        uploadedUrls.doc_estatuto_url = await uploadFile(files.doc_estatuto, 'documentos');
      }
      if (files.doc_ata_eleicao) {
        uploadedUrls.doc_ata_eleicao_url = await uploadFile(files.doc_ata_eleicao, 'documentos');
      }
      if (files.doc_comprovante_endereco) {
        uploadedUrls.doc_comprovante_endereco_url = await uploadFile(files.doc_comprovante_endereco, 'documentos');
      }
      if (files.doc_identidade_responsavel) {
        uploadedUrls.doc_identidade_responsavel_url = await uploadFile(files.doc_identidade_responsavel, 'documentos');
      }

      // TODO: BACKEND - Inserir dados no banco de dados Supabase
      // const { error } = await supabase
      //   .from('ong_cadastros')
      //   .insert([{
      //     ...formData,
      //     ...uploadedUrls
      //   }]);
      //
      // if (error) throw error;

      // Simulação de sucesso (remover quando implementar backend real)
      console.log('Dados do formulário:', formData);
      console.log('URLs dos arquivos:', uploadedUrls);

      setSubmitStatus('success');

      // Limpar formulário após sucesso
      setFormData({
        nome_ong: '',
        cnpj: '',
        email: '',
        telefone: '',
        site: '',
        endereco_rua: '',
        endereco_numero: '',
        endereco_complemento: '',
        endereco_bairro: '',
        endereco_cidade: '',
        endereco_estado: '',
        endereco_cep: '',
        descricao: '',
        area_atuacao: '',
        publico_alvo: '',
        responsavel_nome: '',
        responsavel_cpf: '',
        responsavel_email: '',
        responsavel_telefone: '',
        banco: '',
        agencia: '',
        conta: '',
        pix: ''
      });
      setFiles({
        logo: null,
        foto_fachada: null,
        doc_cnpj: null,
        doc_estatuto: null,
        doc_ata_eleicao: null,
        doc_comprovante_endereco: null,
        doc_identidade_responsavel: null
      });
      setStep(1);
    } catch (error) {
      console.error('Erro ao enviar cadastro:', error);
      setSubmitStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    setStep(prev => Math.min(prev + 1, 4));
  };

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  return (
    <div className={styles.container}>
      <Header isLoggedIn={permissions?.loggedIn} />

      <main className={styles.main}>
        <div className={styles.heroSection}>
          <h1 className={styles.title}>Cadastre sua ONG</h1>
          <p className={styles.subtitle}>
            Faça parte do SMOV e conecte-se com doadores que querem fazer a diferença
          </p>
        </div>

        <div className={styles.formWrapper}>
          <div className={styles.progressBar}>
            <div className={`${styles.progressStep} ${step >= 1 ? styles.active : ''}`}>
              <div className={styles.progressCircle}>1</div>
              <span>Dados da ONG</span>
            </div>
            <div className={styles.progressLine}></div>
            <div className={`${styles.progressStep} ${step >= 2 ? styles.active : ''}`}>
              <div className={styles.progressCircle}>2</div>
              <span>Endereço</span>
            </div>
            <div className={styles.progressLine}></div>
            <div className={`${styles.progressStep} ${step >= 3 ? styles.active : ''}`}>
              <div className={styles.progressCircle}>3</div>
              <span>Responsável</span>
            </div>
            <div className={styles.progressLine}></div>
            <div className={`${styles.progressStep} ${step >= 4 ? styles.active : ''}`}>
              <div className={styles.progressCircle}>4</div>
              <span>Documentos</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            {step === 1 && (
              <div className={styles.formSection}>
                <h2 className={styles.sectionTitle}>Informações da ONG</h2>

                <div className={styles.formGroup}>
                  <label htmlFor="nome_ong">Nome da ONG *</label>
                  <input
                    type="text"
                    id="nome_ong"
                    name="nome_ong"
                    value={formData.nome_ong}
                    onChange={handleInputChange}
                    required
                    placeholder="Digite o nome completo da ONG"
                  />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="cnpj">CNPJ *</label>
                    <input
                      type="text"
                      id="cnpj"
                      name="cnpj"
                      value={formData.cnpj}
                      onChange={handleInputChange}
                      required
                      placeholder="00.000.000/0000-00"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="telefone">Telefone *</label>
                    <input
                      type="tel"
                      id="telefone"
                      name="telefone"
                      value={formData.telefone}
                      onChange={handleInputChange}
                      required
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="email">Email *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="contato@ong.org.br"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="site">Site</label>
                    <input
                      type="url"
                      id="site"
                      name="site"
                      value={formData.site}
                      onChange={handleInputChange}
                      placeholder="https://www.suaong.org.br"
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="area_atuacao">Área de Atuação *</label>
                  <select
                    id="area_atuacao"
                    name="area_atuacao"
                    value={formData.area_atuacao}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Selecione uma área</option>
                    <option value="animais">Proteção Animal</option>
                    <option value="criancas">Crianças e Adolescentes</option>
                    <option value="idosos">Idosos</option>
                    <option value="saude">Saúde</option>
                    <option value="educacao">Educação</option>
                    <option value="meio_ambiente">Meio Ambiente</option>
                    <option value="assistencia_social">Assistência Social</option>
                    <option value="cultura">Cultura</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="publico_alvo">Público-Alvo *</label>
                  <input
                    type="text"
                    id="publico_alvo"
                    name="publico_alvo"
                    value={formData.publico_alvo}
                    onChange={handleInputChange}
                    required
                    placeholder="Ex: Animais abandonados, crianças carentes, etc."
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="descricao">Descrição das Atividades *</label>
                  <textarea
                    id="descricao"
                    name="descricao"
                    value={formData.descricao}
                    onChange={handleInputChange}
                    required
                    rows="5"
                    placeholder="Descreva as atividades e objetivos da sua ONG..."
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className={styles.formSection}>
                <h2 className={styles.sectionTitle}>Endereço da Sede</h2>

                <div className={styles.formRow}>
                  <div className={styles.formGroup} style={{ flex: '3' }}>
                    <label htmlFor="endereco_rua">Rua/Avenida *</label>
                    <input
                      type="text"
                      id="endereco_rua"
                      name="endereco_rua"
                      value={formData.endereco_rua}
                      onChange={handleInputChange}
                      required
                      placeholder="Nome da rua"
                    />
                  </div>

                  <div className={styles.formGroup} style={{ flex: '1' }}>
                    <label htmlFor="endereco_numero">Número *</label>
                    <input
                      type="text"
                      id="endereco_numero"
                      name="endereco_numero"
                      value={formData.endereco_numero}
                      onChange={handleInputChange}
                      required
                      placeholder="123"
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="endereco_complemento">Complemento</label>
                  <input
                    type="text"
                    id="endereco_complemento"
                    name="endereco_complemento"
                    value={formData.endereco_complemento}
                    onChange={handleInputChange}
                    placeholder="Sala, andar, etc."
                  />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="endereco_bairro">Bairro *</label>
                    <input
                      type="text"
                      id="endereco_bairro"
                      name="endereco_bairro"
                      value={formData.endereco_bairro}
                      onChange={handleInputChange}
                      required
                      placeholder="Nome do bairro"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="endereco_cep">CEP *</label>
                    <input
                      type="text"
                      id="endereco_cep"
                      name="endereco_cep"
                      value={formData.endereco_cep}
                      onChange={handleInputChange}
                      required
                      placeholder="00000-000"
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="endereco_cidade">Cidade *</label>
                    <input
                      type="text"
                      id="endereco_cidade"
                      name="endereco_cidade"
                      value={formData.endereco_cidade}
                      onChange={handleInputChange}
                      required
                      placeholder="Nome da cidade"
                    />
                  </div>
                </div>

                <div className={styles.infoBox}>
                  <h3>Informações Bancárias (Opcional)</h3>
                  <p>Estas informações serão exibidas para facilitar doações</p>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="banco">Banco</label>
                    <input
                      type="text"
                      id="banco"
                      name="banco"
                      value={formData.banco}
                      onChange={handleInputChange}
                      placeholder="Nome do banco"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="agencia">Agência</label>
                    <input
                      type="text"
                      id="agencia"
                      name="agencia"
                      value={formData.agencia}
                      onChange={handleInputChange}
                      placeholder="0000"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="conta">Conta</label>
                    <input
                      type="text"
                      id="conta"
                      name="conta"
                      value={formData.conta}
                      onChange={handleInputChange}
                      placeholder="00000-0"
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="pix">Chave PIX</label>
                  <input
                    type="text"
                    id="pix"
                    name="pix"
                    value={formData.pix}
                    onChange={handleInputChange}
                    placeholder="Email, telefone, CPF/CNPJ ou chave aleatória"
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className={styles.formSection}>
                <h2 className={styles.sectionTitle}>Responsável Legal</h2>

                <div className={styles.formGroup}>
                  <label htmlFor="responsavel_nome">Nome Completo *</label>
                  <input
                    type="text"
                    id="responsavel_nome"
                    name="responsavel_nome"
                    value={formData.responsavel_nome}
                    onChange={handleInputChange}
                    required
                    placeholder="Nome completo do responsável"
                  />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="responsavel_cpf">CPF *</label>
                    <input
                      type="text"
                      id="responsavel_cpf"
                      name="responsavel_cpf"
                      value={formData.responsavel_cpf}
                      onChange={handleInputChange}
                      required
                      placeholder="000.000.000-00"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="responsavel_telefone">Telefone *</label>
                    <input
                      type="tel"
                      id="responsavel_telefone"
                      name="responsavel_telefone"
                      value={formData.responsavel_telefone}
                      onChange={handleInputChange}
                      required
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="responsavel_email">Email *</label>
                  <input
                    type="email"
                    id="responsavel_email"
                    name="responsavel_email"
                    value={formData.responsavel_email}
                    onChange={handleInputChange}
                    required
                    placeholder="email@responsavel.com"
                  />
                </div>
              </div>
            )}

            {step === 4 && (
              <div className={styles.formSection}>
                <h2 className={styles.sectionTitle}>Documentos e Imagens</h2>

                <div className={styles.infoBox}>
                  <p>Envie os documentos necessários para validação do cadastro</p>
                </div>

                <div className={styles.fileSection}>
                  <h3>Imagens da ONG</h3>

                  <div className={styles.fileUpload}>
                    <label htmlFor="logo">
                      <Image size={24} />
                      <span>Logo da ONG</span>
                      {files.logo && <span className={styles.fileName}>{files.logo.name}</span>}
                    </label>
                    <input
                      type="file"
                      id="logo"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'logo')}
                    />
                  </div>

                  <div className={styles.fileUpload}>
                    <label htmlFor="foto_fachada">
                      <Image size={24} />
                      <span>Foto da Fachada/Sede</span>
                      {files.foto_fachada && <span className={styles.fileName}>{files.foto_fachada.name}</span>}
                    </label>
                    <input
                      type="file"
                      id="foto_fachada"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'foto_fachada')}
                    />
                  </div>
                </div>

                <div className={styles.fileSection}>
                  <h3>Documentos Obrigatórios</h3>

                  <div className={styles.fileUpload}>
                    <label htmlFor="doc_cnpj" className={styles.required}>
                      <FileText size={24} />
                      <span>Documento do CNPJ *</span>
                      {files.doc_cnpj && <span className={styles.fileName}>{files.doc_cnpj.name}</span>}
                    </label>
                    <input
                      type="file"
                      id="doc_cnpj"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange(e, 'doc_cnpj')}
                      required
                    />
                  </div>

                  <div className={styles.fileUpload}>
                    <label htmlFor="doc_estatuto" className={styles.required}>
                      <FileText size={24} />
                      <span>Estatuto Social *</span>
                      {files.doc_estatuto && <span className={styles.fileName}>{files.doc_estatuto.name}</span>}
                    </label>
                    <input
                      type="file"
                      id="doc_estatuto"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange(e, 'doc_estatuto')}
                      required
                    />
                  </div>

                  <div className={styles.fileUpload}>
                    <label htmlFor="doc_comprovante_endereco" className={styles.required}>
                      <FileText size={24} />
                      <span>Comprovante de Endereço *</span>
                      {files.doc_comprovante_endereco && <span className={styles.fileName}>{files.doc_comprovante_endereco.name}</span>}
                    </label>
                    <input
                      type="file"
                      id="doc_comprovante_endereco"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange(e, 'doc_comprovante_endereco')}
                      required
                    />
                  </div>

                  <div className={styles.fileUpload}>
                    <label htmlFor="doc_identidade_responsavel" className={styles.required}>
                      <FileText size={24} />
                      <span>RG/CNH do Responsável *</span>
                      {files.doc_identidade_responsavel && <span className={styles.fileName}>{files.doc_identidade_responsavel.name}</span>}
                    </label>
                    <input
                      type="file"
                      id="doc_identidade_responsavel"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange(e, 'doc_identidade_responsavel')}
                      required
                    />
                  </div>
                </div>

                <div className={styles.fileSection}>
                  <h3>Documentos Opcionais</h3>

                  <div className={styles.fileUpload}>
                    <label htmlFor="doc_ata_eleicao">
                      <FileText size={24} />
                      <span>Ata de Eleição da Diretoria</span>
                      {files.doc_ata_eleicao && <span className={styles.fileName}>{files.doc_ata_eleicao.name}</span>}
                    </label>
                    <input
                      type="file"
                      id="doc_ata_eleicao"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange(e, 'doc_ata_eleicao')}
                    />
                  </div>
                </div>
              </div>
            )}

            {submitStatus === 'success' && (
              <div className={styles.successMessage}>
                <CheckCircle size={48} />
                <h3>Cadastro Enviado com Sucesso!</h3>
                <p>Seu cadastro foi enviado para análise dos administradores do SMOV.</p>
                <p>Você receberá um email com o resultado da análise em breve.</p>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className={styles.errorMessage}>
                <AlertCircle size={48} />
                <h3>Erro ao Enviar Cadastro</h3>
                <p>Ocorreu um erro ao enviar seu cadastro. Por favor, tente novamente.</p>
              </div>
            )}

            <div className={styles.formActions}>
              {step > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className={styles.btnSecondary}
                  disabled={loading}
                >
                  Voltar
                </button>
              )}

              {step < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className={styles.btnPrimary}
                  disabled={loading}
                >
                  Próximo
                </button>
              ) : (
                <button
                  type="submit"
                  className={styles.btnPrimary}
                  disabled={loading}
                >
                  {loading ? 'Enviando...' : 'Enviar Cadastro'}
                </button>
              )}
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}


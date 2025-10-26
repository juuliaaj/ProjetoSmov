import { useState, useEffect } from 'react';

import styles from './OngRegisterPage.module.css';

import Footer from '../components/Footer';
import Header from '../components/Header';
import { IMaskInput } from "react-imask";
import { FileText, Image, CheckCircle, AlertCircle } from 'lucide-react';

import usePermissions from "../hooks/usePermissions";

import { toast, ToastContainer } from "react-toastify";
import { TOAST_CONFIG } from "../utils/toast";
import fetcher from '../utils/fetcher';
import supabase from '../utils/supabase';

export default function OngRegisterPage() {
  const [permissions] = usePermissions();

  const [categorias, setCategorias] = useState([]);
  const [cidades, setCidades] = useState([]);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    cnpj: '',
    email: '',
    telefone: '',
    site: '',
    endereco: '',
    endereco_numero: '',
    endereco_complemento: '',
    bairro: '',
    id_cidade: '',
    cep: '',
    descricao: '',
    id_categoria: '',
    chave_pix: ''
  });

  const [files, setFiles] = useState({
    logo: null,
    banner: null,
    doc_cnpj: null,
    doc_estatuto: null,
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

  const uploadFile = async (file, pasta) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    const filePath = `${pasta}/${fileName}`;
    
    const { error } = await supabase.storage
      .from('smov')
      .upload(filePath, file);
    
    if (error) throw error;
    
    const { data: urlData } = supabase.storage
      .from('smov')
      .getPublicUrl(filePath);
    
    return urlData.publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSubmitStatus(null);

    try {
      const uploadedUrls = {};

      if (!files.doc_cnpj || !files.doc_estatuto || !files.doc_comprovante_endereco || !files.doc_identidade_responsavel) {
        return;
      }

      if (files.logo) {
        uploadedUrls.logo_url = await uploadFile(files.logo, 'fotos');
      }
      if (files.banner) {
        uploadedUrls.banner_url = await uploadFile(files.banner, 'fotos');
      }

      uploadedUrls.cnpj_url = await uploadFile(files.doc_cnpj, 'documentos');
      uploadedUrls.estatuto_url = await uploadFile(files.doc_estatuto, 'documentos');
      uploadedUrls.endereco_url = await uploadFile(files.doc_comprovante_endereco, 'documentos');
      uploadedUrls.responsavel_url = await uploadFile(files.doc_identidade_responsavel, 'documentos');

      const result = await fetcher.post('/instituicoes', {
        ...formData,
        ...uploadedUrls
      })

      if (result.error) {
        throw result.error;
      }

      setSubmitStatus('success');

      setTimeout(() => {
        window.location.href = '/';
      }, 5000);
    } catch (error) {
      console.error('Erro ao enviar cadastro:', error);

      setSubmitStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (!document.querySelector('form[name="cadastro"]').reportValidity()) {
      toast.error("Por favor, preencha todos os campos corretamente antes de continuar.", TOAST_CONFIG);
      return;
    }

    setStep(prev => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  useEffect(() => {
    if (permissions && !permissions.admin) {
      window.location.href = '/';
    }
  }, [permissions]);

  useEffect(() => {
    scrollTo(0, 0);
  }, [step]);

  useEffect(() => {
    fetcher.get('/categorias')
      .then(response => {
        if (response.data && response.data.data) {
          setCategorias(response.data.data);
        }
      })
      .catch(error => {
        console.error("Erro ao buscar categorias:", error);
      });

    fetcher.get('/cidades')
      .then(response => {
        if (response.data && response.data.data) {
          setCidades(response.data.data);
        }
      })
      .catch(error => {
        console.error("Erro ao buscar cidades:", error);
      });
  }, []);

  return (
    <div className={styles.container}>
      <Header permissions={permissions} />

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
              <span>Documentos</span>
            </div>
          </div>

          <form name='cadastro' onSubmit={handleSubmit} className={styles.form}>
            {step === 1 && (
              <div className={styles.formSection}>
                <h2 className={styles.sectionTitle}>Informações da ONG</h2>

                <div className={styles.formGroup}>
                  <label htmlFor="nome">Nome da ONG *</label>
                  <input
                    type="text"
                    id="nome"
                    name="nome"
                    value={formData.nome}
                    onChange={handleInputChange}
                    required
                    placeholder="Digite o nome completo da ONG"
                  />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="cnpj">CNPJ *</label>
                    <IMaskInput
                      type="text"
                      id="cnpj"
                      name="cnpj"
                      value={formData.cnpj}
                      onAccept={(value) => handleInputChange({ target: { name: "cnpj", value } })}
                      required
                      placeholder="00.000.000/0000-00"
                      unmask={true}
                      mask="00.000.000/0000-00"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="telefone">Telefone *</label>
                    <IMaskInput
                      type="tel"
                      id="telefone"
                      name="telefone"
                      value={formData.telefone}
                      onAccept={(value) => handleInputChange({ target: { name: "telefone", value } })}
                      required
                      mask="(00) 00000-0000"
                      unmask={true}
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
                  <label htmlFor="id_categoria">Categoria *</label>
                  <select
                    id="id_categoria"
                    name="id_categoria"
                    value={formData.id_categoria}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Selecione uma categoria</option>
                    {categorias.map(cat => (
                      <option key={cat.id_categoria} value={cat.id_categoria}>{cat.nome}</option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="descricao">Descrição das Atividades</label>
                  <textarea
                    id="descricao"
                    name="descricao"
                    value={formData.descricao}
                    onChange={handleInputChange}
                    rows="5"
                    placeholder="Descreva as atividades e objetivos da sua ONG..."
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="chave_pix">Chave PIX</label>
                  <input
                    type="text"
                    id="chave_pix"
                    name="chave_pix"
                    value={formData.chave_pix}
                    onChange={handleInputChange}
                    placeholder="Email, telefone, CPF/CNPJ ou chave aleatória"
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className={styles.formSection}>
                <h2 className={styles.sectionTitle}>Endereço da Sede</h2>

                <div className={styles.formRow}>
                  <div className={styles.formGroup} style={{ flex: '3' }}>
                    <label htmlFor="endereco">Rua/Avenida *</label>
                    <input
                      type="text"
                      id="endereco"
                      name="endereco"
                      value={formData.endereco}
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
                    <label htmlFor="bairro">Bairro *</label>
                    <input
                      type="text"
                      id="bairro"
                      name="bairro"
                      value={formData.bairro}
                      onChange={handleInputChange}
                      required
                      placeholder="Nome do bairro"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="cep">CEP *</label>
                    <IMaskInput
                      type="text"
                      id="cep"
                      name="cep"
                      value={formData.cep}
                      onAccept={(value) => handleInputChange({ target: { name: "cep", value } })}
                      required
                      mask="00000-000"
                      unmask={true}
                      placeholder="00000-000"
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="id_cidade">Cidade *</label>
                    <select
                      id="id_cidade"
                      name="id_cidade"
                      value={formData.id_cidade}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Selecione uma cidade</option>
                      {cidades.map(cidade => (
                        <option key={cidade.id_cidade} value={cidade.id_cidade}>
                          {cidade.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className={styles.formSection}>
                <h2 className={styles.sectionTitle}>Documentos e Imagens</h2>

                <div className={styles.infoBox}>
                  <p>Os documentos serão usados apenas para validação do cadastro de forma com que seja possível manter a segurança no site. Suas informações jamais serão compartilhadas de qualquer maneira.</p>
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
                      name="logo"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'logo')}
                    />
                  </div>

                  <div className={styles.fileUpload}>
                    <label htmlFor="banner">
                      <Image size={24} />
                      <span>Foto da Fachada/Sede</span>
                      {files.banner && <span className={styles.fileName}>{files.banner.name}</span>}
                    </label>
                    <input
                      type="file"
                      id="banner"
                      name="banner"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'banner')}
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
                      name="doc_cnpj"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange(e, 'doc_cnpj')}
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
                      name="doc_estatuto"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange(e, 'doc_estatuto')}
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
                      name="doc_comprovante_endereco"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange(e, 'doc_comprovante_endereco')}
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
                      name="doc_identidade_responsavel"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange(e, 'doc_identidade_responsavel')}
                    />
                  </div>
                </div>
              </div>
            )}

            {submitStatus === 'success' && (
              <div className={styles.successMessage}>
                <CheckCircle size={48} />
                <h3>Cadastro Enviado com Sucesso!</h3>
                <p>Seu cadastro foi enviado para análise dos administradores.</p>
                <p>Acompanhe o andamento da sua solicitação na página inicial do SMOV.</p>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className={styles.errorMessage}>
                <AlertCircle size={48} />
                <h3>Erro ao Enviar Cadastro</h3>
                <p>Ocorreu um erro ao enviar seu cadastro. Por favor, tente novamente.</p>
              </div>
            )}

            {submitStatus !== 'success' && (
              <div className={styles.formActions}>
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={prevStep}
                    className={styles.btnSecondary}
                    disabled={loading}
                  >
                    Voltar
                  </button>
                ) : (
                  <div></div>
                )
                }

                {step < 3 ? (
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
                    disabled={loading || !files.doc_cnpj || !files.doc_estatuto || !files.doc_comprovante_endereco || !files.doc_identidade_responsavel}
                  >
                    {loading ? 'Enviando...' : 'Enviar Cadastro'}
                  </button>
                )}
              </div>
            )}
          </form>
        </div>
      </main>

      <Footer />

      <ToastContainer />
    </div>
  );
}


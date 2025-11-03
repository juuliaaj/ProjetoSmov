import { useState, useEffect, useCallback } from "react";
import { useParams } from 'react-router-dom';
import { Calendar, Globe, Mail, Phone, Tag, Edit, Save, X, Camera, Heart, ExternalLink, CreditCard } from "lucide-react";
import { IMaskInput } from "react-imask";
import { toast, ToastContainer } from "react-toastify";
import { TOAST_CONFIG } from "../utils/toast";
import fetcher from '../utils/fetcher';
import supabase from '../utils/supabase';
import styles from './OngsProfile.module.css';
import Footer from '../components/Footer';
import Header from '../components/Header';
import usePermissions from "../hooks/usePermissions";
import { Dialog, DialogTitle, DialogContent } from '@mui/material';

import QrCode from 'react-qr-code';
import { PixBR } from 'pixbrasil';

function OngsProfile() {
  const [permissions] = usePermissions();
  const [isEditing, setIsEditing] = useState(false);
  const [ongId, setOngId] = useState(null);
  const [ongData, setOngData] = useState({
    name: '',
    logo: null,
    altIcon: '',
    coverImage: '',
    foundedDate: '',
    website: '',
    category: {
      name: '',
      value: null
    },
    description: '',
    email: '',
    phone: '',
    chave_pix: '',
    verificada: false,
    horarios: [],
  });
  
  const [editedData, setEditedData] = useState(null);
  const [previewCover, setPreviewCover] = useState(null);
  const [previewLogo, setPreviewLogo] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [categorias, setCategorias] = useState(null);
  const [openDonation, setOpenDonation] = useState(false);
  const [pixQR, setPixQR] = useState(null);
  const params = useParams();

  const fetchCategorias = useCallback(async () => {
    try {
      const response = await fetcher.get('/categorias');
      setCategorias(response.data?.data || []);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
    }
  }, []);

  useEffect(() => {
    fetchCategorias();
  }, [fetchCategorias]);

  useEffect(() => {
    const pixCode = PixBR({
      key: ongData.chave_pix,
      name: ongData.name,
    })

    setPixQR(pixCode);
  }, [ongData.chave_pix, ongData.name]);

  useEffect(() => {
    if (!params) return;

    const ongId = params.id;

    fetcher.get('/instituicoes', { params: { id: ongId, isProfile: '1' } })
      .then((response) => {
        const data = response.data.data;

        if (!data) {
          console.error('Erro ao carregar as informações da ONG');
          return;
        }

        if (!data.length) {
          console.error('ONG não encontrada');
          return;
        }

        const instituicao = data[0];

        setOngId(instituicao.id_instituicao);

        let altIcon = '';
        const nameParts = String(instituicao.nome).split(' ').map(s => s[0].toUpperCase());

        if (nameParts.length > 2) {
          altIcon = nameParts[0] + nameParts[nameParts.length - 1];
        } else {
          altIcon = nameParts.join('');
        }

        if (instituicao.data_fundacao) {
          const [ano, mes, dia] = instituicao.data_fundacao.split('-');
          instituicao.data_fundacao = `${dia}/${mes}/${ano}`; 
        }

        setOngData({
          name: instituicao.nome,
          logo: instituicao.logo_url ?? null,
          altIcon: altIcon,
          coverImage: instituicao.banner_url ?? '',
          foundedDate: instituicao.data_fundacao ?? '',
          website: instituicao.site ?? '',
          category: {
            name: instituicao.instituicoes_categorias[0]?.categorias?.nome,
            value: instituicao.instituicoes_categorias[0]?.categorias?.id_categoria
          },
          description: instituicao.descricao ?? '',
          email: instituicao.email ?? '',
          phone: instituicao.telefone ?? '',
          chave_pix: instituicao.chave_pix ?? '',
          verificada: !!instituicao.id_usuario,
          horarios: instituicao.instituicoes_horarios
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }, [params]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedData(ongData);
  };

  const handleSave = async () => {
    const editData = { ...editedData };
    
    if (coverFile) {
      const { url } = await uploadFile(coverFile, 'covers');
      editData.coverImage = url;
    }

    if (logoFile) {
      const { url } = await uploadFile(logoFile, 'logos');
      editData.logo = url;
    }

    fetcher.put('/instituicoes', {
      id_instituicao: ongId,
      data_fundacao: editData.foundedDate,
      descricao: editData.description,
      id_categoria: editData.category.value,
      site: editData.website,
      email: editData.email,
      telefone: editData.phone,
      logo_url: editData.logo,
      banner_url: editData.coverImage,
      chave_pix: editData.chave_pix,
      horarios: editData.horarios
    })
      .then(() => {
        editData.category.name = categorias.find((c) => c.id_categoria == editData.category.value).nome;

        setOngData(editData);
        toast.success("Perfil da ONG atualizado com sucesso!", TOAST_CONFIG);
      })
      .catch((err) => {
        console.error(err);
        toast.error('Ocorreu um erro ao tentar salvar o perfil.', TOAST_CONFIG);
      })
      .finally(() => {
        setIsEditing(false);
        setPreviewCover(null);
        setPreviewLogo(null);
      });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedData(null);
    setPreviewCover(null);
    setPreviewLogo(null);
    setCoverFile(null);
    setLogoFile(null);
  };

  const handleCoverChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewCover(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewLogo(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadFile = async (file, folder) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    const filePath = `ongs/${folder}/${fileName}`;
    
    const { error } = await supabase.storage
      .from('smov')
      .upload(filePath, file);
    
    if (error) throw error;
    
    const { data: urlData } = supabase.storage
      .from('smov')
      .getPublicUrl(filePath);
    
    return { path: filePath, url: urlData.publicUrl };
  };

  const canEdit = permissions && permissions.id_instituicao == ongId;

  const diasSemana = [
    { diaSemana: 0, name: 'Domingo', alt: 'DOM' },
    { diaSemana: 1, name: 'Segunda-Feira', alt: 'SEG' },
    { diaSemana: 2, name: 'Terça-Feira', alt: 'TER' },
    { diaSemana: 3, name: 'Quarta-Feira', alt: 'QUA' },
    { diaSemana: 4, name: 'Quinta-Feira', alt: 'QUI' },
    { diaSemana: 5, name: 'Sexta-Feira', alt: 'SEX' },
    { diaSemana: 6, name: 'Sábado', alt: 'SAB' },
  ]

  return (
    <div className={styles.container}>
      <Header permissions={permissions} />

      <main className={styles.main}>
        { (isEditing || previewCover || ongData.coverImage) && (
          <div className={styles.coverImageWrapper}>
            <div className={styles.coverImage}>
              <div className={styles.imageOverlay}></div>
              { (previewCover || ongData.coverImage) && (
                <img 
                  src={previewCover || ongData.coverImage} 
                  alt="Cover" 
                />
              ) }
            </div>
            
            {isEditing && (
              <label className={styles.coverEdit}>
                <Camera className={styles.coverEditIcon} />
                <span>Alterar Capa</span>
                <input
                  type="file"
                  accept="image/*"
                  className={styles.fileInput}
                  onChange={handleCoverChange}
                />
              </label>
            )}
          </div>
        ) }

        <div className={styles.profileSection}>
          <div className={styles.leftPanel}>
            <div className={styles.logoWrapper}>
              <div className={styles.logoCircle}>
                <div className={styles.glowEffect}></div>
                <div className={styles.logoIcon}>
                  {(previewLogo || ongData.logo) ? (
                    <img 
                      src={previewLogo || ongData.logo} 
                      alt={ongData.name}
                      className={styles.logoImage}
                    />
                  ) : (
                    <div className={styles.userProfile__avatarPlaceholder}>
                      {ongData.altIcon}
                    </div>
                  )}
                </div>
              </div>
              
              {isEditing && (
                <label className={styles.logoEdit}>
                  <Camera className={styles.logoEditIcon} />
                  <input
                    type="file"
                    accept="image/*"
                    className={styles.fileInput}
                    onChange={handleLogoChange}
                  />
                </label>
              )}
            </div>

            <div className={styles.statsCard}>
              { (isEditing || !!ongData.foundedDate) && (
                <div className={styles.infoItem}>
                  <div className={styles.iconWrapper}>
                    <Calendar className={styles.icon} />
                  </div>
                  <div className={styles.infoContent}>
                    <span className={styles.infoLabel}>Fundada em</span>
                    {isEditing ? (
                      <IMaskInput
                        type="text"
                        value={editedData.foundedDate}
                        onAccept={(value) => setEditedData({ ...editedData, foundedDate: value })}
                        mask="00/00/0000"
                        unmask={false}
                        placeholder="DD/MM/AAAA"
                        className={styles.infoInput}
                      />
                    ) : !!ongData.foundedDate && (
                      <span className={styles.infoText}>{ongData.foundedDate}</span>
                    )}
                  </div>
                </div>
              ) }

              { (isEditing || ongData?.category?.value) && (
                <div className={styles.infoItem}>
                  <div className={styles.iconWrapper}>
                    <Tag className={styles.icon} />
                  </div>
                  <div className={styles.infoContent}>
                    <span className={styles.infoLabel}>Categoria</span>
                    {isEditing ? (
                      <select
                        value={editedData.category.value}
                        onChange={(e) => setEditedData({ ...editedData, category: { ...editedData.category, value: e.target.value } })}
                        className={styles.infoInput}
                      >
                        {categorias.map((e) => (
                          <option value={e.id_categoria}>{e.nome}</option>
                        ))}
                      </select>
                    ) : (
                      <span className={styles.infoText}>{ongData.category.name || ''}</span>
                    )}
                  </div>
                </div>
              ) }

              { (isEditing || !!ongData.website) && (
                <div className={styles.infoItem}>
                  <div className={styles.iconWrapper}>
                    <Globe className={styles.icon} />
                  </div>
                  <div className={styles.infoContent}>
                    <span className={styles.infoLabel}>Website</span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedData.website}
                        onChange={(e) => setEditedData({ ...editedData, website: e.target.value })}
                        className={styles.infoInput}
                        placeholder="Ex: Humanitária"
                      />
                    ) : (
                      <span className={styles.infoText}>{ongData.website}</span>
                    )}
                  </div>
                </div>
              ) }

              { (isEditing || !!ongData.email) && (
                <div className={styles.infoItem}>
                  <div className={styles.iconWrapper}>
                    <Mail className={styles.icon} />
                  </div>
                  <div className={styles.infoContent}>
                    <span className={styles.infoLabel}>E-mail</span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedData.email}
                        onChange={(e) => setEditedData({ ...editedData, email: e.target.value })}
                        className={styles.infoInput}
                        placeholder="seu@email.com"
                      />
                    ) : (
                      <span className={styles.infoText}>{ongData.email}</span>
                    )}
                  </div>
                </div>
              ) }

              { (isEditing || !!ongData.phone) && (
                <div className={styles.infoItem}>
                  <div className={styles.iconWrapper}>
                    <Phone className={styles.icon} />
                  </div>
                  <div className={styles.infoContent}>
                    <span className={styles.infoLabel}>Telefone</span>
                    {isEditing ? (
                      <IMaskInput
                        type="tel"
                        id="phone"
                        name="phone"
                        value={editedData.phone}
                        onAccept={(value) => setEditedData({ ...editedData, phone: value })}
                        required
                        mask="(00) 00000-0000"
                        unmask={true}
                        placeholder="(00) 00000-0000"
                        className={styles.infoInput}
                      />
                    ) : (
                      <span className={styles.infoText}>{String(ongData.phone).replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3")}</span>
                    )}
                  </div>
                </div>
              ) }

              { isEditing && (
                <div className={styles.infoItem}>
                  <div className={styles.iconWrapper}>
                    <CreditCard className={styles.icon} />
                  </div>
                  <div className={styles.infoContent}>
                    <span className={styles.infoLabel}>Chave PIX</span>
                      <input
                        type="text"
                        value={editedData.chave_pix}
                        onChange={(e) => setEditedData({ ...editedData, chave_pix: e.target.value })}
                        className={styles.infoInput}
                        placeholder="+5551999999999"
                      />
                  </div>
                </div>
              ) }

              {canEdit && !isEditing && (
                <button
                  onClick={handleEdit}
                  className={styles.btnEdit}
                >
                  <Edit className={styles.btnIcon} />
                  <span>Editar Perfil</span>
                </button>
              )}

              {isEditing && (
                <div className={styles.editActions}>
                  <button
                    onClick={handleSave}
                    className={styles.btnSave}
                  >
                    <Save className={styles.btnIcon} />
                    <span>Salvar</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    className={styles.btnCancel}
                  >
                    <X className={styles.btnIcon} />
                    <span>Cancelar</span>
                  </button>
                </div>
              )}
            </div>

            {!isEditing && (
              <>
                <div className={styles.buttonGroup}>
                  { !!ongData.chave_pix && (
                    <button className={styles.btnDonate} onClick={() => setOpenDonation(true)}>
                      <Heart className={styles.btnIcon} />
                      <span>DOAR</span>
                    </button>
                  ) }
                  { ongData.verificada && (
                    <button
                      className={styles.btnVisit}
                      onClick={() => {
                        if (!ongId || !document || !window) return;

                        const url = document.location.origin + '/reservas?id_ong=' + ongId;

                        window.location.href = url;
                      }}
                    >
                      <ExternalLink className={styles.btnIcon} />
                      <span>VISITAR</span>
                    </button>
                  ) }
                </div>
              </>
            )}
          </div>

          <div className={styles.rightPanel}>
            <div className={styles.contentArea}>
              <div className={styles.titleSection}>
                {isEditing && !isEditing ? (
                  <input
                    type="text"
                    value={editedData.name}
                    onChange={(e) => setEditedData({ ...editedData, name: e.target.value })}
                    className={styles.titleInput}
                    placeholder="Nome da ONG"
                  />
                ) : (
                  <>
                    <h1 className={styles.title}>{ongData.name}</h1>
                    <div className={styles.titleUnderline}></div>
                  </>
                )}
              </div>

              <div className={styles.description}>
                {isEditing ? (
                  <textarea
                    value={editedData.description}
                    onChange={(e) => setEditedData({ ...editedData, description: e.target.value })}
                    className={styles.descriptionTextarea}
                    placeholder="Conte sobre a história, missão e impacto da ONG..."
                    rows="12"
                  />
                ) : !!ongData.description && (
                    <p className={styles.paragraph}>{ongData.description}</p>
                )}
              </div>

              { ongData.verificada && (
                <>
                  <h2 style={{ margin: 0 }}>Horários de Reserva</h2>
                  <table className={styles.tableHorarios}>
                    <thead>
                      <tr>
                        <th>Dia</th>
                        <th>Horário Inicial</th>
                        <th>Horário Final</th>
                      </tr>
                    </thead>
                    <tbody>
                      {diasSemana.map((d) => {
                        // Use a stable source of horarios depending on edit state
                        const horariosOrigem = isEditing ? editedData?.horarios : ongData?.horarios;
                        const horario = horariosOrigem?.find((h) => h.dia_semana === d.diaSemana);

                        return (
                          <tr key={d.diaSemana}>
                            <td>{d.alt}</td>

                            <td>
                              {isEditing ? (
                                <input
                                  type="time"
                                  value={horario?.horario_inicial || ''}
                                  onChange={(e) => {
                                    const updatedHorarios = [...(editedData?.horarios || [])];
                                    const existingIndex = updatedHorarios.findIndex(
                                      (h) => h.dia_semana === d.diaSemana
                                    );

                                    const updatedItem = {
                                      ...(existingIndex !== -1 ? updatedHorarios[existingIndex] : {}),
                                      dia_semana: d.diaSemana,
                                      horario_inicial: e.target.value,
                                    };

                                    if (existingIndex !== -1) {
                                      updatedHorarios[existingIndex] = updatedItem;
                                    } else {
                                      updatedHorarios.push(updatedItem);
                                    }

                                    setEditedData((prev) => ({
                                      ...prev,
                                      horarios: updatedHorarios,
                                    }));
                                  }}
                                  className={styles.tableInput}
                                />
                              ) : (
                                <span className={styles.tableText}>
                                  {horario?.horario_inicial?.substring(0, 5) || ''}
                                </span>
                              )}
                            </td>

                            <td>
                              {isEditing ? (
                                <input
                                  type="time"
                                  value={horario?.horario_final || ''}
                                  onChange={(e) => {
                                    const updatedHorarios = [...(editedData?.horarios || [])];
                                    const existingIndex = updatedHorarios.findIndex(
                                      (h) => h.dia_semana === d.diaSemana
                                    );

                                    const updatedItem = {
                                      ...(existingIndex !== -1 ? updatedHorarios[existingIndex] : {}),
                                      dia_semana: d.diaSemana,
                                      horario_final: e.target.value,
                                    };

                                    if (existingIndex !== -1) {
                                      updatedHorarios[existingIndex] = updatedItem;
                                    } else {
                                      updatedHorarios.push(updatedItem);
                                    }

                                    setEditedData((prev) => ({
                                      ...prev,
                                      horarios: updatedHorarios,
                                    }));
                                  }}
                                  className={styles.tableInput}
                                />
                              ) : (
                                <span className={styles.tableText}>
                                  {horario?.horario_final?.substring(0, 5) || ''}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </>
              ) }
            </div>
          </div>
        </div>
      </main>
      
      <Footer />

      <Dialog open={!!openDonation} onClose={() => setOpenDonation(false)}>
          <DialogTitle>Fazer uma doação</DialogTitle>
          <DialogContent>
              <QrCode value={pixQR} style={{ padding: '3px', background: '#fff' }}></QrCode>
          </DialogContent>
      </Dialog>

      <ToastContainer />
    </div>
  );
}

export default OngsProfile;
